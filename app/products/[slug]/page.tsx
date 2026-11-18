import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getProductsByCategory, getAllProducts } from '@/lib/ecommerce/products-store'
import { ProductDetail } from '@/components/product-detail'
import { BUSINESS_CONFIG } from '@/lib/business-config'

export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map((p) => ({
    slug: p.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: `Product Not Found | ${BUSINESS_CONFIG.name}`,
    }
  }

  return {
    title: `${product.name} by ${product.manufacturer} | ${BUSINESS_CONFIG.name}`,
    description: product.shortDescription || product.description.substring(0, 160),
    openGraph: {
      title: `${product.name} | ${BUSINESS_CONFIG.name}`,
      description: product.description.substring(0, 160),
      images: product.images.length > 0 ? [{ url: product.images[0] }] : [],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const categoryProducts = await getProductsByCategory(product.category, true)
  const relatedProducts = categoryProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  return <ProductDetail product={product} relatedProducts={relatedProducts} />
}
