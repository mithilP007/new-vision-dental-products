import { NextRequest, NextResponse } from 'next/server'
import { searchGlobalProducts } from '@/lib/ecommerce/products-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const results = await searchGlobalProducts(q, 10)
    return NextResponse.json({ query: q, results, total: results.length })
  } catch (error) {
    console.error('[API /api/search error]', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
