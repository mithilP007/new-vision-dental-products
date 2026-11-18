import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategoryBySlug, CATEGORIES_LIST } from '@/lib/ecommerce/categories'
import { getProductsByCategory, getCategoryFacets } from '@/lib/ecommerce/products-store'
import { CategoryLanding } from '@/components/category-landing'
import { BUSINESS_CONFIG } from '@/lib/business-config'

export async function generateStaticParams() {
  return CATEGORIES_LIST.map((cat) => ({
    slug: cat.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = getCategoryBySlug(slug)

  if (!category) {
    return {
      title: `Category Not Found | ${BUSINESS_CONFIG.name}`,
    }
  }

  return {
    title: `${category.heroHeading} | ${BUSINESS_CONFIG.name}`,
    description: `${category.heroDescription} Explore ${category.title} dental equipment, verified manufacturers, specifications, and clinical supply.`,
    openGraph: {
      title: `${category.heroHeading} | ${BUSINESS_CONFIG.name}`,
      description: category.heroDescription,
      images: [{ url: category.image }],
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const initialProducts = await getProductsByCategory(category.slug, true)
  const initialFacets = await getCategoryFacets(category.slug)

  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="map-loading-spinner" />
        </div>
      }
    >
      <CategoryLanding
        category={category}
        initialProducts={initialProducts}
        initialFacets={initialFacets}
      />
    </Suspense>
  )
}

