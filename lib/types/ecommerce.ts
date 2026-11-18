export type CategorySlug =
  | 'surgical'
  | 'diagnostics'
  | 'consumables'
  | 'imaging'
  | 'orthodontics'
  | 'cad-cam'

export interface CategoryInfo {
  slug: CategorySlug
  number: string
  title: string
  tag: string
  desc: string
  heroHeading: string
  heroDescription: string
  image: string
  alt: string
  subcategories: string[]
}

export type ProductAvailability =
  | 'in_stock'
  | 'out_of_stock'
  | 'pre_order'
  | 'contact_for_availability'

export interface Product {
  id: string
  slug: string
  name: string
  category: CategorySlug
  subcategory: string
  manufacturer: string
  sku: string
  modelNumber: string
  description: string
  shortDescription?: string
  images: string[]
  technicalSpecs: Record<string, string>
  price: number | null // in INR (₹). null if quote only
  salePrice: number | null
  stock: number
  rating: number | null // 1 to 5, null if unrated
  reviewCount: number
  availability: ProductAvailability
  isPublished: boolean
  isPurchaseEnabled: boolean
  isQuoteOnly: boolean
  badge?: string | null
  createdAt: string
  updatedAt: string
}

export interface FilterState {
  search: string
  sortBy: 'recommended' | 'newest' | 'price_asc' | 'price_desc' | 'rating'
  manufacturers: string[]
  subcategories: string[]
  priceRange: [number, number]
  ratings: number[]
  viewMode: 'grid' | 'list'
}

export interface CategoryFacets {
  manufacturers: { name: string; count: number }[]
  subcategories: { name: string; count: number }[]
  priceBounds: { min: number; max: number }
  ratingCounts: { rating: number; count: number }[]
  totalProducts: number
}

export interface CartItem {
  product: Product
  quantity: number
  addedAt: string
}

export interface WishlistItem {
  product: Product
  addedAt: string
}

export interface CustomerAddress {
  id: string
  title: string
  clinicName?: string
  contactPerson: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  isDefault?: boolean
}

export interface CustomerOrderSummary {
  orderId: string
  createdAt: string
  total: number
  itemCount: number
  status: 'received' | 'processing' | 'dispatched' | 'delivered'
  items: {
    productId: string
    name: string
    quantity: number
    price: number
  }[]
  invoiceRef?: string
}

export interface CustomerUser {
  id: string
  firebaseUid?: string
  supabaseUid?: string
  name: string
  email?: string
  phone?: string
  photoURL?: string
  provider: 'google' | 'phone' | 'email' | 'password' | 'supabase'
  clinicName?: string
  gstin?: string
  city?: string
  state?: string
  pincode?: string
  role: 'customer' | 'admin'
  savedAddresses?: CustomerAddress[]
  orders?: CustomerOrderSummary[]
  createdAt: string
  lastLoginAt: string
}
