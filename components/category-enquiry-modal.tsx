'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, CheckCircle2, Phone, Mail, User, Building, MapPin } from 'lucide-react'
import { CategoryInfo } from '@/lib/types/ecommerce'

interface CategoryEnquiryModalProps {
  category: CategoryInfo
  isOpen: boolean
  onClose: () => void
  productName?: string
}

export function CategoryEnquiryModal({
  category,
  isOpen,
  onClose,
  productName,
}: CategoryEnquiryModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(
    productName
      ? `Hello New Vision team, I would like to request quotation and stock availability for ${productName}.`
      : `Hello New Vision team, I am equipping my practice and would like specifications, recommendations, and pricing for your ${category.title} collection.`
  )
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          city,
          email,
          message: `[CATEGORY: ${category.title.toUpperCase()}${productName ? ` | PRODUCT: ${productName}` : ''}] ${message}`,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSubmitted(true)
      } else {
        setError(data.error || 'Failed to submit enquiry. Please try again.')
      }
    } catch (err) {
      console.error('[ENQUIRY SUBMIT ERROR]', err)
      setError('A network error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="enquiry-modal-backdrop"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="enquiry-modal-box"
            role="dialog"
            aria-label={`Enquire about ${category.title}`}
          >
            <div className="enquiry-modal-header">
              <div className="enquiry-header-info">
                <span className="enquiry-eyebrow">PRACTICE CONSULTATION & QUOTE</span>
                <h3>
                  Enquire About <em>{category.title}</em>
                </h3>
              </div>
              <button
                onClick={onClose}
                className="enquiry-modal-close"
                aria-label="Close enquiry modal"
              >
                <X size={18} />
              </button>
            </div>

            {submitted ? (
              <div className="enquiry-success-view">
                <div className="enquiry-success-icon-wrap">
                  <CheckCircle2 size={44} />
                </div>
                <h4>Enquiry Dispatched Successfully</h4>
                <p>
                  Thank you, Doctor. Our Coimbatore equipment specialists have received your
                  requisition for <strong>{category.title}</strong> and will connect with tailored
                  catalogues and institutional pricing within 4 business hours.
                </p>
                <button onClick={onClose} className="enquiry-close-btn">
                  Return to Catalogue
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="enquiry-form">
                {error && <div className="enquiry-error-banner">{error}</div>}

                <div className="enquiry-form-grid">
                  <div className="enquiry-input-field">
                    <label>Clinician / Doctor Name *</label>
                    <div className="enquiry-input-wrap">
                      <User size={15} />
                      <input
                        type="text"
                        required
                        placeholder="Dr. Rajesh Kumar"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="enquiry-input-field">
                    <label>Mobile Number *</label>
                    <div className="enquiry-input-wrap">
                      <Phone size={15} />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="enquiry-input-field">
                    <label>Clinic Location / City *</label>
                    <div className="enquiry-input-wrap">
                      <MapPin size={15} />
                      <input
                        type="text"
                        required
                        placeholder="Coimbatore, Chennai, Bangalore..."
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="enquiry-input-field">
                    <label>Email Address *</label>
                    <div className="enquiry-input-wrap">
                      <Mail size={15} />
                      <input
                        type="email"
                        required
                        placeholder="doctor@clinic.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="enquiry-input-field full-width">
                  <label>Equipment Requirements or Custom Quotation Details *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details on model preferences, quantity, clinic operatory size..."
                  />
                </div>

                <div className="enquiry-submit-row">
                  <p className="enquiry-privacy-note">
                    Direct B2B clinical consultation. We never share your contact information.
                  </p>
                  <button type="submit" disabled={submitting} className="enquiry-submit-button">
                    <span>{submitting ? 'Sending Request...' : 'Send Category Enquiry'}</span>
                    <Send size={15} />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
