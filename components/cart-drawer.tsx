'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react'
import { useCart } from '@/lib/ecommerce/cart-context'
import Link from 'next/link'

export function CartDrawer() {
  const { items, totalItems, subtotal, isOpen, closeCart, updateQuantity, removeFromCart } =
    useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="cart-drawer-backdrop"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="cart-drawer-panel"
            role="dialog"
            aria-label="Your Dental Equipment Cart"
          >
            {/* Drawer Header */}
            <div className="cart-drawer-header">
              <div className="cart-drawer-title-wrap">
                <span className="cart-drawer-eyebrow">PRACTICE REQUISITION</span>
                <h3>
                  Your Cart <em>({totalItems})</em>
                </h3>
              </div>
              <button
                onClick={closeCart}
                className="cart-drawer-close"
                aria-label="Close cart drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            {items.length === 0 ? (
              <div className="cart-drawer-empty">
                <div className="cart-empty-icon-wrap">
                  <ShoppingBag size={34} strokeWidth={1.4} />
                </div>
                <h4>Your equipment cart is empty</h4>
                <p>
                  Explore our six clinical equipment disciplines to select precision handpieces,
                  consumables, and imaging systems for your practice.
                </p>
                <div className="cart-empty-links">
                  <Link href="/categories/surgical" onClick={closeCart}>
                    Surgical Equipment ↗
                  </Link>
                  <Link href="/categories/diagnostics" onClick={closeCart}>
                    Diagnostics ↗
                  </Link>
                  <Link href="/categories/consumables" onClick={closeCart}>
                    Consumables ↗
                  </Link>
                  <Link href="/categories/imaging" onClick={closeCart}>
                    Radiology & Imaging ↗
                  </Link>
                </div>
              </div>
            ) : (
              <div className="cart-drawer-content">
                <div className="cart-items-list">
                  {items.map((item) => {
                    const price = item.product.salePrice ?? item.product.price ?? 0
                    const lineTotal = price * item.quantity

                    return (
                      <div key={item.product.id} className="cart-item-row">
                        <div className="cart-item-img-wrap">
                          <img
                            src={item.product.images[0] || '/placeholder.jpg'}
                            alt={item.product.name}
                            className="cart-item-img"
                          />
                        </div>
                        <div className="cart-item-details">
                          <span className="cart-item-mfr">{item.product.manufacturer}</span>
                          <h4 className="cart-item-name">{item.product.name}</h4>
                          <span className="cart-item-sku">SKU: {item.product.sku}</span>
                          <div className="cart-item-price-unit">
                            ₹{price.toLocaleString('en-IN')} each
                          </div>

                          <div className="cart-item-bottom">
                            <div className="cart-quantity-stepper">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                aria-label="Decrease quantity"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={13} />
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                aria-label="Increase quantity"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            <div className="cart-item-line-total">
                              ₹{lineTotal.toLocaleString('en-IN')}
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="cart-item-remove"
                              aria-label={`Remove ${item.product.name} from cart`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Drawer Footer */}
                <div className="cart-drawer-footer">
                  <div className="cart-summary-line">
                    <span>Requisition Subtotal</span>
                    <span className="cart-summary-amount">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="cart-tax-notice">
                    GST (18%), clinical shipping, and clinic doorstep logistics calculated at
                    checkout.
                  </p>

                  <div className="cart-footer-actions">
                    <Link
                      href="/checkout"
                      onClick={closeCart}
                      className="cart-checkout-btn"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight size={16} />
                    </Link>
                    <button onClick={closeCart} className="cart-continue-btn">
                      Continue Selecting Equipment
                    </button>
                  </div>

                  <div className="cart-b2b-guarantee">
                    <ShieldCheck size={14} />
                    <span>Official Manufacturer Warranty & Clinical Support Guarantee</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
