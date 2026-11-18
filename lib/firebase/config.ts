'use client'

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('your_api_key')
  )
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let googleProvider: GoogleAuthProvider | null = null

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null
  if (!isFirebaseConfigured()) return null

  if (!app) {
    if (getApps().length > 0) {
      app = getApp()
    } else {
      app = initializeApp(firebaseConfig)
    }
  }
  return app
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null
  if (!auth) {
    const currentApp = getFirebaseApp()
    if (!currentApp) return null
    auth = getAuth(currentApp)
    // Configure local persistence across browser sessions
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('[FIREBASE AUTH] Persistence setup warning:', err)
    })
  }
  return auth
}

export function getGoogleProvider(): GoogleAuthProvider {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider()
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    })
  }
  return googleProvider
}

/**
 * Initializes Firebase Phone reCAPTCHA verifier for India (+91) / International phone auth
 */
export function setupRecaptcha(
  containerId: string,
  onSolved?: () => void
): RecaptchaVerifier | null {
  const currentAuth = getFirebaseAuth()
  if (!currentAuth || typeof window === 'undefined') return null

  try {
    const container = document.getElementById(containerId)
    if (!container) {
      console.warn(`[FIREBASE AUTH] Recaptcha container '#${containerId}' not found in DOM`)
      return null
    }

    const verifier = new RecaptchaVerifier(currentAuth, containerId, {
      size: 'invisible',
      callback: () => {
        if (onSolved) onSolved()
      },
      'expired-callback': () => {
        console.warn('[FIREBASE AUTH] reCAPTCHA expired. Resetting.')
      },
    })
    return verifier
  } catch (err) {
    console.error('[FIREBASE AUTH] Failed to setup RecaptchaVerifier:', err)
    return null
  }
}

export {
  signInWithPhoneNumber,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  firebaseSignOut,
}
export type { ConfirmationResult }
