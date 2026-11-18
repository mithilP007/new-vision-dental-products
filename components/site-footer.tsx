import React from 'react'
import Link from 'next/link'
import { BUSINESS_CONFIG } from '@/lib/business-config'
import { CATEGORIES_LIST } from '@/lib/ecommerce/categories'

export function SiteFooter() {
  return (
    <footer className="footer-luxury">
      <div className="footer-luxury-inner">
        {/* Top row */}
        <div className="footer-top-grid">
          {/* Brand info */}
          <div className="footer-brand-col">
            <Link href="/" className="brand" aria-label="New Vision Dental Products Home">
              <span className="brand-mark">
                <img
                  src="/logo.png"
                  alt="New Vision Dental Logo"
                  width={38}
                  height={38}
                  className="brand-logo-img"
                />
              </span>
              <span className="brand-text-col">
                <span className="brand-name">NEW VISION</span>
                <small className="brand-sub">DENTAL PRODUCTS</small>
              </span>
            </Link>
            <p className="footer-brand-tagline">
              Thoughtful tools for extraordinary dental care. Equipping clinical operatory suites,
              implant clinics, and diagnostic centers with world-class technology.
            </p>
            <div className="footer-address-block">
              <span className="footer-subheading">STUDIO & HEADQUARTERS</span>
              <address className="footer-address">
                {BUSINESS_CONFIG.address.building}, {BUSINESS_CONFIG.address.street},<br />
                {BUSINESS_CONFIG.address.area}, {BUSINESS_CONFIG.address.city},<br />
                {BUSINESS_CONFIG.address.state} — {BUSINESS_CONFIG.address.pincode}
              </address>
            </div>
          </div>

          {/* Six Disciplines Column */}
          <div className="footer-links-col">
            <span className="footer-subheading">EQUIPMENT DISCIPLINES</span>
            <ul className="footer-links-list">
              {CATEGORIES_LIST.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/categories/${cat.slug}`}>
                    <span>{cat.title}</span>
                    <small>— {cat.tag}</small>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Clinical Support & Contact */}
          <div className="footer-links-col">
            <span className="footer-subheading">CLINICAL SUPPORT & ENQUIRIES</span>
            <ul className="footer-contact-list">
              <li>
                <span className="contact-label">Mobile Direct:</span>
                <a href="tel:+919677777694">+91 96777 77694</a>
              </li>
              <li>
                <span className="contact-label">Alternative:</span>
                <a href="tel:+919790112261">+91 97901 12261</a>
              </li>
              <li>
                <span className="contact-label">Landline:</span>
                <a href="tel:04224212274">0422-4212274</a>
              </li>
              <li>
                <span className="contact-label">Clinical Orders:</span>
                <a href="mailto:newvisiondent@gmail.com">newvisiondent@gmail.com</a>
              </li>
              <li>
                <span className="contact-label">Secondary Email:</span>
                <a href="mailto:newvisiondeals15@gmail.com">newvisiondeals15@gmail.com</a>
              </li>
              <li>
                <span className="contact-label">Working Hours:</span>
                <span>{BUSINESS_CONFIG.contact.businessHours}</span>
              </li>
            </ul>
          </div>

          {/* Practice Management */}
          <div className="footer-links-col">
            <span className="footer-subheading">PRACTICE SUITE</span>
            <ul className="footer-links-list">
              <li>
                <Link href="/wishlist">Saved Wishlist</Link>
              </li>
              <li>
                <Link href="/cart">Equipment Cart</Link>
              </li>
              <li>
                <Link href="/account">Doctor Account</Link>
              </li>
              <li>
                <Link href="/admin">Product Management (Admin)</Link>
              </li>
              <li>
                <Link href="/contact">Book Studio Demonstration</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="footer-bottom-row">
          <span>
            © {new Date().getFullYear()} {BUSINESS_CONFIG.legalName}. All rights reserved.
          </span>
          <div className="footer-bottom-legal">
            <Link href="/contact">Institutional Support</Link>
            <span className="legal-dot">·</span>
            <Link href="/contact">Warranty & Servicing</Link>
            <span className="legal-dot">·</span>
            <Link href="/contact">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
