'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react'
import { useCart } from '@/lib/ecommerce/cart-context'
import { useWishlist } from '@/lib/ecommerce/wishlist-context'
import { useAuth } from '@/lib/ecommerce/auth-context'
import { CATEGORIES_LIST } from '@/lib/ecommerce/categories'

interface SiteHeaderProps {
  currentCategory?: string
  isDarkHero?: boolean
}

export function SiteHeader({ currentCategory, isDarkHero = false }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { totalItems: cartCount, openCart } = useCart()
  const { totalItems: wishlistCount } = useWishlist()
  const { user, isAuthenticated, openAuthModal } = useAuth()

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent('nv:open-search'))
  }

  return (
    <header className={`site-nav-global ${isDarkHero ? 'nav-dark-mode' : 'nav-light-mode'}`}>
      <div className="site-nav-inner">
        {/* Brand Logo & Name */}
        <Link href="/" className="brand" aria-label="New Vision Dental Products Home">
          <span className="brand-mark">
            <img
              src="/logo.png"
              alt="New Vision Dental Logo"
              width={46}
              height={46}
              className="brand-logo-img"
            />
          </span>
          <span className="brand-text-col">
            <span className="brand-name">NEW VISION</span>
            <small className="brand-sub">DENTAL PRODUCTS</small>
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="desktop-links" aria-label="Main Navigation">
          <Link href="/#categories">Equipment</Link>
          <Link href="/categories/consumables">Materials</Link>
          <Link href="/#brands">Brands</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        {/* Header Right Actions */}
        <div className="nav-actions">
          {/* Global Search */}
          <button
            onClick={handleOpenSearch}
            className="nav-action-btn search-trigger"
            aria-label="Open product search"
            title="Search products (Cmd+K)"
          >
            <Search size={19} />
            <span className="action-label desktop-only">Search</span>
          </button>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="nav-action-btn wishlist-trigger"
            aria-label="View Wishlist"
            title="View saved equipment"
          >
            <div className="icon-badge-wrap">
              <Heart size={19} />
              {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
            </div>
            <span className="action-label desktop-only">Saved</span>
          </Link>

          {/* Cart Drawer Trigger */}
          <button
            onClick={openCart}
            className="nav-action-btn cart-action"
            aria-label="Open Equipment Cart"
            title="View requisition cart"
          >
            <div className="icon-badge-wrap">
              <ShoppingBag size={19} />
              {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
            </div>
            <span className="action-label desktop-only">Cart</span>
          </button>

          {/* Account Profile / Login */}
          {isAuthenticated ? (
            <Link
              href="/account"
              className="nav-action-btn account-trigger logged-in"
              aria-label="View Account"
              title={`Logged in as ${user?.name}`}
            >
              <div className="user-avatar-chip">
                <span>{user?.name?.charAt(0) || 'D'}</span>
              </div>
              <span className="action-label desktop-only">Account</span>
            </Link>
          ) : (
            <button
              onClick={() => openAuthModal('phone')}
              className="nav-action-btn account-trigger"
              aria-label="Sign In"
              title="Practice login"
            >
              <User size={19} />
              <span className="action-label desktop-only">Sign In</span>
            </button>
          )}

          {/* Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-toggle"
            aria-label="Toggle catalogue menu"
            title="Explore all categories"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            <span className="action-label desktop-only">{mobileMenuOpen ? 'Close' : 'Categories'}</span>
          </button>
        </div>
      </div>

      {/* Slide-down Neat & Clean Categories Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="site-menu-panel"
          >
            <div className="site-menu-inner">
              <div className="site-menu-header">
                <div>
                  <span className="site-menu-eyebrow">THE DENTAL CATALOGUE</span>
                  <h3 className="site-menu-title">Explore Equipment by Category</h3>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="site-menu-close-btn"
                  aria-label="Close menu"
                >
                  <X size={18} />
                  <span>Close Menu</span>
                </button>
              </div>

              {/* 6 Category Cards in a Neat, Clean Luxury Grid */}
              <div className="site-menu-categories-grid">
                {CATEGORIES_LIST.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="site-menu-cat-card"
                  >
                    <div className="site-menu-cat-thumb">
                      <img
                        src={cat.image}
                        alt={cat.title}
                        className="site-menu-cat-img"
                      />
                      <span className="site-menu-cat-num">{cat.number}</span>
                    </div>
                    <div className="site-menu-cat-info">
                      <span className="site-menu-cat-tag">{cat.tag}</span>
                      <h4 className="site-menu-cat-name">{cat.title}</h4>
                      <p className="site-menu-cat-desc">{cat.desc}</p>
                    </div>
                    <ArrowRight size={16} className="site-menu-cat-arrow" />
                  </Link>
                ))}
              </div>

              {/* Quick Navigation Footer */}
              <div className="site-menu-footer">
                <div className="site-menu-footer-links">
                  <Link href="/#categories" onClick={() => setMobileMenuOpen(false)}>
                    All Equipment Overview
                  </Link>
                  <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)}>
                    Saved Wishlist ({wishlistCount})
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      openCart()
                    }}
                    className="site-menu-footer-btn"
                  >
                    Equipment Cart ({cartCount})
                  </button>
                  <Link href="/#brands" onClick={() => setMobileMenuOpen(false)}>
                    Our Brand Partners
                  </Link>
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                    Clinic Support & Directions
                  </Link>
                  {isAuthenticated ? (
                    <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="site-menu-footer-btn auth-btn">
                      My Practice Account ({user?.name})
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        openAuthModal('phone')
                      }}
                      className="site-menu-footer-btn auth-btn"
                    >
                      Doctor / Practice Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
