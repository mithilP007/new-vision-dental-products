import { NextResponse } from 'next/server'
import { BUSINESS_CONFIG } from '@/lib/business-config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, city, email, message } = body

    // Validation for exact required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    if (!city || typeof city !== 'string' || !city.trim()) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const enquiryId = `NV-ENQ-${Date.now().toString(36).toUpperCase()}`
    const timestamp = new Date().toISOString()

    // Structured notification record for the business
    const notificationPayload = {
      enquiryId,
      timestamp,
      recipient: BUSINESS_CONFIG.contact.email,
      supportEmail: BUSINESS_CONFIG.contact.supportEmail,
      businessLocation: BUSINESS_CONFIG.address.singleLine,
      customerDetails: {
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        email: email.trim(),
        message: message.trim(),
      },
      status: 'RECEIVED',
    }

    console.log('[NEW VISION DENTAL ENQUIRY RECEIVED]', JSON.stringify(notificationPayload, null, 2))

    return NextResponse.json({
      success: true,
      message: "We'd love to hear from you. We have received your enquiry and will be in touch with you shortly.",
      enquiryId,
      timestamp,
    })
  } catch (error) {
    console.error('[ENQUIRY API ERROR]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your enquiry. Please try again.' },
      { status: 500 }
    )
  }
}
