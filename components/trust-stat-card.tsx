'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface TrustStatCardProps {
  value: number
  suffix?: string
  title: string
  description: string
  delay?: number
}

export function TrustStatCard({
  value,
  suffix = '+',
  title,
  description,
  delay = 0,
}: TrustStatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, amount: 0.35 })
  const [displayCount, setDisplayCount] = useState(0)

  useEffect(() => {
    if (!isInView) return

    let startTimestamp: number | null = null
    const duration = 1800 // 1.8 seconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      // Ease out cubic: smooth settling
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(easeOut * value)
      setDisplayCount(current)

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setDisplayCount(value)
      }
    }

    const frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [isInView, value])

  const formattedValue = displayCount.toLocaleString('en-US')

  return (
    <motion.div
      ref={cardRef}
      className="trust-stat-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="trust-stat-card-accent" aria-hidden="true" />
      <div className="trust-stat-number-wrapper">
        <span className="trust-stat-number">{formattedValue}</span>
        <span className="trust-stat-suffix">{suffix}</span>
      </div>
      <h3 className="trust-stat-title">{title}</h3>
      <p className="trust-stat-desc">{description}</p>
    </motion.div>
  )
}
