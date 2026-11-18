'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Star,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  FileText,
  PhoneCall,
  Check,
} from 'lucide-react'
import { Product } from '@/lib/types/ecommerce'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'
import { useCart } from '@/lib/ecommerce/cart-context'
import { useWishlist } from '@/lib/ecommerce/wishlist-context'
import { CategoryEnquiryModal } from './category-enquiry-modal'
import { CATEGORIES } from '@/lib/ecommerce/categories'
import { ProductCard } from './product-card'

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const router = useRouter()
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'mfr'>('desc')

  const wishlisted = isInWishlist(product.id)
  const isPurchasable = !product.isQuoteOnly && product.price !== null && product.isPurchaseEnabled
  const categoryInfo = CATEGORIES[product.category]

  const handleBuyNow = () => {
    if (isPurchasable) {
      addToCart(product, quantity)
      router.push('/checkout')
    } else {
      setEnquiryModalOpen(true)
    }
  }

  const handleAddToCart = () => {
    if (isPurchasable) {
      addToCart(product, quantity)
    } else {
      setEnquiryModalOpen(true)
    }
  }

  const price = product.salePrice ?? product.price

  return (
    <div className="product-detail-root">
      <SiteHeader currentCategory={product.category} />

      {/* Breadcrumbs */}
      <nav className="category-breadcrumbs" aria-label="Breadcrumbs">
        <div className="breadcrumbs-container">
          <Link href="/" className="breadcrumb-link">
            Home
          </Link>
          <ChevronRight size={13} className="breadcrumb-separator" />
          <Link href="/#categories" className="breadcrumb-link">
            Equipment
          </Link>
          <ChevronRight size={13} className="breadcrumb-separator" />
          <Link href={`/categories/${product.category}`} className="breadcrumb-link">
            {categoryInfo?.title || product.category}
          </Link>
          <ChevronRight size={13} className="breadcrumb-separator" />
          <span className="breadcrumb-current" aria-current="page">
            {product.name}
          </span>
        </div>
      </nav>

      {/* Main Product Showcase */}
      <section className="product-detail-section">
        <div className="product-detail-container">
          {/* LEFT: Image Gallery */}
          <div className="product-gallery-col">
            <div className="product-main-image-wrap">
              <img
                src={product.images[selectedImageIndex] || '/placeholder.jpg'}
                alt={product.name}
                className="product-main-image"
              />
              <button
                onClick={() => toggleWishlist(product)}
                className={`product-gallery-wishlist-btn ${wishlisted ? 'active' : ''}`}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={18} fill={wishlisted ? '#c8a675' : 'none'} />
              </button>
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="product-thumbnail-strip">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`product-thumbnail-btn ${selectedImageIndex === idx ? 'active' : ''}`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Meta & Purchase Actions */}
          <div className="product-info-col">
            <div className="product-info-mfr-row">
              <span className="product-info-mfr">{product.manufacturer}</span>
              <span className="product-info-category-tag">{product.subcategory}</span>
            </div>

            <h1 className="product-info-title">{product.name}</h1>

            <div className="product-info-sku-row">
              <span className="info-sku-label">SKU: <strong>{product.sku}</strong></span>
              {product.modelNumber && (
                <span className="info-model-label">Model: <strong>{product.modelNumber}</strong></span>
              )}
            </div>

            {/* Rating */}
            {product.rating !== null && product.rating > 0 && (
              <div className="product-info-rating-row">
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={star <= Math.round(product.rating!) ? 'star-filled' : 'star-empty'}
                      fill={star <= Math.round(product.rating!) ? '#c8a675' : 'none'}
                    />
                  ))}
                </div>
                <span className="rating-score">{product.rating.toFixed(1)} / 5.0</span>
                {product.reviewCount > 0 && (
                  <span className="review-count">({product.reviewCount} clinical reviews)</span>
                )}
              </div>
            )}

            {/* Price or Request Quote */}
            <div className="product-info-pricing-box">
              {isPurchasable && price !== null ? (
                <div className="product-info-price">
                  <div className="price-primary">
                    <span className="price-currency">₹</span>
                    <span className="price-value">{price.toLocaleString('en-IN')}</span>
                  </div>
                  {product.salePrice && product.price && (
                    <span className="price-strikethrough">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="price-tax-note">Exclusive of 18% GST</span>
                </div>
              ) : (
                <div className="product-info-quote-needed">
                  <span className="quote-needed-title">Institutional Quotation Required</span>
                  <p className="quote-needed-desc">
                    Custom clinical configurations, practice delivery, and professional installation
                    provided via direct consultation.
                  </p>
                </div>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="product-short-desc">{product.shortDescription}</p>
            )}

            {/* Availability */}
            <div className="product-availability-status">
              <span className="avail-indicator in-stock" />
              <span>
                {product.availability === 'in_stock'
                  ? `In Stock · Ready for Clinical Dispatch (${product.stock} units available)`
                  : product.availability === 'pre_order'
                  ? 'Available on Practice Pre-Order (Ships in 2-3 weeks)'
                  : 'Contact Specialists for Availability'}
              </span>
            </div>

            {/* Quantity Selector & Action Buttons */}
            {isPurchasable ? (
              <div className="product-actions-block">
                <div className="quantity-select-row">
                  <label>Quantity:</label>
                  <div className="quantity-stepper-lg">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span>{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="product-cta-buttons">
                  <button onClick={handleAddToCart} className="btn-detail-add-cart">
                    <ShoppingBag size={17} />
                    <span>Add to Requisition Cart</span>
                  </button>

                  <button onClick={handleBuyNow} className="btn-detail-buy-now">
                    <span>Direct Practice Checkout</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="product-quote-cta-block">
                <button
                  onClick={() => setEnquiryModalOpen(true)}
                  className="btn-detail-request-quote"
                >
                  <PhoneCall size={17} />
                  <span>Request Official Practice Quotation</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Trust Assurances */}
            <div className="product-trust-strip">
              <div className="trust-item">
                <ShieldCheck size={16} />
                <span>Original Manufacturer Warranty & Quality Certificate</span>
              </div>
              <div className="trust-item">
                <Truck size={16} />
                <span>Express Insured Clinical Delivery Across India</span>
              </div>
              <div className="trust-item">
                <Check size={16} />
                <span>Onsite Installation & Operational Calibration Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section: Description, Specifications, Manufacturer */}
      <section className="product-tabs-section">
        <div className="product-tabs-container">
          <div className="product-tab-headers">
            <button
              onClick={() => setActiveTab('desc')}
              className={`product-tab-btn ${activeTab === 'desc' ? 'active' : ''}`}
            >
              Description
            </button>
            {product.technicalSpecs && Object.keys(product.technicalSpecs).length > 0 && (
              <button
                onClick={() => setActiveTab('specs')}
                className={`product-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              >
                Technical Specifications
              </button>
            )}
            <button
              onClick={() => setActiveTab('mfr')}
              className={`product-tab-btn ${activeTab === 'mfr' ? 'active' : ''}`}
            >
              Manufacturer Profile
            </button>
          </div>

          <div className="product-tab-content">
            {activeTab === 'desc' && (
              <div className="tab-pane-desc">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === 'specs' && product.technicalSpecs && (
              <div className="tab-pane-specs">
                <table className="specs-table">
                  <tbody>
                    {Object.entries(product.technicalSpecs).map(([key, val]) => (
                      <tr key={key}>
                        <td className="spec-name">{key}</td>
                        <td className="spec-val">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'mfr' && (
              <div className="tab-pane-mfr">
                <h4>Manufactured by {product.manufacturer}</h4>
                <p>
                  Official distribution and post-sale technical support provided by New Vision
                  Dental Products, Coimbatore. All spare parts, accessories, and warranty servicing
                  are handled directly through authorized manufacturer channels.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <div className="related-products-container">
            <div className="related-products-header">
              <span className="related-eyebrow">EQUIPMENT CONTINUUM</span>
              <h3>
                Related Equipment in <em>{categoryInfo?.title || product.category}</em>
              </h3>
            </div>

            <div className="products-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} onQuoteRequest={() => setEnquiryModalOpen(true)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quote / Enquiry Modal */}
      <CategoryEnquiryModal
        category={categoryInfo || CATEGORIES['surgical']}
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        productName={product.name}
      />

      <SiteFooter />
    </div>
  )
}
