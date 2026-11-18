'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { CustomerUser } from '@/lib/types/ecommerce'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

export type AuthTab = 'login' | 'register' | 'forgot' | 'google' | 'phone'

interface AuthContextType {
  user: CustomerUser | null
  supabaseUser: SupabaseUser | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  isSupabaseReady: boolean
  isAuthModalOpen: boolean
  authModalTab: AuthTab
  openAuthModal: (tab?: AuthTab) => void
  closeAuthModal: () => void
  // Real Supabase Auth Methods
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUpWithEmail: (
    name: string,
    email: string,
    password: string,
    clinicName?: string
  ) => Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<CustomerUser>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'nv_customer_session_v3'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSupabaseReady, setIsSupabaseReady] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<AuthTab>('login')

  // Synchronize authenticated Supabase user with application customer database
  const syncCustomerToDatabase = useCallback(
    async (
      sUser: SupabaseUser,
      clinicName?: string
    ): Promise<CustomerUser | null> => {
      try {
        const payload = {
          supabaseUid: sUser.id,
          name:
            sUser.user_metadata?.name ||
            sUser.user_metadata?.full_name ||
            (sUser.email ? sUser.email.split('@')[0] : 'Clinical Member'),
          email: sUser.email || undefined,
          phone: sUser.phone || undefined,
          photoURL: sUser.user_metadata?.avatar_url || undefined,
          provider: 'supabase',
          clinicName: clinicName || sUser.user_metadata?.clinic_name || undefined,
        }

        const res = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          console.error('[AUTH SYNC] Server returned error status:', res.status)
          return null
        }

        const data = await res.json()
        if (data.success && data.customer) {
          setUser(data.customer)
          try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.customer))
          } catch (e) {
            console.warn('[AUTH CACHE] Could not cache session:', e)
          }
          return data.customer
        }
      } catch (err) {
        console.error('[AUTH SYNC EXCEPTION]', err)
      }
      return null
    },
    []
  )

  // Listen to live Supabase Auth state changes & restore session
  useEffect(() => {
    const configured = isSupabaseConfigured()
    setIsSupabaseReady(configured)

    // Restore cached session if available while connecting to Supabase
    try {
      const cached = localStorage.getItem(AUTH_STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed?.id || parsed?.supabaseUid) {
          setUser(parsed)
        }
      }
    } catch (e) {
      console.warn('[AUTH CACHE READ]', e)
    }

    if (!configured) {
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    // 1. Get initial session
    supabase.auth
      .getSession()
      .then(async (res: { data: { session: Session | null } }) => {
        const initSession = res.data.session
        setSession(initSession)
        if (initSession?.user) {
          setSupabaseUser(initSession.user)
          await syncCustomerToDatabase(initSession.user)
        }
      })
      .catch((err: unknown) => {
        console.warn('[SUPABASE INITIAL SESSION ERROR]', err)
      })
      .finally(() => {
        setIsLoading(false)
      })

    // 2. Listen to real-time auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, currentSession: Session | null) => {
      setSession(currentSession)
      setSupabaseUser(currentSession?.user || null)

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (currentSession?.user) {
          await syncCustomerToDatabase(currentSession.user)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setSupabaseUser(null)
        try {
          localStorage.removeItem(AUTH_STORAGE_KEY)
        } catch {}
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [syncCustomerToDatabase])

  const openAuthModal = useCallback((tab: AuthTab = 'login') => {
    setAuthModalTab(tab === 'phone' ? 'login' : tab)
    setIsAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false)
  }, [])

  // 1. Real Email & Password Login
  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' }
    }

    const supabase = createClient()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        await syncCustomerToDatabase(data.user)
        closeAuthModal()
        return { success: true }
      }
      return { success: false, error: 'Could not authenticate practitioner.' }
    } catch (err: any) {
      console.error('[SUPABASE SIGN IN EXCEPTION]', err)
      return { success: false, error: err.message || 'Authentication failed. Please verify credentials.' }
    }
  }

  // 2. Real Email & Password Registration
  const signUpWithEmail = async (
    name: string,
    email: string,
    password: string,
    clinicName?: string
  ): Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }> => {
    if (!name || !email || !password) {
      return { success: false, error: 'Name, email, and password are required.' }
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' }
    }

    const supabase = createClient()
    try {
      const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
            clinic_name: clinicName?.trim() || '',
          },
          emailRedirectTo: `${siteUrl}/account`,
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Check if user session was immediately created (mailer autoconfirm on) or needs verification
        const needsConfirmation = data.user.identities?.length === 0 || !data.session

        await syncCustomerToDatabase(data.user, clinicName)
        if (!needsConfirmation) {
          closeAuthModal()
        }
        return { success: true, requiresEmailConfirmation: needsConfirmation }
      }

      return { success: false, error: 'Registration could not be completed.' }
    } catch (err: any) {
      console.error('[SUPABASE SIGN UP EXCEPTION]', err)
      return { success: false, error: err.message || 'Registration failed.' }
    }
  }

  // 3. Real Password Reset
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid clinical email address.' }
    }

    const supabase = createClient()
    try {
      const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${siteUrl}/account?reset=true`,
      })

      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (err: any) {
      console.error('[SUPABASE PASSWORD RESET EXCEPTION]', err)
      return { success: false, error: err.message || 'Could not send password reset email.' }
    }
  }

  // 4. Real Google OAuth via Supabase
  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    const supabase = createClient()
    try {
      const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/account`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (err: any) {
      console.error('[SUPABASE GOOGLE OAUTH EXCEPTION]', err)
      return { success: false, error: err.message || 'Google OAuth failed to initialize.' }
    }
  }

  // 5. Real Logout
  const logout = async (): Promise<void> => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('[AUTH LOGOUT WARNING]', e)
    } finally {
      setUser(null)
      setSupabaseUser(null)
      setSession(null)
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      } catch {}
    }
  }

  // 6. Update Practice Profile
  const updateProfile = async (updates: Partial<CustomerUser>): Promise<boolean> => {
    if (!user) return false
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, ...updates }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.customer) {
          setUser(data.customer)
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.customer))
          return true
        }
      }
    } catch (e) {
      console.error('[AUTH UPDATE PROFILE ERROR]', e)
    }
    return false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isAuthenticated: Boolean(user),
        isLoading,
        isSupabaseReady,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signInWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
