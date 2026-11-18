'use client'

import React, { useState, useEffect, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Star,
  Grid3X3,
  List,
  Sparkles,
  ArrowRight,
  PhoneCall,
  Check,
  Shield,
  Layers,
} from 'lucide-react'
import { CategoryInfo, Product, CategoryFacets, FilterState } from '@/lib/types/ecommerce'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'
import { ProductCard } from './product-card'
import { CategoryEnquiryModal } from './category-enquiry-modal'

interface CategoryLandingProps {
  category: CategoryInfo
  initialProducts: Product[]
  initialFacets: CategoryFacets
}

export function CategoryLanding({
  category,
  initialProducts,
  initialFacets,
}: CategoryLandingProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Local state initialized from URL search params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [sortBy, setSortBy] = useState<FilterState['sortBy']>(
    (searchParams.get('sort') as FilterState['sortBy']) || 'recommended'
  )
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>(
    searchParams.get('m') ? searchParams.get('m')!.split(',').filter(Boolean) : []
  )
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    searchParams.get('sub') ? searchParams.get('sub')!.split(',').filter(Boolean) : []
  )
  const [selectedRatings, setSelectedRatings] = useState<number[]>(
    searchParams.get('r')
      ? searchParams.get('r')!.split(',').map(Number).filter((n) => !isNaN(n))
      : []
  )

  const minBound = initialFacets.priceBounds.min
  const maxBound = Math.max(initialFacets.priceBounds.max, 500000)

  const [priceRange, setPriceRange] = useState<[number, number]>([
    searchParams.get('min') ? Number(searchParams.get('min')) : minBound,
    searchParams.get('max') ? Number(searchParams.get('max')) : maxBound,
  ])

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false)
  const [enquiryProduct, setEnquiryProduct] = useState<Product | undefined>(undefined)

  // Accordion collapsed state for sidebar groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    sort: true,
    manufacturers: true,
    subcategories: true,
    price: true,
    ratings: true,
  })

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Synchronize URL parameters when filters change
  const updateUrlParams = (
    newSearch: string,
    newSort: string,
    newMfrs: string[],
    newSubs: string[],
    newPrice: [number, number],
    newRatings: number[]
  ) => {
    const params = new URLSearchParams()
    if (newSearch.trim()) params.set('q', newSearch.trim())
    if (newSort && newSort !== 'recommended') params.set('sort', newSort)
    if (newMfrs.length > 0) params.set('m', newMfrs.join(','))
    if (newSubs.length > 0) params.set('sub', newSubs.join(','))
    if (newPrice[0] > minBound) params.set('min', newPrice[0].toString())
    if (newPrice[1] < maxBound) params.set('max', newPrice[1].toString())
    if (newRatings.length > 0) params.set('r', newRatings.join(','))

    const qs = params.toString()
    startTransition(() => {
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
    })
  }

  // Filter products client-side for ultra-responsive feedback
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts]

    // 1. Text search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.modelNumber.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q)
      )
    }

    // 2. Manufacturers
    if (selectedManufacturers.length > 0) {
      const lower = selectedManufacturers.map((m) => m.toLowerCase())
      result = result.filter((p) => lower.includes(p.manufacturer.toLowerCase()))
    }

    // 3. Subcategories
    if (selectedSubcategories.length > 0) {
      const lower = selectedSubcategories.map((s) => s.toLowerCase())
      result = result.filter((p) => lower.includes(p.subcategory.toLowerCase()))
    }

    // 4. Price range
    result = result.filter((p) => {
      if (p.price === null || p.price === undefined) {
        return priceRange[0] === minBound
      }
      return p.price >= priceRange[0] && p.price <= priceRange[1]
    })

    // 5. Ratings
    if (selectedRatings.length > 0) {
      result = result.filter((p) => {
        if (p.rating === null || p.rating === undefined) return false
        return selectedRatings.includes(Math.floor(p.rating))
      })
    }

    // 6. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'price_asc':
          return (a.price ?? 99999999) - (b.price ?? 99999999)
        case 'price_desc':
          return (b.price ?? 0) - (a.price ?? 0)
        case 'rating':
          return (b.rating ?? 0) - (a.rating ?? 0)
        case 'recommended':
        default:
          if (a.stock > 0 && b.stock <= 0) return -1
          if (b.stock > 0 && a.stock <= 0) return 1
          return (b.rating ?? 0) - (a.rating ?? 0)
      }
    })

    return result
  }, [
    initialProducts,
    searchQuery,
    selectedManufacturers,
    selectedSubcategories,
    priceRange,
    selectedRatings,
    sortBy,
    minBound,
  ])

  // Count active filters
  const activeFiltersCount =
    (searchQuery.trim() ? 1 : 0) +
    selectedManufacturers.length +
    selectedSubcategories.length +
    selectedRatings.length +
    (priceRange[0] > minBound || priceRange[1] < maxBound ? 1 : 0)

  // Clear all filters
  const handleClearAll = () => {
    setSearchQuery('')
    setSortBy('recommended')
    setSelectedManufacturers([])
    setSelectedSubcategories([])
    setSelectedRatings([])
    setPriceRange([minBound, maxBound])
    updateUrlParams('', 'recommended', [], [], [minBound, maxBound], [])
  }

  // Toggle manufacturer
  const handleToggleManufacturer = (mfr: string) => {
    const next = selectedManufacturers.includes(mfr)
      ? selectedManufacturers.filter((m) => m !== mfr)
      : [...selectedManufacturers, mfr]
    setSelectedManufacturers(next)
    updateUrlParams(searchQuery, sortBy, next, selectedSubcategories, priceRange, selectedRatings)
  }

  // Toggle subcategory
  const handleToggleSubcategory = (sub: string) => {
    const next = selectedSubcategories.includes(sub)
      ? selectedSubcategories.filter((s) => s !== sub)
      : [...selectedSubcategories, sub]
    setSelectedSubcategories(next)
    updateUrlParams(searchQuery, sortBy, selectedManufacturers, next, priceRange, selectedRatings)
  }

  // Toggle rating
  const handleToggleRating = (rating: number) => {
    const next = selectedRatings.includes(rating)
      ? selectedRatings.filter((r) => r !== rating)
      : [...selectedRatings, rating]
    setSelectedRatings(next)
    updateUrlParams(
      searchQuery,
      sortBy,
      selectedManufacturers,
      selectedSubcategories,
      priceRange,
      next
    )
  }

  // Price slider change
  const handleMinPriceChange = (val: number) => {
    const nextMin = Math.min(val, priceRange[1])
    const next: [number, number] = [nextMin, priceRange[1]]
    setPriceRange(next)
    updateUrlParams(
      searchQuery,
      sortBy,
      selectedManufacturers,
      selectedSubcategories,
      next,
      selectedRatings
    )
  }

  const handleMaxPriceChange = (val: number) => {
    const nextMax = Math.max(val, priceRange[0])
    const next: [number, number] = [priceRange[0], nextMax]
    setPriceRange(next)
    updateUrlParams(
      searchQuery,
      sortBy,
      selectedManufacturers,
      selectedSubcategories,
      next,
      selectedRatings
    )
  }

  // Quote button handler
  const handleQuoteRequest = (product: Product) => {
    setEnquiryProduct(product)
    setEnquiryModalOpen(true)
  }

  return (
    <div className="category-landing-root">
      {/* Navigation Header */}
      <SiteHeader currentCategory={category.slug} />

      {/* SECTION A — BREADCRUMBS */}
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
          <span className="breadcrumb-current" aria-current="page">
            {category.title}
          </span>
        </div>
      </nav>

      {/* SECTION B — CATEGORY HERO */}
      <section className="category-hero-section">
        <div className="category-hero-container">
          <div className="category-hero-text">
            <div className="category-hero-tag">
              <span className="hero-tag-num">{category.number}</span>
              <span className="hero-tag-pipe">/</span>
              <span className="hero-tag-label">{category.tag}</span>
            </div>
            <h1 className="category-hero-heading">{category.heroHeading}</h1>
            <p className="category-hero-desc">{category.heroDescription}</p>

            <div className="category-hero-highlights">
              <div className="hero-highlight-item">
                <Shield size={16} />
                <span>Authorized Indian Distributor</span>
              </div>
              <div className="hero-highlight-item">
                <Layers size={16} />
                <span>B2B Institutional Supply & Onsite Calibration</span>
              </div>
            </div>
          </div>

          <div className="category-hero-visual">
            <div className="category-hero-frame">
              <img
                src={category.image}
                alt={category.alt}
                className="category-hero-img"
              />
              <div className="category-hero-badge">
                <span>NEW VISION CATALOGUE</span>
                <small>Discipline {category.number}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C — CATEGORY SEARCH BAR */}
      <section className="category-search-section">
        <div className="category-search-container">
          <div className="category-search-bar-wrap">
            <Search size={20} className="category-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                updateUrlParams(
                  e.target.value,
                  sortBy,
                  selectedManufacturers,
                  selectedSubcategories,
                  priceRange,
                  selectedRatings
                )
              }}
              placeholder={`Search ${category.title.toLowerCase()} products, instruments, manufacturers...`}
              className="category-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  updateUrlParams(
                    '',
                    sortBy,
                    selectedManufacturers,
                    selectedSubcategories,
                    priceRange,
                    selectedRatings
                  )
                }}
                className="category-search-clear-btn"
                aria-label="Clear category search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MAIN CATALOGUE LAYOUT (SIDEBAR + PRODUCTS) */}
      <div className="category-main-layout">
        <div className="category-layout-container">
          {/* Mobile Filter Toggle Bar */}
          <div className="mobile-filter-bar">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="mobile-filter-trigger"
            >
              <SlidersHorizontal size={16} />
              <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </button>
            <div className="mobile-count-pill">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
            </div>
          </div>

          {/* SECTION E — ADVANCED FILTER SIDEBAR */}
          <aside
            className={`filter-sidebar ${mobileFiltersOpen ? 'mobile-open' : ''}`}
            aria-label="Product catalogue filters"
          >
            <div className="filter-sidebar-header">
              <div className="filter-sidebar-title-row">
                <SlidersHorizontal size={17} />
                <h3>Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="active-filter-badge">{activeFiltersCount}</span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button onClick={handleClearAll} className="sidebar-clear-all-btn">
                  <RotateCcw size={12} />
                  <span>Clear All</span>
                </button>
              )}
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="sidebar-close-mobile-btn"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            <div className="filter-sidebar-body">
              {/* FILTER GROUP A — SORT BY */}
              <div className="filter-group">
                <button
                  onClick={() => toggleGroup('sort')}
                  className="filter-group-header"
                  aria-expanded={expandedGroups.sort}
                >
                  <span className="filter-group-title">SORT BY</span>
                  <ChevronDown
                    size={15}
                    className={`filter-chevron ${expandedGroups.sort ? 'open' : ''}`}
                  />
                </button>
                {expandedGroups.sort && (
                  <div className="filter-group-content">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        const nextSort = e.target.value as FilterState['sortBy']
                        setSortBy(nextSort)
                        updateUrlParams(
                          searchQuery,
                          nextSort,
                          selectedManufacturers,
                          selectedSubcategories,
                          priceRange,
                          selectedRatings
                        )
                      }}
                      className="filter-sort-select"
                    >
                      <option value="recommended">Recommended</option>
                      <option value="newest">Newest Arrivals</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                )}
              </div>

              {/* FILTER GROUP B — MANUFACTURERS */}
              <div className="filter-group">
                <button
                  onClick={() => toggleGroup('manufacturers')}
                  className="filter-group-header"
                  aria-expanded={expandedGroups.manufacturers}
                >
                  <span className="filter-group-title">MANUFACTURERS</span>
                  <ChevronDown
                    size={15}
                    className={`filter-chevron ${expandedGroups.manufacturers ? 'open' : ''}`}
                  />
                </button>
                {expandedGroups.manufacturers && (
                  <div className="filter-group-content">
                    {initialFacets.manufacturers.length === 0 ? (
                      <p className="filter-empty-facet-note">
                        Manufacturers will appear automatically when products are published in this
                        discipline.
                      </p>
                    ) : (
                      <div className="filter-checkbox-list">
                        {initialFacets.manufacturers.map((mfr) => {
                          const checked = selectedManufacturers.includes(mfr.name)
                          return (
                            <label key={mfr.name} className="filter-checkbox-item">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleManufacturer(mfr.name)}
                              />
                              <span className="checkbox-custom">
                                {checked && <Check size={12} strokeWidth={3} />}
                              </span>
                              <span className="checkbox-label-text">{mfr.name}</span>
                              <span className="checkbox-count-pill">{mfr.count}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* FILTER GROUP C — CATEGORY / SUBCATEGORY */}
              <div className="filter-group">
                <button
                  onClick={() => toggleGroup('subcategories')}
                  className="filter-group-header"
                  aria-expanded={expandedGroups.subcategories}
                >
                  <span className="filter-group-title">CATEGORY</span>
                  <ChevronDown
                    size={15}
                    className={`filter-chevron ${expandedGroups.subcategories ? 'open' : ''}`}
                  />
                </button>
                {expandedGroups.subcategories && (
                  <div className="filter-group-content">
                    <div className="filter-checkbox-list">
                      {initialFacets.subcategories.map((sub) => {
                        const checked = selectedSubcategories.includes(sub.name)
                        return (
                          <label key={sub.name} className="filter-checkbox-item">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleSubcategory(sub.name)}
                            />
                            <span className="checkbox-custom">
                              {checked && <Check size={12} strokeWidth={3} />}
                            </span>
                            <span className="checkbox-label-text">{sub.name}</span>
                            {sub.count > 0 && (
                              <span className="checkbox-count-pill">{sub.count}</span>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* FILTER GROUP D — PRICE RANGE */}
              <div className="filter-group">
                <button
                  onClick={() => toggleGroup('price')}
                  className="filter-group-header"
                  aria-expanded={expandedGroups.price}
                >
                  <span className="filter-group-title">PRICE RANGE</span>
                  <ChevronDown
                    size={15}
                    className={`filter-chevron ${expandedGroups.price ? 'open' : ''}`}
                  />
                </button>
                {expandedGroups.price && (
                  <div className="filter-group-content">
                    <div className="price-slider-display">
                      <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
                      <span className="price-divider">—</span>
                      <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
                    </div>

                    <div className="price-inputs-row">
                      <div className="price-input-box">
                        <label>Min ₹</label>
                        <input
                          type="number"
                          min={minBound}
                          max={priceRange[1]}
                          step={1000}
                          value={priceRange[0]}
                          onChange={(e) => handleMinPriceChange(Number(e.target.value))}
                        />
                      </div>
                      <div className="price-input-box">
                        <label>Max ₹</label>
                        <input
                          type="number"
                          min={priceRange[0]}
                          max={maxBound}
                          step={1000}
                          value={priceRange[1]}
                          onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="price-slider-track-wrap">
                      <input
                        type="range"
                        min={minBound}
                        max={maxBound}
                        step={1000}
                        value={priceRange[1]}
                        onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                        className="price-range-slider"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* FILTER GROUP E — RATINGS */}
              <div className="filter-group">
                <button
                  onClick={() => toggleGroup('ratings')}
                  className="filter-group-header"
                  aria-expanded={expandedGroups.ratings}
                >
                  <span className="filter-group-title">RATINGS</span>
                  <ChevronDown
                    size={15}
                    className={`filter-chevron ${expandedGroups.ratings ? 'open' : ''}`}
                  />
                </button>
                {expandedGroups.ratings && (
                  <div className="filter-group-content">
                    <div className="filter-checkbox-list">
                      {[5, 4, 3, 2, 1].map((r) => {
                        const checked = selectedRatings.includes(r)
                        const count =
                          initialFacets.ratingCounts.find((item) => item.rating === r)?.count || 0

                        return (
                          <label key={r} className="filter-checkbox-item">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleRating(r)}
                            />
                            <span className="checkbox-custom">
                              {checked && <Check size={12} strokeWidth={3} />}
                            </span>
                            <div className="filter-stars-row">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={13}
                                  className={star <= r ? 'star-gold' : 'star-muted'}
                                  fill={star <= r ? '#c8a675' : 'none'}
                                />
                              ))}
                              <span className="rating-label-num">{r} Stars</span>
                            </div>
                            {count > 0 && <span className="checkbox-count-pill">{count}</span>}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile apply button */}
              <div className="sidebar-mobile-apply">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="sidebar-apply-btn"
                >
                  View {filteredProducts.length} Products
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT PRODUCT CATALOGUE AREA */}
          <main className="product-catalogue-area">
            {/* SECTION D — PRODUCT LISTING HEADER */}
            <div className="listing-header">
              <div className="listing-header-left">
                <h2 className="listing-category-name">{category.title} Catalogue</h2>
                <div className="listing-meta-info">
                  <span className="listing-count">
                    Showing <strong>{filteredProducts.length}</strong>{' '}
                    {filteredProducts.length === 1 ? 'product' : 'products'}
                  </span>
                  {activeFiltersCount > 0 && (
                    <span className="listing-active-filters-tag">
                      · {activeFiltersCount} active{' '}
                      {activeFiltersCount === 1 ? 'filter' : 'filters'}
                    </span>
                  )}
                </div>
              </div>

              <div className="listing-header-right">
                {/* Sort dropdown on desktop */}
                <div className="listing-sort-wrap desktop-only">
                  <span className="sort-label">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      const nextSort = e.target.value as FilterState['sortBy']
                      setSortBy(nextSort)
                      updateUrlParams(
                        searchQuery,
                        nextSort,
                        selectedManufacturers,
                        selectedSubcategories,
                        priceRange,
                        selectedRatings
                      )
                    }}
                    className="listing-sort-select"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="listing-view-toggle">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                    aria-label="List view"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Chips Bar */}
            {activeFiltersCount > 0 && (
              <div className="active-chips-bar">
                {searchQuery && (
                  <span className="filter-chip">
                    <span>Search: {searchQuery}</span>
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        updateUrlParams(
                          '',
                          sortBy,
                          selectedManufacturers,
                          selectedSubcategories,
                          priceRange,
                          selectedRatings
                        )
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedManufacturers.map((mfr) => (
                  <span key={mfr} className="filter-chip">
                    <span>{mfr}</span>
                    <button onClick={() => handleToggleManufacturer(mfr)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {selectedSubcategories.map((sub) => (
                  <span key={sub} className="filter-chip">
                    <span>{sub}</span>
                    <button onClick={() => handleToggleSubcategory(sub)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {(priceRange[0] > minBound || priceRange[1] < maxBound) && (
                  <span className="filter-chip">
                    <span>
                      ₹{priceRange[0].toLocaleString('en-IN')} - ₹
                      {priceRange[1].toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => {
                        setPriceRange([minBound, maxBound])
                        updateUrlParams(
                          searchQuery,
                          sortBy,
                          selectedManufacturers,
                          selectedSubcategories,
                          [minBound, maxBound],
                          selectedRatings
                        )
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedRatings.map((r) => (
                  <span key={r} className="filter-chip">
                    <span>{r}★</span>
                    <button onClick={() => handleToggleRating(r)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <button onClick={handleClearAll} className="filter-chips-clear-all">
                  Reset filters
                </button>
              </div>
            )}

            {/* PRODUCTS RESULTS OR LUXURY EMPTY STATE */}
            {filteredProducts.length > 0 ? (
              <div
                className={`products-grid ${viewMode === 'list' ? 'products-list-mode' : ''}`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuoteRequest={handleQuoteRequest}
                  />
                ))}
              </div>
            ) : (
              /* PART 5 — LUXURY CATEGORY-SPECIFIC EMPTY STATE */
              <div className="category-empty-state">
                <div className="empty-state-visual-frame">
                  <img
                    src={category.image}
                    alt={category.alt}
                    className="empty-state-image"
                  />
                  <div className="empty-state-badge">
                    <span>{category.tag}</span>
                  </div>
                </div>

                <div className="empty-state-copy">
                  <span className="empty-state-eyebrow">
                    DISCIPLINE {category.number} — {category.tag.toUpperCase()}
                  </span>
                  <h3 className="empty-state-title">
                    Explore our {category.title} Collection
                  </h3>
                  <p className="empty-state-desc">
                    We&apos;re preparing this collection. Contact our team for product
                    recommendations and availability.
                  </p>

                  <div className="empty-state-actions">
                    <button
                      onClick={() => {
                        setEnquiryProduct(undefined)
                        setEnquiryModalOpen(true)
                      }}
                      className="btn-empty-enquire"
                    >
                      <PhoneCall size={16} />
                      <span>Enquire About This Category</span>
                      <ArrowRight size={15} />
                    </button>

                    <Link href="/contact" className="btn-empty-studio">
                      Visit Coimbatore Studio
                    </Link>
                  </div>

                  <div className="empty-state-features">
                    <div className="empty-feature-item">
                      <Sparkles size={15} />
                      <span>Direct OEM Supply & Warranty</span>
                    </div>
                    <div className="empty-feature-item">
                      <Check size={15} />
                      <span>Clinical Equipment Demonstrations</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Category Enquiry Modal */}
      <CategoryEnquiryModal
        category={category}
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        productName={enquiryProduct?.name}
      />

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
