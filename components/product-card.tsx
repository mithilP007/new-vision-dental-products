'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, ShoppingBag, ArrowRight, Star, FileText } from 'lucide-react'
import { Product } from '@/lib/types/ecommerce'
import { useCart } from '@/lib/ecommerce/cart-context'
import { useWishlist } from '@/lib/ecommerce/wishlist-context'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
  product: Product
  onQuoteRequest?: (product: Product) => void
}

export function ProductCard({ product, onQuoteRequest }: ProductCardProps) {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const router = useRouter()

  const wishlisted = isInWishlist(product.id)
  const isPurchasable = !product.isQuoteOnly && product.price !== null && product.isPurchaseEnabled

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isPurchasable) {
      addToCart(product, 1)
      router.push('/checkout')
    } else if (onQuoteRequest) {
      onQuoteRequest(product)
    } else {
      router.push(`/contact?subject=Quote+Request+for+${encodeURIComponent(product.name)}`)
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isPurchasable) {
      addToCart(product, 1)
    } else if (onQuoteRequest) {
      onQuoteRequest(product)
    }
  }

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <article className="product-card" data-id={product.id}>
      {/* Visual stage / image container */}
      <div className="product-card-visual-wrap">
        <Link href={`/products/${product.slug}`} className="product-card-image-link">
          <img
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            className="product-card-img"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="product-card-badge-row">
          {product.badge ? (
            <span className="product-badge accent">{product.badge}</span>
          ) : product.availability === 'in_stock' ? (
            <span className="product-badge in-stock">In Stock</span>
          ) : product.isQuoteOnly ? (
            <span className="product-badge quote">Quote Required</span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`product-card-wishlist-btn ${wishlisted ? 'active' : ''}`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          title={wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={16} fill={wishlisted ? '#c8a675' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="product-card-body">
        <div className="product-card-meta">
          <span className="product-card-mfr">{product.manufacturer}</span>
          {product.sku && <span className="product-card-sku">SKU: {product.sku}</span>}
        </div>

        <h3 className="product-card-title">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Rating if available */}
        {product.rating !== null && product.rating > 0 && (
          <div className="product-card-rating">
            <div className="product-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={star <= Math.round(product.rating!) ? 'star-filled' : 'star-empty'}
                  fill={star <= Math.round(product.rating!) ? '#c8a675' : 'none'}
                />
              ))}
            </div>
            <span className="product-rating-num">{product.rating.toFixed(1)}</span>
            {product.reviewCount > 0 && (
              <span className="product-review-count">({product.reviewCount})</span>
            )}
          </div>
        )}

        {/* Price or Quote */}
        <div className="product-card-price-row">
          {product.isQuoteOnly || product.price === null ? (
            <div className="product-price-quote">
              <span className="price-quote-label">Request a Quote</span>
              <span className="price-quote-sub">Institutional Pricing</span>
            </div>
          ) : (
            <div className="product-price-active">
              <span className="price-currency">₹</span>
              <span className="price-amount">{product.price.toLocaleString('en-IN')}</span>
              {product.salePrice && (
                <span className="price-original">
                  ₹{product.salePrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="product-card-actions">
          {isPurchasable ? (
            <>
              <button
                onClick={handleAddToCart}
                className="btn-add-to-cart"
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingBag size={14} />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="btn-buy-now"
                aria-label={`Buy ${product.name} now`}
              >
                <span>Buy Now</span>
                <ArrowRight size={13} />
              </button>
            </>
          ) : (
            <button
              onClick={handleBuyNow}
              className="btn-request-quote-card"
              aria-label={`Request quotation for ${product.name}`}
            >
              <FileText size={14} />
              <span>Request Quote</span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
