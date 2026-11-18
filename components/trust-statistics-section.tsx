'use client'

import { motion } from 'framer-motion'
import { TrustStatCard } from './trust-stat-card'

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const TRUST_STATS = [
  {
    value: 10000,
    suffix: '+',
    title: 'CUSTOMERS',
    description: 'Trusted by customers.',
  },
  {
    value: 5000,
    suffix: '+',
    title: 'CLINICS, DOCTORS & HOSPITALS',
    description: 'Supporting dental professionals.',
  },
  {
    value: 15000,
    suffix: '+',
    title: 'PRODUCTS',
    description: 'Dental equipment and everyday essentials.',
  },
  {
    value: 300,
    suffix: '+',
    title: 'BRANDS',
    description: 'A wide network of brand partners.',
  },
]

export function TrustStatisticsSection() {
  return (
    <section
      className="trust-statistics-section section-pad"
      aria-label="The New Vision Difference"
    >
      <div className="trust-section-header">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow light-eyebrow">
            <span></span> THE NEW VISION DIFFERENCE
          </p>
          <h2 className="trust-section-title">
            Our Trust.<br />
            <em>Our Responsibility.</em>
          </h2>
        </motion.div>
        <motion.p
          className="trust-section-subtext"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Building lasting relationships with dental professionals through trusted partnerships, a wide product selection and dedicated service.
        </motion.p>
      </div>

      <div className="trust-stats-grid">
        {TRUST_STATS.map((stat, index) => (
          <TrustStatCard
            key={stat.title}
            value={stat.value}
            suffix={stat.suffix}
            title={stat.title}
            description={stat.description}
            delay={index * 0.1}
          />
        ))}
      </div>
    </section>
  )
}
