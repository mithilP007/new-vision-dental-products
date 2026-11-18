'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Heart,
  ShoppingBag,
  LogOut,
  Package,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  FileText,
  Save,
  AlertCircle,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useAuth } from '@/lib/ecommerce/auth-context'
import { useCart } from '@/lib/ecommerce/cart-context'
import { useWishlist } from '@/lib/ecommerce/wishlist-context'
import { CustomerOrderSummary } from '@/lib/types/ecommerce'

export default function AccountPage() {
  const { user, isAuthenticated, logout, openAuthModal, updateProfile } = useAuth()
  const { items: cartItems, totalItems: cartCount } = useCart()
  const { items: wishlistItems, totalItems: wishlistCount } = useWishlist()

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'cart'>('profile')

  // Profile Edit State
  const [clinicName, setClinicName] = useState('')
  const [name, setName] = useState('')
  const [gstin, setGstin] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [phone, setPhone] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Real Orders State
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setClinicName(user.clinicName || '')
      setGstin(user.gstin || '')
      setCity(user.city || 'Coimbatore')
      setState(user.state || 'Tamil Nadu')
      setPincode(user.pincode || '641009')
      setPhone(user.phone || '')

      // Fetch real orders
      setLoadingOrders(true)
      fetch(`/api/account/orders?customerId=${user.id}`)
        .then((res) => (res.ok ? res.json() : { orders: [] }))
        .then((data) => setOrders(data.orders || []))
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false))
    }
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setSaveSuccess(false)
    const success = await updateProfile({
      name,
      clinicName,
      gstin,
      city,
      state,
      pincode,
      phone,
    })
    setSavingProfile(false)
    if (success) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3500)
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="account-page-root">
        <SiteHeader />
        <main className="account-login-prompt-section">
          <div className="account-login-card">
            <div className="login-prompt-icon-wrap">
              <User size={38} strokeWidth={1.4} />
            </div>
            <h1>Doctor / Practice Portal</h1>
            <p>
              Sign in with your verified clinical credentials (Google account, Mobile SMS OTP, or email
              link) to access your institutional requisitions, tax invoices, and equipment wishlist.
            </p>
            <div className="account-prompt-actions">
              <button onClick={() => openAuthModal('phone')} className="btn-account-signin">
                <Phone size={16} />
                <span>Sign In via Mobile OTP</span>
                <ArrowRight size={16} />
              </button>
              <button onClick={() => openAuthModal('google')} className="btn-account-google">
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="account-page-root">
      <SiteHeader />

      <main className="account-main-section">
        <div className="account-container">
          {/* User Welcome Banner */}
          <div className="account-hero-banner">
            <div className="account-avatar-circle">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="user-photo-img" />
              ) : (
                <span>{user.name.charAt(0)}</span>
              )}
            </div>
            <div className="account-hero-details">
              <div className="account-pill-row">
                <span className="account-role-pill">
                  {user.role === 'admin' ? 'System Administrator' : 'Verified Clinical Practitioner'}
                </span>
                <span className="account-provider-pill">
                  <CheckCircle2 size={12} />
                  <span>
                    {user.provider === 'google'
                      ? 'Google Verified'
                      : user.provider === 'phone'
                      ? 'Phone SMS Verified'
                      : 'Email Verified'}
                  </span>
                </span>
              </div>
              <h1>{user.name}</h1>
              <p className="account-clinic-subtitle">
                {user.clinicName ? `${user.clinicName} · ` : ''}
                {user.email || user.phone}
              </p>
            </div>
            <button onClick={logout} className="account-logout-btn" title="Sign out of practice session">
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="account-tabs-bar">
            <button
              onClick={() => setActiveTab('profile')}
              className={`account-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <Building size={16} />
              <span>Practice Details</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`account-tab-item ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <Package size={16} />
              <span>Order History ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`account-tab-item ${activeTab === 'wishlist' ? 'active' : ''}`}
            >
              <Heart size={16} />
              <span>Saved Equipment ({wishlistCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`account-tab-item ${activeTab === 'cart' ? 'active' : ''}`}
            >
              <ShoppingBag size={16} />
              <span>Requisition Cart ({cartCount})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="account-tab-content-area">
            {/* TAB: PRACTICE PROFILE */}
            {activeTab === 'profile' && (
              <div className="account-profile-pane">
                <form onSubmit={handleSaveProfile} className="profile-edit-card">
                  <div className="profile-card-header">
                    <div>
                      <h3>Clinical Credentials & Delivery Details</h3>
                      <p>Update your institutional billing and clinic delivery address.</p>
                    </div>
                    {saveSuccess && (
                      <div className="save-success-tag">
                        <CheckCircle2 size={15} />
                        <span>Changes Saved Successfully</span>
                      </div>
                    )}
                  </div>

                  <div className="profile-form-grid">
                    <div className="profile-input-group">
                      <label>Practitioner Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="profile-input-group">
                      <label>Dental Clinic / Hospital Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Apollo Dental Speciality Clinic"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                      />
                    </div>

                    <div className="profile-input-group">
                      <label>GSTIN (Optional, for 18% Tax Credit)</label>
                      <input
                        type="text"
                        placeholder="33AAAAA0000A1Z5"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      />
                    </div>

                    <div className="profile-input-group">
                      <label>Contact Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div className="profile-input-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>

                    <div className="profile-input-group">
                      <label>State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>

                    <div className="profile-input-group">
                      <label>PIN Code</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                    </div>

                    <div className="profile-input-group">
                      <label>Verified Email</label>
                      <input
                        type="text"
                        value={user.email || 'Phone authenticated (no email linked)'}
                        disabled
                        className="input-disabled"
                      />
                    </div>
                  </div>

                  <div className="profile-submit-strip">
                    <button type="submit" disabled={savingProfile} className="btn-save-profile">
                      <Save size={16} />
                      <span>{savingProfile ? 'Saving Changes...' : 'Save Practice Details'}</span>
                    </button>
                  </div>

                  {user.role === 'admin' && (
                    <div className="admin-shortcut-box">
                      <ShieldCheck size={20} />
                      <div>
                        <strong>Administrator Privileges Active</strong>
                        <p>Manage product catalog, publishing status, and pricing facets.</p>
                      </div>
                      <Link href="/admin" className="btn-go-admin">
                        Open Admin Dashboard ↗
                      </Link>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* TAB: ORDER HISTORY */}
            {activeTab === 'orders' && (
              <div className="account-orders-pane">
                {loadingOrders ? (
                  <div className="orders-loading">Loading order records...</div>
                ) : orders.length === 0 ? (
                  <div className="orders-empty-card">
                    <Package size={34} strokeWidth={1.3} />
                    <h3>No Orders Placed Yet</h3>
                    <p>
                      Your verified clinical equipment requisitions, proforma invoices, and dispatch
                      tracking numbers will appear here.
                    </p>
                    <Link href="/categories/surgical" className="btn-browse-catalogue">
                      Explore Equipment Catalogue ↗
                    </Link>
                  </div>
                ) : (
                  <div className="orders-list-grid">
                    {orders.map((ord) => (
                      <div key={ord.orderId} className="order-history-card">
                        <div className="order-card-header">
                          <div>
                            <span className="order-ref-id">{ord.orderId}</span>
                            <span className="order-date">
                              {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <span className={`order-status-badge status-${ord.status}`}>
                            {ord.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="order-items-preview">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="order-item-line">
                              <span>
                                {it.name} × {it.quantity}
                              </span>
                              <span>₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                        <div className="order-card-footer">
                          <span>
                            Total: <strong>₹{ord.total.toLocaleString('en-IN')}</strong>
                          </span>
                          <span className="order-tax-note">(Includes 18% GST)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SAVED WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="account-wishlist-pane">
                {wishlistItems.length === 0 ? (
                  <div className="orders-empty-card">
                    <Heart size={34} strokeWidth={1.3} />
                    <h3>No Saved Equipment</h3>
                    <p>Click the heart icon on any product to bookmark it for practice review.</p>
                    <Link href="/categories/surgical" className="btn-browse-catalogue">
                      Browse Equipment ↗
                    </Link>
                  </div>
                ) : (
                  <div className="account-items-summary-list">
                    {wishlistItems.map((item) => (
                      <div key={item.product.id} className="account-item-row">
                        <img
                          src={item.product.images[0] || '/categories/surgical.jpg'}
                          alt={item.product.name}
                        />
                        <div>
                          <span className="account-item-mfr">{item.product.manufacturer}</span>
                          <h4>
                            <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                          </h4>
                          <span className="account-item-sku">SKU: {item.product.sku}</span>
                        </div>
                        <div className="account-item-price-side">
                          <span>
                            {item.product.isQuoteOnly || item.product.price === null
                              ? 'Request Quote'
                              : `₹${item.product.price.toLocaleString('en-IN')}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: CART */}
            {activeTab === 'cart' && (
              <div className="account-cart-pane">
                {cartItems.length === 0 ? (
                  <div className="orders-empty-card">
                    <ShoppingBag size={34} strokeWidth={1.3} />
                    <h3>Requisition Cart is Empty</h3>
                    <p>Add certified dental equipment and consumables to generate a proforma order.</p>
                    <Link href="/categories/surgical" className="btn-browse-catalogue">
                      Browse Categories ↗
                    </Link>
                  </div>
                ) : (
                  <div className="account-items-summary-list">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="account-item-row">
                        <img
                          src={item.product.images[0] || '/categories/surgical.jpg'}
                          alt={item.product.name}
                        />
                        <div>
                          <span className="account-item-mfr">{item.product.manufacturer}</span>
                          <h4>
                            <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                          </h4>
                          <span className="account-item-qty">Quantity: {item.quantity}</span>
                        </div>
                        <div className="account-item-price-side">
                          <span>
                            ₹
                            {(
                              (item.product.salePrice ?? item.product.price ?? 0) * item.quantity
                            ).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="account-cart-checkout-strip">
                      <Link href="/checkout" className="btn-account-checkout">
                        Proceed to Checkout ↗
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
