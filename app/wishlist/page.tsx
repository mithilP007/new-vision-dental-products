'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, ArrowRight, Trash2, ShoppingBag } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useWishlist } from '@/lib/ecommerce/wishlist-context'
import { useCart } from '@/lib/ecommerce/cart-context'
import { ProductCard } from '@/components/product-card'
import { CATEGORIES_LIST } from '@/lib/ecommerce/categories'

export default function WishlistPage() {
  const { items, totalItems, clearWishlist } = useWishlist()
  const { addToCart } = useCart()

  return (
    <div className="wishlist-page-root">
      <SiteHeader />

      <main className="wishlist-main-section">
        <div className="wishlist-container">
          {/* Header */}
          <div className="wishlist-header-row">
            <div>
              <span className="wishlist-eyebrow">SAVED PRACTICE REQUISITIONS</span>
              <h1 className="wishlist-title">
                Your Wishlist <em>({totalItems})</em>
              </h1>
              <p className="wishlist-desc">
                Review equipment, compare configurations, and transfer items into your clinical cart
                when ready for practice procurement.
              </p>
            </div>

            {totalItems > 0 && (
              <button onClick={clearWishlist} className="wishlist-clear-btn">
                <Trash2 size={15} />
                <span>Clear Wishlist</span>
              </button>
            )}
          </div>

          {/* Items or Luxury Empty State */}
          {items.length > 0 ? (
            <div className="products-grid">
              {items.map((item) => (
                <ProductCard key={item.product.id} product={item.product} />
              ))}
            </div>
          ) : (
            <div className="wishlist-empty-state">
              <div className="empty-wishlist-icon-wrap">
                <Heart size={36} strokeWidth={1.3} />
              </div>
              <h2>Your wishlist is currently empty</h2>
              <p>
                Browse our six clinical disciplines to bookmark handpieces, intraoral scanners,
                autoclaves, and imaging equipment for your practice.
              </p>

              <div className="empty-wishlist-categories-grid">
                {CATEGORIES_LIST.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="empty-cat-card"
                  >
                    <div className="empty-cat-top">
                      <span>{cat.number}</span>
                      <small>{cat.tag}</small>
                    </div>
                    <h4>{cat.title}</h4>
                    <span className="empty-cat-explore">
                      Explore Discipline <ArrowRight size={13} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
