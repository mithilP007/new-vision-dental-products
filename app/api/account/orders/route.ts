import { NextResponse } from 'next/server'
import { getCustomerByFirebaseUid, getCustomerById } from '@/lib/ecommerce/customers-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')
    const customerId = searchParams.get('customerId')

    if (!uid && !customerId) {
      return NextResponse.json({ error: 'Customer identifier is required' }, { status: 400 })
    }

    const customer = uid
      ? await getCustomerByFirebaseUid(uid)
      : await getCustomerById(customerId!)

    if (!customer) {
      return NextResponse.json({ orders: [] })
    }

    return NextResponse.json({
      orders: customer.orders || [],
    })
  } catch (error) {
    console.error('[API ACCOUNT ORDERS ERROR]', error)
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerId, order } = body

    if (!customerId || !order) {
      return NextResponse.json(
        { error: 'Customer ID and order payload are required' },
        { status: 400 }
      )
    }

    const { addCustomerOrder } = await import('@/lib/ecommerce/customers-store')
    const saved = await addCustomerOrder(customerId, order)

    return NextResponse.json({ success: saved })
  } catch (error) {
    console.error('[API ACCOUNT ORDERS POST ERROR]', error)
    return NextResponse.json({ error: 'Failed to save order to account' }, { status: 500 })
  }
}
