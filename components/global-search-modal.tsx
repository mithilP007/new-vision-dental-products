'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react'
import { Product } from '@/lib/types/ecommerce'
import { CATEGORIES_LIST } from '@/lib/ecommerce/categories'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface GlobalSearchDetail {
  open?: boolean
}
type GlobalSearchEvent = CustomEvent<GlobalSearchDetail>

export function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Listen for global custom events to open search
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('nv:open-search', handleOpen)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('nv:open-search', handleOpen)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results || [])
        }
      } catch (err) {
        console.error('[GLOBAL SEARCH] error:', err)
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelectProduct = (slug: string) => {
    setIsOpen(false)
    router.push(`/products/${slug}`)
  }

  const handleCategoryJump = (slug: string) => {
    setIsOpen(false)
    router.push(`/categories/${slug}`)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="search-modal-backdrop"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="search-modal-box"
            role="dialog"
            aria-label="Global Product Search"
          >
            {/* Search Input Bar */}
            <div className="search-modal-input-row">
              <Search size={20} className="search-modal-icon" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search surgical products, handpieces, scanners, manufacturers (Waldent, GDC, Woodpecker)..."
                className="search-modal-input"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="search-modal-clear"
                  aria-label="Clear search input"
                >
                  <X size={16} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="search-modal-esc"
                aria-label="Close search"
              >
                ESC
              </button>
            </div>

            {/* Quick Category Jump Chips */}
            <div className="search-quick-categories">
              <span className="search-quick-label">Explore Disciplines:</span>
              <div className="search-quick-chips">
                {CATEGORIES_LIST.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryJump(cat.slug)}
                    className="search-category-chip"
                  >
                    <span>{cat.title}</span>
                    <ArrowRight size={12} />
                  </button>
                ))}
              </div>
            </div>

            {/* Results or Suggestions */}
            <div className="search-modal-body">
              {loading ? (
                <div className="search-modal-loading">
                  <div className="search-spinner" />
                  <span>Searching dental equipment catalogue...</span>
                </div>
              ) : query.trim() && results.length === 0 ? (
                <div className="search-modal-empty">
                  <Sparkles size={28} strokeWidth={1.4} />
                  <h4>No matching products found</h4>
                  <p>
                    No clinical products match &ldquo;{query}&rdquo;. Try searching for manufacturer
                    names (such as Woodpecker, Waldent, GDC, Eighteeth), product categories, or
                    browse directly by discipline.
                  </p>
                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="search-empty-enquire-btn"
                  >
                    Request Custom Equipment Quote ↗
                  </Link>
                </div>
              ) : results.length > 0 ? (
                <div className="search-modal-results">
                  <div className="search-results-label">
                    <span>MATCHING PRODUCTS ({results.length})</span>
                  </div>
                  <div className="search-results-list">
                    {results.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product.slug)}
                        className="search-result-item"
                        role="button"
                        tabIndex={0}
                      >
                        <div className="search-result-img-wrap">
                          <img
                            src={product.images[0] || '/placeholder.jpg'}
                            alt={product.name}
                            className="search-result-img"
                          />
                        </div>
                        <div className="search-result-info">
                          <div className="search-result-top">
                            <span className="search-result-mfr">{product.manufacturer}</span>
                            <span className="search-result-cat">{product.category}</span>
                          </div>
                          <h4 className="search-result-title">{product.name}</h4>
                          <span className="search-result-sku">SKU: {product.sku}</span>
                        </div>
                        <div className="search-result-price-col">
                          {product.isQuoteOnly || product.price === null ? (
                            <span className="search-quote-pill">Request Quote</span>
                          ) : (
                            <span className="search-price-val">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                          )}
                          <CornerDownLeft size={14} className="search-jump-icon" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="search-modal-guidance">
                  <div className="search-guidance-col">
                    <span className="search-guidance-title">Popular Dental Brands</span>
                    <div className="search-brand-pills">
                      {[
                        'Woodpecker',
                        'Waldent',
                        'GDC',
                        'Eighteeth',
                        'Dhaksha',
                        'Orikam',
                        'Zhermack',
                        'A-dec',
                        'Planmeca',
                        '3Shape',
                      ].map((brand) => (
                        <button
                          key={brand}
                          onClick={() => setQuery(brand)}
                          className="search-brand-pill"
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="search-guidance-col">
                    <span className="search-guidance-title">Common Requisitions</span>
                    <ul className="search-guidance-list">
                      <li onClick={() => setQuery('Handpiece')}>High-Speed LED Handpieces</li>
                      <li onClick={() => setQuery('Autoclave')}>Class B Autoclave Sterilizers</li>
                      <li onClick={() => setQuery('Scanner')}>Intraoral 3D Digital Scanners</li>
                      <li onClick={() => setQuery('CBCT')}>Panoramic 3D CBCT Imaging</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
