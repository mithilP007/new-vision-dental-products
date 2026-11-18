import { NextResponse } from 'next/server'
import { updateCustomerProfile } from '@/lib/ecommerce/customers-store'

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, clinicName, gstin, city, state, pincode, phone } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    const updated = await updateCustomerProfile(id, {
      name,
      clinicName,
      gstin,
      city,
      state,
      pincode,
      phone,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      customer: updated,
    })
  } catch (error) {
    console.error('[API AUTH PROFILE UPDATE ERROR]', error)
    return NextResponse.json({ error: 'Failed to update practice profile' }, { status: 500 })
  }
}
