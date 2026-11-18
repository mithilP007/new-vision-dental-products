'use client'

import React from 'react'
import Link from 'next/link'
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useCart } from '@/lib/ecommerce/cart-context'
import { CATEGORIES_LIST } from '@/lib/ecommerce/categories'

export default function CartPage() {
  const { items, totalItems, subtotal, updateQuantity, removeFromCart, clearCart } = useCart()

  return (
    <div className="cart-page-root">
      <SiteHeader />

      <main className="cart-page-main">
        <div className="cart-page-container">
          <div className="cart-page-title-row">
            <div>
              <span className="cart-page-eyebrow">PRACTICE REQUISITIONS</span>
              <h1 className="cart-page-title">
                Equipment Cart <em>({totalItems} items)</em>
              </h1>
            </div>
            {totalItems > 0 && (
              <button onClick={clearCart} className="cart-clear-all-btn">
                <Trash2 size={15} />
                <span>Empty Cart</span>
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="cart-page-empty">
              <div className="empty-cart-icon-ring">
                <ShoppingBag size={40} strokeWidth={1.3} />
              </div>
              <h2>Your equipment cart is currently empty</h2>
              <p>
                Assemble your clinical equipment order from our 6 certified disciplines. All products
                include official OEM warranty and clinical support.
              </p>
              <div className="empty-cart-cat-grid">
                {CATEGORIES_LIST.map((cat) => (
                  <Link key={cat.slug} href={`/categories/${cat.slug}`} className="empty-cat-item">
                    <span>{cat.number}</span>
                    <h4>{cat.title}</h4>
                    <small>{cat.tag}</small>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="cart-page-grid">
              {/* Left Column: Items */}
              <div className="cart-page-items-col">
                {items.map((item) => {
                  const unitPrice = item.product.salePrice ?? item.product.price ?? 0
                  const lineTotal = unitPrice * item.quantity

                  return (
                    <div key={item.product.id} className="cart-page-item-card">
                      <div className="cart-page-item-img-wrap">
                        <img
                          src={item.product.images[0] || '/placeholder.jpg'}
                          alt={item.product.name}
                        />
                      </div>

                      <div className="cart-page-item-details">
                        <div className="cart-page-item-top">
                          <span className="item-mfr">{item.product.manufacturer}</span>
                          <span className="item-sku">SKU: {item.product.sku}</span>
                        </div>
                        <h3 className="item-name">
                          <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                        </h3>
                        <div className="item-unit-price">
                          ₹{unitPrice.toLocaleString('en-IN')} per unit
                        </div>

                        <div className="cart-page-item-actions">
                          <div className="cart-stepper">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={13} />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <div className="item-total-price">
                            ₹{lineTotal.toLocaleString('en-IN')}
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="item-remove-btn"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Right Column: Order Summary */}
              <div className="cart-page-summary-col">
                <div className="cart-summary-card">
                  <h3>Order Summary</h3>

                  <div className="summary-row">
                    <span>Items Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-row">
                    <span>Estimated GST (18%)</span>
                    <span>₹{Math.round(subtotal * 0.18).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-row">
                    <span>Clinical Doorstep Logistics</span>
                    <span className="free-tag">Free Commercial Delivery</span>
                  </div>

                  <div className="summary-divider" />

                  <div className="summary-row total-row">
                    <span>Estimated Total</span>
                    <span className="total-amount">
                      ₹{Math.round(subtotal * 1.18).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link href="/checkout" className="btn-summary-checkout">
                    <span>Proceed to Clinical Checkout</span>
                    <ArrowRight size={16} />
                  </Link>

                  <div className="summary-guarantee-note">
                    <ShieldCheck size={16} />
                    <span>Official Manufacturer Invoice & GST Input Credit Eligible</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
