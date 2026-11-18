import type { Metadata } from 'next'
import { ContactContent } from '@/components/contact-content'
import { BUSINESS_CONFIG } from '@/lib/business-config'

export const metadata: Metadata = {
  title: `Contact Us | ${BUSINESS_CONFIG.name} — Coimbatore, Tamil Nadu`,
  description: `Visit ${BUSINESS_CONFIG.name} at ${BUSINESS_CONFIG.address.singleLine}. Interactive map, Google Maps directions, and practice equipment enquiry.`,
}

export default function ContactPage() {
  return <ContactContent />
}
