'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  Search,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
  Upload,
  FolderUp,
  Copy,
  Check,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react'
import {
  uploadSingleProductImage,
  uploadProductImagesBulk,
  BatchUploadProgress,
  UploadedImageResult,
  FailedImageResult,
} from '@/lib/supabase/storage'
import { Product, CategorySlug } from '@/lib/types/ecommerce'
import { CATEGORIES_LIST } from '@/lib/ecommerce/categories'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'

export function AdminProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  // Form Fields
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState<CategorySlug>('surgical')
  const [subcategory, setSubcategory] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [sku, setSku] = useState('')
  const [modelNumber, setModelNumber] = useState('')
  const [description, setDescription] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [imagesText, setImagesText] = useState('')
  const [price, setPrice] = useState<string>('')
  const [salePrice, setSalePrice] = useState<string>('')
  const [stock, setStock] = useState<number>(10)
  const [rating, setRating] = useState<string>('4.8')
  const [reviewCount, setReviewCount] = useState<number>(12)
  const [availability, setAvailability] = useState<Product['availability']>('in_stock')
  const [isPublished, setIsPublished] = useState<boolean>(true)
  const [isPurchaseEnabled, setIsPurchaseEnabled] = useState<boolean>(true)
  const [isQuoteOnly, setIsQuoteOnly] = useState<boolean>(false)
  const [badge, setBadge] = useState('')
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Autoclavable', value: '134°C / 273°F (Class B)' },
    { key: 'Material', value: 'Titanium & Stainless Steel' },
    { key: 'Warranty', value: '2 Years Comprehensive' },
  ])

  // Bulk Image Upload State
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [bulkFolder, setBulkFolder] = useState<string>('catalogue')
  const [bulkFiles, setBulkFiles] = useState<File[]>([])
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<BatchUploadProgress | null>(null)
  const [bulkUploadedResults, setBulkUploadedResults] = useState<UploadedImageResult[]>([])
  const [bulkFailedResults, setBulkFailedResults] = useState<FailedImageResult[]>([])
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [uploadingDirect, setUploadingDirect] = useState(false)

  const handleImageUploadDirect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingDirect(true)
    const fileList = Array.from(files)
    const currentImages = imagesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    for (const file of fileList) {
      const res = await uploadSingleProductImage(file, category)
      if (res.success && res.result) {
        currentImages.push(res.result.publicUrl)
      } else {
        setFeedback({
          type: 'error',
          message: `Failed to upload ${file.name}: ${res.error || 'Upload error'}`,
        })
      }
    }

    setImagesText(currentImages.join(', '))
    setUploadingDirect(false)
    e.target.value = ''
  }

  const removeImageAt = (index: number) => {
    const list = imagesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    list.splice(index, 1)
    setImagesText(list.join(', '))
  }

  const handleStartBulkUpload = async () => {
    if (bulkFiles.length === 0) return

    setBulkUploading(true)
    setBulkProgress({
      total: bulkFiles.length,
      completed: 0,
      failed: 0,
      percent: 0,
      currentFile: 'Compressing and preparing images...',
    })

    const res = await uploadProductImagesBulk(bulkFiles, {
      folder: bulkFolder || 'catalogue',
      concurrency: 4,
      onProgress: (p) => setBulkProgress(p),
    })

    setBulkUploadedResults((prev) => [...prev, ...res.uploaded])
    setBulkFailedResults(res.failed)
    setBulkUploading(false)

    if (res.failed.length === 0) {
      setFeedback({
        type: 'success',
        message: `Successfully uploaded ${res.uploaded.length} image(s) to Supabase Storage bucket 'product-images'.`,
      })
    } else {
      setFeedback({
        type: 'error',
        message: `Uploaded ${res.uploaded.length} images. ${res.failed.length} image(s) encountered an error.`,
      })
    }
  }

  const handleRetryFailed = async () => {
    if (bulkFailedResults.length === 0) return
    const failedNames = new Set(bulkFailedResults.map((f) => f.filename))
    const filesToRetry = bulkFiles.filter((file) => failedNames.has(file.name))
    if (filesToRetry.length === 0) return

    setBulkUploading(true)
    const res = await uploadProductImagesBulk(filesToRetry, {
      folder: bulkFolder || 'catalogue',
      concurrency: 4,
      onProgress: (p) => setBulkProgress(p),
    })

    setBulkUploadedResults((prev) => [...prev, ...res.uploaded])
    setBulkFailedResults(res.failed)
    setBulkUploading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedUrl(text)
    setTimeout(() => setCopiedUrl(null), 2500)
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (e) {
      console.error('[ADMIN FETCH ERROR]', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const resetForm = () => {
    setEditingProduct(null)
    setName('')
    setSlug('')
    setCategory('surgical')
    setSubcategory('Oral Surgery')
    setManufacturer('Waldent')
    setSku(`NV-${Date.now().toString(36).toUpperCase()}`)
    setModelNumber('NV-2025-PRO')
    setDescription(
      'Precision dental surgical instrument engineered with ergonomic grip and surgical grade alloy for superior clinical outcomes.'
    )
    setShortDescription('Ergonomic titanium surgical instrument with 134°C autoclave rating.')
    setImagesText('/categories/surgical.jpg')
    setPrice('14500')
    setSalePrice('')
    setStock(15)
    setRating('4.8')
    setReviewCount(14)
    setAvailability('in_stock')
    setIsPublished(true)
    setIsPurchaseEnabled(true)
    setIsQuoteOnly(false)
    setBadge('In Stock')
    setSpecs([
      { key: 'Autoclavable', value: '134°C / 273°F (Class B)' },
      { key: 'Material', value: 'Titanium & Stainless Steel' },
      { key: 'Warranty', value: '2 Years Comprehensive' },
    ])
  }

  const openCreateForm = () => {
    resetForm()
    setIsFormOpen(true)
  }

  const openEditForm = (prod: Product) => {
    setEditingProduct(prod)
    setName(prod.name)
    setSlug(prod.slug)
    setCategory(prod.category)
    setSubcategory(prod.subcategory)
    setManufacturer(prod.manufacturer)
    setSku(prod.sku)
    setModelNumber(prod.modelNumber)
    setDescription(prod.description)
    setShortDescription(prod.shortDescription || '')
    setImagesText(prod.images.join(', '))
    setPrice(prod.price ? prod.price.toString() : '')
    setSalePrice(prod.salePrice ? prod.salePrice.toString() : '')
    setStock(prod.stock)
    setRating(prod.rating ? prod.rating.toString() : '')
    setReviewCount(prod.reviewCount)
    setAvailability(prod.availability)
    setIsPublished(prod.isPublished)
    setIsPurchaseEnabled(prod.isPurchaseEnabled)
    setIsQuoteOnly(prod.isQuoteOnly)
    setBadge(prod.badge || '')

    const specList = Object.entries(prod.technicalSpecs || {}).map(([key, value]) => ({
      key,
      value,
    }))
    setSpecs(specList.length > 0 ? specList : [{ key: 'Warranty', value: '1 Year' }])

    setIsFormOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)

    const technicalSpecs: Record<string, string> = {}
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        technicalSpecs[s.key.trim()] = s.value.trim()
      }
    })

    const images = imagesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      subcategory: subcategory || 'General',
      manufacturer: manufacturer || 'New Vision',
      sku: sku || `NV-${Date.now().toString(36).toUpperCase()}`,
      modelNumber,
      description,
      shortDescription,
      images: images.length > 0 ? images : ['/placeholder.jpg'],
      technicalSpecs,
      price: isQuoteOnly ? null : price ? Number(price) : null,
      salePrice: salePrice ? Number(salePrice) : null,
      stock: Number(stock),
      rating: rating ? Number(rating) : null,
      reviewCount: Number(reviewCount),
      availability,
      isPublished,
      isPurchaseEnabled,
      isQuoteOnly,
      badge: badge || null,
    }

    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          setFeedback({ type: 'success', message: `Product "${name}" updated successfully.` })
          setIsFormOpen(false)
          fetchProducts()
        } else {
          setFeedback({ type: 'error', message: 'Failed to update product.' })
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          setFeedback({
            type: 'success',
            message: `Product "${name}" published and added to ${category.toUpperCase()} catalogue!`,
          })
          setIsFormOpen(false)
          fetchProducts()
        } else {
          setFeedback({ type: 'error', message: 'Failed to create product.' })
        }
      }
    } catch (err) {
      console.error('[ADMIN SUBMIT ERROR]', err)
      setFeedback({ type: 'error', message: 'A network error occurred.' })
    }
  }

  const handleDelete = async (id: string, prodName: string) => {
    if (!confirm(`Are you sure you want to remove "${prodName}" from the catalogue?`)) return

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setFeedback({ type: 'success', message: `Product "${prodName}" deleted.` })
        fetchProducts()
      } else {
        setFeedback({ type: 'error', message: 'Failed to delete product.' })
      }
    } catch (e) {
      console.error('[DELETE ERROR]', e)
    }
  }

  // Pre-configured Verified Sample Product for instant testing of full purchase/cart/wishlist flow
  const handleLoadSampleProduct = async (sampleCategory: CategorySlug = 'surgical') => {
    const sample = {
      name:
        sampleCategory === 'surgical'
          ? 'Waldent Surgical Titanium Handpiece Pro 45°'
          : sampleCategory === 'diagnostics'
          ? 'Eighteeth Helios 500 Digital Intraoral Scanner'
          : sampleCategory === 'imaging'
          ? 'Woodpecker Ai-Ray Portable Intraoral X-Ray Unit'
          : sampleCategory === 'consumables'
          ? 'Dhaksha Class-B Autoclave Sterilization Pouches (200pk)'
          : sampleCategory === 'orthodontics'
          ? 'GDC Orthodontic Torque Aligning Plier Set'
          : 'Sirona InLab MC X5 5-Axis Dental Milling Unit',
      slug: `sample-${sampleCategory}-${Date.now().toString(36)}`,
      category: sampleCategory,
      subcategory:
        sampleCategory === 'surgical'
          ? 'Oral Surgery'
          : sampleCategory === 'diagnostics'
          ? 'Intraoral Scanners'
          : sampleCategory === 'imaging'
          ? 'Intraoral X-Ray Units'
          : sampleCategory === 'consumables'
          ? 'Sterilization & Autoclave'
          : sampleCategory === 'orthodontics'
          ? 'Orthodontic Pliers'
          : 'Chairside Milling Units',
      manufacturer:
        sampleCategory === 'surgical'
          ? 'Waldent'
          : sampleCategory === 'diagnostics'
          ? 'Eighteeth'
          : sampleCategory === 'imaging'
          ? 'Woodpecker'
          : sampleCategory === 'consumables'
          ? 'Dhaksha'
          : sampleCategory === 'orthodontics'
          ? 'GDC'
          : 'Sirona',
      sku: `NV-${sampleCategory.substring(0, 3).toUpperCase()}-2025`,
      modelNumber: 'PRO-VERIFIED-V2',
      description: `Official certified dental equipment for ${sampleCategory} clinical suites. Complies with international dental device standards, includes complete installation manual, warranty card, and post-sale technical support via New Vision Dental Products Coimbatore.`,
      shortDescription: `Certified high-precision ${sampleCategory} instrument with manufacturer warranty.`,
      images: [`/categories/${sampleCategory}.jpg`],
      technicalSpecs: {
        'Regulatory Standard': 'ISO 13485 & CE Medical Class IIa',
        Warranty: '2 Years Comprehensive Parts & Service',
        'Sterilization Grade': 'Class B Autoclavable (134°C)',
        Country: 'Official OEM Authorized Import',
      },
      price: sampleCategory === 'cad-cam' ? null : 38500,
      salePrice: sampleCategory === 'cad-cam' ? null : 44000,
      stock: 12,
      rating: 4.9,
      reviewCount: 18,
      availability: 'in_stock' as const,
      isPublished: true,
      isPurchaseEnabled: sampleCategory !== 'cad-cam',
      isQuoteOnly: sampleCategory === 'cad-cam',
      badge: 'Certified B2B Stock',
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sample),
      })
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Sample genuine product loaded into ${sampleCategory.toUpperCase()} catalogue! View it now in that category page.`,
        })
        fetchProducts()
      }
    } catch (e) {
      console.error('[LOAD SAMPLE ERROR]', e)
    }
  }

  // Filtered products list for table
  const displayedProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="admin-page-root">
      <SiteHeader />

      <main className="admin-main-section">
        <div className="admin-container">
          {/* Header */}
          <div className="admin-top-bar">
            <div>
              <div className="admin-badge-row">
                <span className="admin-badge">NV ADMINISTRATION</span>
                <span className="admin-sub">PRODUCT MANAGEMENT & CATALOGUE TAXONOMY</span>
              </div>
              <h1 className="admin-page-title">Dental Catalogue Management</h1>
              <p className="admin-page-desc">
                Publish genuine dental products, configure manufacturer facets, set pricing or quote
                status, and manage clinical inventory across all 6 equipment disciplines.
              </p>
            </div>

            <div className="admin-action-buttons">
              <button
                type="button"
                onClick={() => setIsBulkUploadOpen(true)}
                className="btn-admin-bulk-trigger"
                title="Upload batch images to Supabase Storage"
              >
                <FolderUp size={16} />
                <span>Bulk Image Uploader</span>
              </button>
              <button onClick={openCreateForm} className="btn-admin-add-product">
                <Plus size={16} />
                <span>Add Genuine Product</span>
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div className={`admin-feedback-banner ${feedback.type}`}>
              {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{feedback.message}</span>
              <button onClick={() => setFeedback(null)}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Helper card for user */}
          <div className="admin-helper-card">
            <div className="helper-left">
              <Sparkles size={20} className="helper-icon" />
              <div>
                <strong>Need to test genuine product rendering and checkout immediately?</strong>
                <p>
                  You can add a verified sample product with one click to test the category filters,
                  product cards, cart, and buy-now flow. You can remove it anytime.
                </p>
              </div>
            </div>
            <div className="helper-quick-load-chips">
              <button onClick={() => handleLoadSampleProduct('surgical')} className="chip-load-sample">
                + Add Surgical Sample
              </button>
              <button onClick={() => handleLoadSampleProduct('diagnostics')} className="chip-load-sample">
                + Add Diagnostics Sample
              </button>
              <button onClick={() => handleLoadSampleProduct('imaging')} className="chip-load-sample">
                + Add Imaging Sample
              </button>
            </div>
          </div>

          {/* Filter and Search Bar for Admin Table */}
          <div className="admin-table-controls">
            <div className="admin-search-wrap">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search products by title, manufacturer, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="admin-category-filter">
              <label>Filter Discipline:</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All 6 Disciplines ({products.length})</option>
                {CATEGORIES_LIST.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.number} — {cat.title} (
                    {products.filter((p) => p.category === cat.slug).length})
                  </option>
                ))}
              </select>
            </div>

            <button onClick={fetchProducts} className="btn-admin-refresh" title="Reload list">
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Products Table */}
          <div className="admin-table-card">
            {loading ? (
              <div className="admin-loading-state">
                <div className="search-spinner" />
                <span>Loading dental inventory...</span>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="admin-empty-table">
                <Layers size={36} strokeWidth={1.3} />
                <h3>No Products Found</h3>
                <p>
                  {products.length === 0
                    ? 'No products have been added yet. Click "+ Add Genuine Product" above to publish your first clinical equipment record, or click a sample button to test.'
                    : 'No products match your search or discipline filter.'}
                </p>
              </div>
            ) : (
              <div className="admin-table-responsive">
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Details</th>
                      <th>Discipline</th>
                      <th>Manufacturer</th>
                      <th>SKU</th>
                      <th>Pricing / Mode</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="cell-image">
                          <img
                            src={p.images[0] || '/placeholder.jpg'}
                            alt={p.name}
                            className="admin-thumb"
                          />
                        </td>
                        <td className="cell-name">
                          <strong>{p.name}</strong>
                          <span className="subcat-pill">{p.subcategory}</span>
                        </td>
                        <td className="cell-category">
                          <span className="cat-tag-pill">{p.category.toUpperCase()}</span>
                        </td>
                        <td className="cell-mfr">{p.manufacturer}</td>
                        <td className="cell-sku">{p.sku}</td>
                        <td className="cell-price">
                          {p.isQuoteOnly || p.price === null ? (
                            <span className="quote-badge">Quote Only</span>
                          ) : (
                            <span className="price-tag">₹{p.price.toLocaleString('en-IN')}</span>
                          )}
                        </td>
                        <td className="cell-status">
                          <span
                            className={`status-pill ${p.isPublished ? 'published' : 'draft'}`}
                          >
                            {p.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="cell-actions">
                          <div className="actions-cluster">
                            <Link
                              href={`/products/${p.slug}`}
                              className="action-icon-btn view"
                              title="View on Storefront"
                              target="_blank"
                            >
                              <Eye size={15} />
                            </Link>
                            <button
                              onClick={() => openEditForm(p)}
                              className="action-icon-btn edit"
                              title="Edit product"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="action-icon-btn delete"
                              title="Delete product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CREATE / EDIT PRODUCT MODAL FORM */}
      {isFormOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="modal-eyebrow">PRODUCT CONFIGURATION</span>
                <h2>{editingProduct ? 'Edit Product Details' : 'Publish New Genuine Product'}</h2>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-modal-form">
              <div className="modal-form-grid-2">
                <div className="admin-field">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Waldent Surgical Titanium Handpiece 45°"
                  />
                </div>

                <div className="admin-field">
                  <label>URL Slug (auto-generated if empty)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="waldent-surgical-titanium-handpiece"
                  />
                </div>
              </div>

              <div className="modal-form-grid-3">
                <div className="admin-field">
                  <label>Main Category (Discipline) *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategorySlug)}
                  >
                    {CATEGORIES_LIST.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.number} — {cat.title} ({cat.tag})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-field">
                  <label>Subcategory (Taxonomy) *</label>
                  <input
                    type="text"
                    required
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g. Oral Surgery, Implantology, Endodontics"
                  />
                </div>

                <div className="admin-field">
                  <label>Manufacturer *</label>
                  <input
                    type="text"
                    required
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="e.g. Waldent, GDC, Woodpecker, Eighteeth"
                  />
                </div>
              </div>

              <div className="modal-form-grid-3">
                <div className="admin-field">
                  <label>SKU (Stock Keeping Unit) *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. NV-SUR-4501"
                  />
                </div>

                <div className="admin-field">
                  <label>Model Number</label>
                  <input
                    type="text"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    placeholder="e.g. SUR-PRO-45"
                  />
                </div>

                <div className="admin-field">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Pricing & Modes */}
              <div className="modal-form-grid-3">
                <div className="admin-field">
                  <label>Price in INR (₹) (leave empty if Quote Only)</label>
                  <input
                    type="number"
                    min={0}
                    disabled={isQuoteOnly}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 18500"
                  />
                </div>

                <div className="admin-field">
                  <label>Sale Price (Optional)</label>
                  <input
                    type="number"
                    min={0}
                    disabled={isQuoteOnly}
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="e.g. 16500"
                  />
                </div>

                <div className="admin-field">
                  <label>Badge / Tag</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Ships Today, Certified OEM"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="admin-toggles-row">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isQuoteOnly}
                    onChange={(e) => setIsQuoteOnly(e.target.checked)}
                  />
                  <span>Request Quote Only (Institutional / No direct checkout)</span>
                </label>

                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                  />
                  <span>Published (Visible in storefront and category catalogue)</span>
                </label>

                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isPurchaseEnabled}
                    onChange={(e) => setIsPurchaseEnabled(e.target.checked)}
                  />
                  <span>Purchase Enabled (Allow Add to Cart and Buy Now)</span>
                </label>
              </div>

              {/* Ratings */}
              <div className="modal-form-grid-3">
                <div className="admin-field">
                  <label>Genuine Rating (1.0 - 5.0, empty if unrated)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="4.8"
                  />
                </div>
                <div className="admin-field">
                  <label>Review Count</label>
                  <input
                    type="number"
                    min={0}
                    value={reviewCount}
                    onChange={(e) => setReviewCount(Number(e.target.value))}
                  />
                </div>
                <div className="admin-field">
                  <label>Availability Status</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value as Product['availability'])}
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="pre_order">Pre-Order</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="contact_for_availability">Contact for Availability</option>
                  </select>
                </div>
              </div>

              {/* Supabase Storage Image Manager */}
              <div className="admin-field admin-image-manager-field">
                <div className="admin-image-manager-header">
                  <div>
                    <label>Product Images (Supabase Storage)</label>
                    <span className="admin-field-hint">
                      Compressed to WebP and saved directly to Supabase bucket <code>product-images</code>.
                    </span>
                  </div>
                  <label className="btn-admin-direct-upload">
                    <Upload size={14} />
                    <span>{uploadingDirect ? 'Uploading...' : 'Upload Image to Supabase'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      onChange={handleImageUploadDirect}
                      disabled={uploadingDirect}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {uploadingDirect && (
                  <div className="admin-inline-upload-status">
                    <RefreshCw size={14} className="spin-icon" />
                    <span>Compressing image to WebP and uploading to Supabase Storage...</span>
                  </div>
                )}

                {/* Previews */}
                {imagesText.split(',').map((s) => s.trim()).filter(Boolean).length > 0 && (
                  <div className="admin-image-preview-gallery">
                    {imagesText
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((imgUrl, idx) => (
                        <div key={idx} className="admin-image-preview-item">
                          <img
                            src={imgUrl}
                            alt={`Preview ${idx + 1}`}
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = '/placeholder.jpg'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImageAt(idx)}
                            className="admin-image-remove-btn"
                            title="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                <input
                  type="text"
                  value={imagesText}
                  onChange={(e) => setImagesText(e.target.value)}
                  placeholder="/categories/surgical.jpg or Supabase CDN URL"
                  className="admin-images-text-input"
                />
              </div>

              {/* Short & Full Description */}
              <div className="admin-field">
                <label>Short Description (for cards and previews)</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="High-speed 45-degree operative handpiece with internal irrigation."
                />
              </div>

              <div className="admin-field">
                <label>Full Clinical Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed specifications, clinical indications, torque output, maintenance protocol..."
                />
              </div>

              {/* Technical Specifications */}
              <div className="admin-specs-section">
                <div className="specs-header-row">
                  <label>Technical Specifications (Key - Value)</label>
                  <button
                    type="button"
                    onClick={() => setSpecs([...specs, { key: '', value: '' }])}
                    className="btn-add-spec-row"
                  >
                    + Add Specification
                  </button>
                </div>

                <div className="specs-inputs-list">
                  {specs.map((spec, idx) => (
                    <div key={idx} className="spec-input-row">
                      <input
                        type="text"
                        placeholder="Spec Name (e.g. Chuck Type)"
                        value={spec.key}
                        onChange={(e) => {
                          const next = [...specs]
                          next[idx].key = e.target.value
                          setSpecs(next)
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Push Button Chuck)"
                        value={spec.value}
                        onChange={(e) => {
                          const next = [...specs]
                          next[idx].value = e.target.value
                          setSpecs(next)
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}
                        className="btn-remove-spec"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="admin-form-submit-row">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn-admin-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin-save">
                  <span>{editingProduct ? 'Save Product Changes' : 'Publish Product to Catalogue'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supabase Bulk Image Uploader Modal */}
      {isBulkUploadOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={() => !bulkUploading && setIsBulkUploadOpen(false)} />
          <div className="admin-modal-content admin-bulk-modal-card">
            {/* Modal Header */}
            <div className="admin-modal-header">
              <div className="bulk-header-title-box">
                <div className="bulk-header-icon-badge">
                  <FolderUp size={22} />
                </div>
                <div>
                  <div className="bulk-header-pills">
                    <span className="admin-badge">SUPABASE STORAGE</span>
                    <span className="bulk-bucket-tag">Bucket: product-images</span>
                  </div>
                  <h2 className="admin-modal-title">Bulk Clinical Image Uploader</h2>
                  <p className="bulk-modal-subtitle">
                    Upload single or up to 10,000 product images in concurrent batches. Files are
                    automatically compressed into lightweight WebP format on the client side, then stored
                    in the Supabase <code>product-images</code> bucket with permanent CDN URLs.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={bulkUploading}
                onClick={() => setIsBulkUploadOpen(false)}
                className="admin-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Folder selection and drop zone */}
            <div className="bulk-uploader-body">
              <div className="bulk-controls-row">
                <div className="bulk-folder-field">
                  <label>Storage Category Subfolder:</label>
                  <select
                    value={bulkFolder}
                    onChange={(e) => setBulkFolder(e.target.value)}
                    disabled={bulkUploading}
                  >
                    <option value="catalogue">catalogue/ (General)</option>
                    <option value="surgical">surgical/</option>
                    <option value="diagnostics">diagnostics/</option>
                    <option value="imaging">imaging/</option>
                    <option value="endodontics">endodontics/</option>
                    <option value="periodontics">periodontics/</option>
                    <option value="restorative">restorative/</option>
                  </select>
                </div>

                <div className="bulk-file-summary">
                  <span>
                    Selected: <strong>{bulkFiles.length}</strong> image file(s)
                  </span>
                  {bulkFiles.length > 0 && !bulkUploading && (
                    <button
                      type="button"
                      onClick={() => {
                        setBulkFiles([])
                        setBulkProgress(null)
                        setBulkUploadedResults([])
                        setBulkFailedResults([])
                      }}
                      className="bulk-clear-btn"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </div>

              {/* Dropzone */}
              <label
                className={`bulk-dropzone-box ${bulkUploading ? 'disabled' : ''}`}
                htmlFor="bulk-files-input"
              >
                <input
                  id="bulk-files-input"
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  disabled={bulkUploading}
                  onChange={(e) => {
                    const files = e.target.files
                    if (files) {
                      setBulkFiles(Array.from(files))
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <div className="bulk-dropzone-inner">
                  <Upload size={36} className="bulk-upload-cloud-icon" />
                  <h4>Select or Drag Images Here</h4>
                  <p>
                    Supports PNG, JPEG, WebP, AVIF up to 10,000 files. High-resolution photos are
                    automatically resized and compressed to 85% WebP for fast clinical catalogue loading.
                  </p>
                  <span className="btn-browse-files">Browse Computer Files</span>
                </div>
              </label>

              {/* Start Upload Button */}
              {bulkFiles.length > 0 && !bulkUploading && (
                <div className="bulk-upload-action-row">
                  <button
                    type="button"
                    onClick={handleStartBulkUpload}
                    className="btn-start-bulk-upload"
                  >
                    <FolderUp size={16} />
                    <span>Start Batch Upload ({bulkFiles.length} Images)</span>
                  </button>
                </div>
              )}

              {/* Progress Indicator */}
              {bulkUploading && bulkProgress && (
                <div className="bulk-progress-panel">
                  <div className="bulk-progress-info">
                    <span className="bulk-progress-label">
                      Uploading to Supabase: {bulkProgress.completed} of {bulkProgress.total} completed
                      {bulkProgress.failed > 0 ? ` (${bulkProgress.failed} failed)` : ''}
                    </span>
                    <span className="bulk-progress-percent">{bulkProgress.percent}%</span>
                  </div>
                  <div className="bulk-progress-track">
                    <div
                      className="bulk-progress-fill"
                      style={{ width: `${bulkProgress.percent}%` }}
                    />
                  </div>
                  <div className="bulk-progress-filename">
                    <RefreshCw size={12} className="spin-icon" />
                    <span>{bulkProgress.currentFile}</span>
                  </div>
                </div>
              )}

              {/* Failures and Retry Bar */}
              {bulkFailedResults.length > 0 && (
                <div className="bulk-failure-panel">
                  <div className="bulk-failure-header">
                    <AlertCircle size={18} />
                    <strong>{bulkFailedResults.length} image(s) encountered an upload error:</strong>
                  </div>
                  <ul className="bulk-failure-list">
                    {bulkFailedResults.map((f, i) => (
                      <li key={i}>
                        <code>{f.filename}</code>: {f.error}
                      </li>
                    ))}
                  </ul>
                  {!bulkUploading && (
                    <button
                      type="button"
                      onClick={handleRetryFailed}
                      className="btn-bulk-retry"
                    >
                      <RefreshCw size={14} />
                      <span>Retry {bulkFailedResults.length} Failed Image(s)</span>
                    </button>
                  )}
                </div>
              )}

              {/* Uploaded Results Table / Grid */}
              {bulkUploadedResults.length > 0 && (
                <div className="bulk-results-section">
                  <div className="bulk-results-header">
                    <h4>
                      Uploaded Images ({bulkUploadedResults.length}) — Ready for Catalogue
                    </h4>
                    <span className="bulk-results-hint">
                      Click copy to use any CDN URL directly in product records
                    </span>
                  </div>

                  <div className="bulk-results-grid">
                    {bulkUploadedResults.map((item, idx) => (
                      <div key={idx} className="bulk-result-card">
                        <div className="bulk-result-thumb">
                          <img
                            src={item.publicUrl}
                            alt={item.originalName}
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = '/placeholder.jpg'
                            }}
                          />
                        </div>
                        <div className="bulk-result-meta">
                          <span className="bulk-result-name" title={item.originalName}>
                            {item.originalName}
                          </span>
                          <span className="bulk-result-stats">
                            {(item.originalSize / 1024).toFixed(0)}KB →{' '}
                            {(item.compressedSize / 1024).toFixed(0)}KB
                          </span>
                        </div>
                        <div className="bulk-result-actions">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.publicUrl)}
                            className="btn-copy-url"
                            title="Copy Public Supabase URL"
                          >
                            {copiedUrl === item.publicUrl ? (
                              <>
                                <Check size={12} />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy URL</span>
                              </>
                            )}
                          </button>
                          <a
                            href={item.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-view-url"
                            title="Open Full Image"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="admin-modal-footer">
              <button
                type="button"
                disabled={bulkUploading}
                onClick={() => setIsBulkUploadOpen(false)}
                className="btn-admin-cancel"
              >
                Close Uploader
              </button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  )
}
