'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Search,
  Heart,
  ShoppingBag,
} from 'lucide-react'
import { BUSINESS_CONFIG } from '@/lib/business-config'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'

// Dynamically import Leaflet Map with SSR disabled
const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
  ssr: false,
  loading: () => (
    <div className="map-skeleton-loader">
      <div className="map-loading-spinner" />
      <p>Initializing Coimbatore Studio Map...</p>
    </div>
  ),
})

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function ContactContent() {
  const [menuOpen, setMenuOpen] = useState(false)

  // Enquiry form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (submitError) setSubmitError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit enquiry. Please check fields.')
      }

      setSubmitSuccess(
        data.message ||
          "We'd love to hear from you. Fill out the form below and we will be in touch with you shortly."
      )
      setFormData({
        name: '',
        phone: '',
        city: '',
        email: '',
        message: '',
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message)
      } else {
        setSubmitError('Unable to send enquiry. Please call us directly or retry.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="contact-page-root">
      {/* Site Header / Navigation */}
      <SiteHeader />

      {/* Contact Hero Intro */}
      <section className="contact-hero-intro section-pad">
        <div className="contact-hero-container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.6 }}
          >
            <p className="eyebrow light-eyebrow">
              <span></span> CONTACT & PRACTICE SUPPORT
            </p>
            <h1 className="contact-page-title">
              Connect with our <em>office team.</em>
            </h1>
            <p className="contact-page-subtitle">
              Whether you are equipping a multi-operatory dental clinic, upgrading to 3D imaging,
              or stocking daily consumables, our Coimbatore studio is ready to assist.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. LIVE INTERACTIVE MAP SECTION */}
      <section className="contact-map-section" aria-label="Interactive Location Map">
        <div className="contact-map-header">
          <div className="map-badge">
            <MapPin size={14} className="text-gold" />
            <span>LIVE INTERACTIVE SHOWROOM MAP</span>
          </div>
          <span className="map-coords-note">
            COIMBATORE, TN · 11.0133° N, 76.9654° E
          </span>
        </div>

        <div className="contact-map-frame">
          <InteractiveMap />
        </div>
      </section>

      {/* 5. BUSINESS ADDRESS DISPLAY & 6. ENQUIRY FORM SECTION */}
      <section className="contact-details-grid-section section-pad">
        <div className="contact-two-column-layout">
          {/* Left Column: Dedicated Location Information Area */}
          <motion.div
            className="location-info-panel"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
            transition={{ duration: 0.6 }}
          >
            <div className="location-panel-header">
              <span className="eyebrow gold-eyebrow">OUR LOCATION</span>
              <h2 className="location-business-name">{BUSINESS_CONFIG.name}</h2>
              <div className="location-address-box">
                <MapPin size={20} className="location-icon text-gold" />
                <address className="location-address-text">
                  <strong>{BUSINESS_CONFIG.address.building}</strong>, {BUSINESS_CONFIG.address.street},
                  <br />
                  {BUSINESS_CONFIG.address.area}, {BUSINESS_CONFIG.address.city},
                  <br />
                  {BUSINESS_CONFIG.address.state} {BUSINESS_CONFIG.address.pincode}, {BUSINESS_CONFIG.address.country}.
                </address>
              </div>

              {/* Clickable Get Directions Link */}
              <div className="directions-cta-container">
                <a
                  href={BUSINESS_CONFIG.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="get-directions-primary-link"
                  id="page-get-directions-link"
                >
                  <span>Get Directions on Google Maps</span>
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>

            {/* Quick Contact & Studio Hours */}
            <div className="location-meta-grid">
              <div className="location-meta-item">
                <div className="meta-icon-wrapper">
                  <Phone size={16} />
                </div>
                <div>
                  <h4>Clinical Enquiries</h4>
                  <div className="contact-phone-list">
                    <a href="tel:+919677777694">+91 96777 77694</a>
                    <a href="tel:+919790112261">+91 97901 12261</a>
                    <span className="landline-line">
                      Landline: <a href="tel:04224212274">0422-4212274</a>
                    </span>
                  </div>
                </div>
              </div>

              <div className="location-meta-item">
                <div className="meta-icon-wrapper">
                  <Mail size={16} />
                </div>
                <div>
                  <h4>Products Order</h4>
                  <div className="contact-email-list">
                    <a href="mailto:newvisiondent@gmail.com">
                      newvisiondent@gmail.com
                    </a>
                    <a href="mailto:newvisiondeals15@gmail.com">
                      newvisiondeals15@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="location-meta-item">
                <div className="meta-icon-wrapper">
                  <Clock size={16} />
                </div>
                <div>
                  <h4>Working Hours</h4>
                  <p>{BUSINESS_CONFIG.contact.businessHours}</p>
                </div>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="location-verification-card">
              <div className="verif-check">
                <CheckCircle2 size={16} />
              </div>
              <p>
                <strong>Verified Business Location:</strong> Sai Sruthi Building, Ramar Koil Street,
                Ram Nagar, Coimbatore. Google Maps Place ID: <code>{BUSINESS_CONFIG.placeId}</code>
              </p>
            </div>
          </motion.div>

          {/* Right Column: Enquiry Form */}
          <motion.div
            className="enquiry-form-panel"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="enquiry-form-card">
              <div className="form-card-header">
                <span className="eyebrow light-eyebrow">EQUIPMENT & CLINIC SUPPORT</span>
                <h2 className="form-heading">Bulk and Clinic Reopening Orders</h2>
                <p className="form-supporting-content">
                  We&apos;d love to hear from you. Fill out the form below and we will be in touch with you shortly.
                </p>
              </div>

              {submitSuccess && (
                <div className="form-alert form-alert-success" role="alert">
                  <CheckCircle2 size={20} className="shrink-0" />
                  <div>
                    <h4>Enquiry Sent Successfully</h4>
                    <p>{submitSuccess}</p>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="form-alert form-alert-error" role="alert">
                  <AlertCircle size={20} className="shrink-0" />
                  <div>
                    <h4>Submission Error</h4>
                    <p>{submitError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="enquiry-form" noValidate>
                <div className="form-grid-row">
                  <div className="form-group">
                    <label htmlFor="field-name">
                      Name <span className="req-star">*</span>
                    </label>
                    <input
                      type="text"
                      id="field-name"
                      name="name"
                      required
                      placeholder="Dr. Rajesh Kumar"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="field-phone">
                      Phone <span className="req-star">*</span>
                    </label>
                    <input
                      type="tel"
                      id="field-phone"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-grid-row">
                  <div className="form-group">
                    <label htmlFor="field-city">
                      City <span className="req-star">*</span>
                    </label>
                    <input
                      type="text"
                      id="field-city"
                      name="city"
                      required
                      placeholder="Coimbatore, Chennai, Bengaluru..."
                      value={formData.city}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="field-email">
                      Email <span className="req-star">*</span>
                    </label>
                    <input
                      type="email"
                      id="field-email"
                      name="email"
                      required
                      placeholder="doctor@practice.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="field-message">
                    Message <span className="req-star">*</span>
                  </label>
                  <textarea
                    id="field-message"
                    name="message"
                    rows={4}
                    required
                    placeholder="Tell us about your clinic setup requirements, equipment quantities, or preferred demonstration dates..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-textarea"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-enquiry-btn"
                  id="send-enquiry-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <span className="btn-spinner" />
                      <span>TRANSMITTING ENQUIRY...</span>
                    </>
                  ) : (
                    <>
                      <span>SEND ENQUIRY</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </main>
  )
}
