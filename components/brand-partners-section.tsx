'use client'

import { motion } from 'framer-motion'
import { BrandLogoMarquee } from './brand-logo-marquee'

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export function BrandPartnersSection() {
  return (
    <section
      className="brand-partners-section section-pad"
      id="brands"
      aria-label="Our Brand Partners"
    >
      <div className="brand-partners-header">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow light-eyebrow">
            <span></span> OUR BRAND PARTNERS
          </p>
          <h2 className="brand-partners-title">
            Trusted Names.<br />
            <em>Recognised Excellence.</em>
          </h2>
        </motion.div>
        <motion.p
          className="brand-partners-subtext"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Working with established dental brands to bring quality equipment, technology and solutions to dental professionals.
        </motion.p>
      </div>

      <div className="brand-partners-marquee-container">
        <BrandLogoMarquee />
      </div>
    </section>
  )
}
