import { NextRequest, NextResponse } from 'next/server'
import {
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
} from '@/lib/ecommerce/products-store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    let product = await getProductById(id)
    if (!product) {
      product = await getProductBySlug(id)
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('[API GET /api/products/[id] error]', error)
    return NextResponse.json({ error: 'Failed to retrieve product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const updated = await updateProduct(id, body)

    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, product: updated })
  } catch (error) {
    console.error('[API PUT /api/products/[id] error]', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await deleteProduct(id)

    if (!success) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API DELETE /api/products/[id] error]', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
