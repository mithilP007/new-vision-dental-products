import fs from 'fs/promises'
import path from 'path'
import { Product, CategorySlug, CategoryFacets, FilterState } from '@/lib/types/ecommerce'
import { CATEGORIES } from './categories'

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json')

// In-memory cache for fast reads during server rendering
let memoryProducts: Product[] | null = null

async function loadProducts(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      memoryProducts = parsed
      return parsed
    }
    return []
  } catch (error) {
    console.warn('[PRODUCTS STORE] Could not read products.json, initializing empty:', error)
    memoryProducts = []
    return []
  }
}

async function persistProducts(products: Product[]): Promise<void> {
  memoryProducts = products
  try {
    const dir = path.dirname(DATA_FILE)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8')
  } catch (error) {
    console.error('[PRODUCTS STORE] Error writing to products.json:', error)
    throw error
  }
}

export async function getAllProducts(): Promise<Product[]> {
  return await loadProducts()
}

export async function getPublishedProducts(): Promise<Product[]> {
  const all = await loadProducts()
  return all.filter((p) => p.isPublished)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await loadProducts()
  return all.find((p) => p.slug === slug || p.id === slug) || null
}

export async function getProductById(id: string): Promise<Product | null> {
  const all = await loadProducts()
  return all.find((p) => p.id === id) || null
}

export async function getProductsByCategory(
  categorySlug: CategorySlug,
  onlyPublished: boolean = true
): Promise<Product[]> {
  const all = await loadProducts()
  return all.filter(
    (p) => p.category === categorySlug && (!onlyPublished || p.isPublished)
  )
}

export async function getFilteredProducts(
  categorySlug: CategorySlug,
  filters: Partial<FilterState> = {}
): Promise<{ products: Product[]; total: number }> {
  let products = await getProductsByCategory(categorySlug, true)

  // 1. Text Search (name, manufacturer, sku, modelNumber, description)
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase()
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.modelNumber.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
    )
  }

  // 2. Manufacturers multi-select
  if (filters.manufacturers && filters.manufacturers.length > 0) {
    const lower = filters.manufacturers.map((m) => m.toLowerCase())
    products = products.filter((p) => lower.includes(p.manufacturer.toLowerCase()))
  }

  // 3. Subcategories multi-select
  if (filters.subcategories && filters.subcategories.length > 0) {
    const lower = filters.subcategories.map((s) => s.toLowerCase())
    products = products.filter((p) => lower.includes(p.subcategory.toLowerCase()))
  }

  // 4. Price range filter
  if (filters.priceRange) {
    const [min, max] = filters.priceRange
    products = products.filter((p) => {
      // If product has no price (quote only), allow it if min is 0 or unconstrained
      if (p.price === null || p.price === undefined) {
        return min === 0
      }
      return p.price >= min && p.price <= max
    })
  }

  // 5. Ratings filter
  if (filters.ratings && filters.ratings.length > 0) {
    products = products.filter((p) => {
      if (p.rating === null || p.rating === undefined) return false
      const rounded = Math.floor(p.rating)
      return filters.ratings!.includes(rounded)
    })
  }

  // 6. Sorting
  const sortBy = filters.sortBy || 'recommended'
  products.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'price_asc':
        return (a.price ?? 9999999) - (b.price ?? 9999999)
      case 'price_desc':
        return (b.price ?? 0) - (a.price ?? 0)
      case 'rating':
        return (b.rating ?? 0) - (a.rating ?? 0)
      case 'recommended':
      default:
        // Stock first, then rating, then newest
        if (a.stock > 0 && b.stock <= 0) return -1
        if (b.stock > 0 && a.stock <= 0) return 1
        return (b.rating ?? 0) - (a.rating ?? 0)
    }
  })

  return {
    products,
    total: products.length,
  }
}

export async function getCategoryFacets(categorySlug: CategorySlug): Promise<CategoryFacets> {
  const categoryProducts = await getProductsByCategory(categorySlug, true)

  const manufacturerMap = new Map<string, number>()
  const subcategoryMap = new Map<string, number>()
  const ratingMap = new Map<number, number>([
    [5, 0],
    [4, 0],
    [3, 0],
    [2, 0],
    [1, 0],
  ])

  let minPrice = Infinity
  let maxPrice = 0

  categoryProducts.forEach((p) => {
    // Manufacturer
    if (p.manufacturer) {
      manufacturerMap.set(p.manufacturer, (manufacturerMap.get(p.manufacturer) || 0) + 1)
    }
    // Subcategory
    if (p.subcategory) {
      subcategoryMap.set(p.subcategory, (subcategoryMap.get(p.subcategory) || 0) + 1)
    }
    // Price
    if (typeof p.price === 'number') {
      if (p.price < minPrice) minPrice = p.price
      if (p.price > maxPrice) maxPrice = p.price
    }
    // Ratings
    if (typeof p.rating === 'number' && p.rating >= 1) {
      const rounded = Math.min(5, Math.max(1, Math.floor(p.rating)))
      ratingMap.set(rounded, (ratingMap.get(rounded) || 0) + 1)
    }
  })

  // If there are no products with prices, provide the default ₹0 - ₹5,00,000 bounds
  const defaultMin = minPrice === Infinity ? 0 : minPrice
  const defaultMax = maxPrice === 0 ? 500000 : Math.max(maxPrice, 500000)

  // Subcategories fallback from category definition if none published yet
  const categoryDef = CATEGORIES[categorySlug]
  const subcategoriesList: { name: string; count: number }[] = []
  if (subcategoryMap.size > 0) {
    subcategoryMap.forEach((count, name) => {
      subcategoriesList.push({ name, count })
    })
  } else if (categoryDef?.subcategories) {
    categoryDef.subcategories.forEach((name) => {
      subcategoriesList.push({ name, count: 0 })
    })
  }

  const manufacturersList: { name: string; count: number }[] = []
  manufacturerMap.forEach((count, name) => {
    manufacturersList.push({ name, count })
  })

  const ratingCounts: { rating: number; count: number }[] = []
  for (let r = 5; r >= 1; r--) {
    ratingCounts.push({ rating: r, count: ratingMap.get(r) || 0 })
  }

  return {
    manufacturers: manufacturersList.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    subcategories: subcategoriesList,
    priceBounds: { min: defaultMin, max: defaultMax },
    ratingCounts,
    totalProducts: categoryProducts.length,
  }
}

export async function searchGlobalProducts(
  query: string,
  limit: number = 8
): Promise<Product[]> {
  if (!query || !query.trim()) return []
  const all = await getPublishedProducts()
  const q = query.trim().toLowerCase()

  return all
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )
    .slice(0, limit)
}

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Product> {
  const all = await loadProducts()
  const id = `prod_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`
  const slug =
    data.slug?.trim() ||
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') ||
    id

  const newProduct: Product = {
    ...data,
    id,
    slug,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  all.unshift(newProduct)
  await persistProducts(all)
  return newProduct
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  const all = await loadProducts()
  const index = all.findIndex((p) => p.id === id)
  if (index === -1) return null

  const updated: Product = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  all[index] = updated
  await persistProducts(all)
  return updated
}

export async function deleteProduct(id: string): Promise<boolean> {
  const all = await loadProducts()
  const filtered = all.filter((p) => p.id !== id)
  if (filtered.length === all.length) return false
  await persistProducts(filtered)
  return true
}
