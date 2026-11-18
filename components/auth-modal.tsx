'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Mail,
  Lock,
  User,
  Building,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react'
import { useAuth } from '@/lib/ecommerce/auth-context'

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signInWithGoogle,
    isSupabaseReady,
  } = useAuth()

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  // Reset or initialize tab when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setError(null)
      setSuccessMsg(null)
      setNeedsConfirmation(false)
      if (authModalTab === 'register') {
        setActiveTab('register')
      } else if (authModalTab === 'forgot') {
        setActiveTab('forgot')
      } else {
        setActiveTab('login')
      }
    }
  }, [isAuthModalOpen, authModalTab])

  // 1. Email & Password Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await signInWithEmail(email, password)
    setLoading(false)

    if (!res.success) {
      setError(res.error || 'Invalid email or password.')
    }
  }

  // 2. Email & Password Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await signUpWithEmail(name, email, password, clinicName)
    setLoading(false)

    if (res.success) {
      if (res.requiresEmailConfirmation) {
        setNeedsConfirmation(true)
      }
    } else {
      setError(res.error || 'Registration failed. Please try again.')
    }
  }

  // 3. Password Reset
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await resetPassword(email)
    setLoading(false)

    if (res.success) {
      setSuccessMsg(
        'Password reset link dispatched. Please check your clinical inbox and spam folder.'
      )
    } else {
      setError(res.error || 'Could not send reset link.')
    }
  }

  // 4. Google OAuth
  const handleGoogleClick = async () => {
    setError(null)
    setLoading(true)
    const res = await signInWithGoogle()
    setLoading(false)
    if (!res.success) {
      setError(res.error || 'Google authentication failed.')
    }
  }

  if (!isAuthModalOpen) return null

  return (
    <AnimatePresence>
      <div className="auth-modal-overlay">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="auth-modal-backdrop"
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="auth-modal-dialog"
          role="dialog"
          aria-label="Clinical Customer Authentication"
        >
          {/* Header */}
          <div className="auth-modal-top">
            <div className="auth-modal-brand">
              <span className="auth-logo-badge">NV</span>
              <div>
                <span className="auth-brand-title">NEW VISION DENTAL</span>
                <span className="auth-brand-tag">PRACTITIONER PORTAL</span>
              </div>
            </div>
            <button
              onClick={closeAuthModal}
              className="auth-modal-close"
              aria-label="Close authentication modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Heading */}
          <div className="auth-modal-intro">
            <h2>
              {activeTab === 'login'
                ? 'Welcome Back, Doctor'
                : activeTab === 'register'
                ? 'Register Dental Practice'
                : 'Reset Password'}
            </h2>
            <p>
              {activeTab === 'login'
                ? 'Access your clinical order history, proforma invoices, and saved equipment.'
                : activeTab === 'register'
                ? 'Create a verified practitioner account for institutional dental equipment requisitions.'
                : 'Enter your registered practice email to receive a secure password reset link.'}
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="auth-error-box" role="alert">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-success-box" role="status">
              <CheckCircle2 size={17} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email Confirmation Notice Screen */}
          {needsConfirmation ? (
            <div className="email-sent-card">
              <CheckCircle2 size={42} className="email-sent-icon" />
              <h4>Verification Email Dispatched</h4>
              <p>
                We have sent an account confirmation email to <strong>{email}</strong>. Please click
                the link in your inbox to verify your practice ownership and complete your login.
              </p>
              <button
                type="button"
                onClick={() => {
                  setNeedsConfirmation(false)
                  setActiveTab('login')
                }}
                className="btn-account-signin"
                style={{ marginTop: '14px' }}
              >
                Proceed to Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Tab Selector (Sign In vs Register) */}
              {activeTab !== 'forgot' && (
                <div className="auth-tabs-row">
                  <button
                    type="button"
                    className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('login')
                      setError(null)
                    }}
                  >
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('register')
                      setError(null)
                    }}
                  >
                    <span>Create Account</span>
                  </button>
                </div>
              )}

              {/* TAB 1: LOGIN */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="auth-form">
                  <div className="auth-field-group">
                    <label>Practice Email</label>
                    <div className="auth-input-wrap">
                      <Mail size={16} />
                      <input
                        type="email"
                        placeholder="doctor@yourclinic.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <div className="label-with-action">
                      <label>Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('forgot')
                          setError(null)
                          setSuccessMsg(null)
                        }}
                        className="forgot-link-btn"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="auth-input-wrap">
                      <Lock size={16} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn-toggle-eye"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="auth-primary-submit-btn"
                  >
                    {loading ? (
                      <span className="btn-spinner">
                        <RefreshCw size={16} className="spin-icon" /> Authenticating...
                      </span>
                    ) : (
                      <>
                        <span>Sign In to Practice Portal</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: REGISTER */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="auth-form">
                  <div className="auth-field-group">
                    <label>Practitioner Full Name</label>
                    <div className="auth-input-wrap">
                      <User size={16} />
                      <input
                        type="text"
                        placeholder="Dr. Senthil Kumar, BDS"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label>Dental Clinic / Practice Name</label>
                    <div className="auth-input-wrap">
                      <Building size={16} />
                      <input
                        type="text"
                        placeholder="e.g. Apex Speciality Dental Care"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label>Official Practice Email</label>
                    <div className="auth-input-wrap">
                      <Mail size={16} />
                      <input
                        type="email"
                        placeholder="doctor@apexclinic.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label>Password (Min. 6 characters)</label>
                    <div className="auth-input-wrap">
                      <Lock size={16} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn-toggle-eye"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !name || !email || !password}
                    className="auth-primary-submit-btn"
                  >
                    {loading ? (
                      <span className="btn-spinner">
                        <RefreshCw size={16} className="spin-icon" /> Creating Account...
                      </span>
                    ) : (
                      <>
                        <span>Register Practice Account</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 3: FORGOT PASSWORD */}
              {activeTab === 'forgot' && (
                <form onSubmit={handleForgotSubmit} className="auth-form">
                  <div className="auth-field-group">
                    <label>Registered Practice Email</label>
                    <div className="auth-input-wrap">
                      <Mail size={16} />
                      <input
                        type="email"
                        placeholder="doctor@yourclinic.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="auth-primary-submit-btn"
                  >
                    {loading ? (
                      <span className="btn-spinner">
                        <RefreshCw size={16} className="spin-icon" /> Sending Link...
                      </span>
                    ) : (
                      <>
                        <span>Send Password Reset Link</span>
                        <KeyRound size={16} />
                      </>
                    )}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('login')
                        setError(null)
                        setSuccessMsg(null)
                      }}
                      className="forgot-link-btn"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Optional: Google Sign-in */}
              {activeTab !== 'forgot' && (
                <>
                  <div className="auth-divider">
                    <span>or continue with Google</span>
                  </div>

                  <div className="auth-google-section">
                    <button
                      type="button"
                      onClick={handleGoogleClick}
                      disabled={loading}
                      className="auth-google-btn"
                    >
                      <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Security & Terms Footer */}
          <div className="auth-modal-footer">
            <div className="auth-security-badge">
              <Lock size={13} />
              <span>Protected by Supabase Row-Level Security</span>
            </div>
            <p className="auth-legal-text">
              By proceeding, you agree to New Vision Dental Products{' '}
              <a href="/terms" target="_blank">
                Terms of Supply
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
