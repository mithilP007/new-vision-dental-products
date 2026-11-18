import { NextResponse } from 'next/server'
import { getCustomerByFirebaseUid, getCustomerById } from '@/lib/ecommerce/customers-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')
    const customerId = searchParams.get('customerId')

    if (!uid && !customerId) {
      return NextResponse.json(
        { error: 'Customer identifier (uid or customerId) is required' },
        { status: 400 }
      )
    }

    const customer = uid
      ? await getCustomerByFirebaseUid(uid)
      : await getCustomerById(customerId!)

    if (!customer) {
      return NextResponse.json({ customer: null }, { status: 404 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('[API AUTH ME ERROR]', error)
    return NextResponse.json({ error: 'Failed to retrieve customer account' }, { status: 500 })
  }
}
