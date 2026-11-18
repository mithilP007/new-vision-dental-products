import { NextResponse } from 'next/server'
import { CATEGORIES_LIST } from '@/lib/ecommerce/categories'
import { getPublishedProducts } from '@/lib/ecommerce/products-store'

export async function GET() {
  try {
    const products = await getPublishedProducts()
    const counts = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const categories = CATEGORIES_LIST.map((cat) => ({
      ...cat,
      productCount: counts[cat.slug] || 0,
    }))

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('[API /api/categories error]', error)
    return NextResponse.json({ error: 'Failed to retrieve categories' }, { status: 500 })
  }
}
