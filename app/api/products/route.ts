import { NextRequest, NextResponse } from 'next/server'
import {
  getAllProducts,
  getFilteredProducts,
  getCategoryFacets,
  createProduct,
} from '@/lib/ecommerce/products-store'
import { CategorySlug } from '@/lib/types/ecommerce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as CategorySlug | null
    const search = searchParams.get('q') || ''
    const sortBy = (searchParams.get('sort') || 'recommended') as any
    const manufacturersParam = searchParams.get('m')
    const subcategoriesParam = searchParams.get('sub')
    const minPriceParam = searchParams.get('minPrice')
    const maxPriceParam = searchParams.get('maxPrice')
    const ratingsParam = searchParams.get('ratings')
    const withFacets = searchParams.get('facets') === 'true'

    if (!category) {
      const all = await getAllProducts()
      return NextResponse.json({ products: all, total: all.length })
    }

    const manufacturers = manufacturersParam ? manufacturersParam.split(',').filter(Boolean) : []
    const subcategories = subcategoriesParam ? subcategoriesParam.split(',').filter(Boolean) : []
    const minPrice = minPriceParam ? Number(minPriceParam) : 0
    const maxPrice = maxPriceParam ? Number(maxPriceParam) : 9999999
    const ratings = ratingsParam
      ? ratingsParam
          .split(',')
          .map(Number)
          .filter((n) => !isNaN(n))
      : []

    const { products, total } = await getFilteredProducts(category, {
      search,
      sortBy,
      manufacturers,
      subcategories,
      priceRange: [minPrice, maxPrice],
      ratings,
    })

    let facets = null
    if (withFacets) {
      facets = await getCategoryFacets(category)
    }

    return NextResponse.json({
      products,
      total,
      facets,
    })
  } catch (error) {
    console.error('[API /api/products error]', error)
    return NextResponse.json({ error: 'Failed to retrieve products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: 'Product name and category are required' },
        { status: 400 }
      )
    }

    const newProduct = await createProduct({
      name: body.name.trim(),
      slug: body.slug?.trim() || '',
      category: body.category,
      subcategory: body.subcategory?.trim() || 'General',
      manufacturer: body.manufacturer?.trim() || 'New Vision',
      sku: body.sku?.trim() || `NV-${Date.now().toString(36).toUpperCase()}`,
      modelNumber: body.modelNumber?.trim() || '',
      description: body.description?.trim() || '',
      shortDescription: body.shortDescription?.trim() || '',
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ['/placeholder.jpg'],
      technicalSpecs: body.technicalSpecs || {},
      price: body.isQuoteOnly ? null : body.price ? Number(body.price) : null,
      salePrice: body.salePrice ? Number(body.salePrice) : null,
      stock: typeof body.stock === 'number' ? body.stock : 10,
      rating: body.rating ? Number(body.rating) : null,
      reviewCount: body.reviewCount ? Number(body.reviewCount) : 0,
      availability: body.availability || 'in_stock',
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
      isPurchaseEnabled: body.isPurchaseEnabled !== undefined ? Boolean(body.isPurchaseEnabled) : true,
      isQuoteOnly: Boolean(body.isQuoteOnly),
      badge: body.badge || null,
    })

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 })
  } catch (error) {
    console.error('[API POST /api/products error]', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
