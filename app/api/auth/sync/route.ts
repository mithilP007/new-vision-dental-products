import { NextResponse } from 'next/server'
import { findOrCreateCustomer } from '@/lib/ecommerce/customers-store'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { supabaseUid, firebaseUid, name, email, phone, photoURL, provider, clinicName } = body

    const userUid = supabaseUid || firebaseUid
    if (!userUid || typeof userUid !== 'string') {
      return NextResponse.json(
        { error: 'Valid user identifier (supabaseUid or firebaseUid) is required' },
        { status: 400 }
      )
    }

    const customer = await findOrCreateCustomer({
      supabaseUid: supabaseUid ? String(supabaseUid).trim() : undefined,
      firebaseUid: firebaseUid ? String(firebaseUid).trim() : undefined,
      name: name?.trim(),
      email: email?.trim(),
      phone: phone?.trim(),
      photoURL: photoURL || undefined,
      provider: provider || 'supabase',
      clinicName: clinicName?.trim(),
    })

    return NextResponse.json({
      success: true,
      customer,
    })
  } catch (error) {
    console.error('[API AUTH SYNC ERROR]', error)
    return NextResponse.json(
      { error: 'Internal server error synchronizing customer account' },
      { status: 500 }
    )
  }
}
