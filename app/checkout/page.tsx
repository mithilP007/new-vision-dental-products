'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowRight,
  FileText,
  Lock,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useCart } from '@/lib/ecommerce/cart-context'
import { useAuth } from '@/lib/ecommerce/auth-context'
import { BUSINESS_CONFIG } from '@/lib/business-config'

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()

  const [clinicName, setClinicName] = useState(user?.clinicName || '')
  const [doctorName, setDoctorName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [gstin, setGstin] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState(user?.city || 'Coimbatore')
  const [state, setState] = useState(user?.state || 'Tamil Nadu')
  const [pincode, setPincode] = useState(user?.pincode || '641009')
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'clinical_invoice'>('bank_transfer')
  const [submitting, setSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const gstAmount = Math.round(subtotal * 0.18)
  const finalTotal = subtotal + gstAmount

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const orderRef = `NV-B2B-${Date.now().toString(36).toUpperCase()}`
      const orderPayload = {
        orderId: orderRef,
        items: items.map((it) => ({
          id: it.product.id,
          name: it.product.name,
          sku: it.product.sku,
          price: it.product.salePrice ?? it.product.price,
          quantity: it.quantity,
        })),
        subtotal,
        gst: gstAmount,
        total: finalTotal,
        paymentMethod,
        clinicDetails: {
          clinicName,
          doctorName,
          email,
          phone,
          gstin,
          address,
          city,
          state,
          pincode,
        },
      }

      // Log structured order for business and dispatch enquiry notification
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: doctorName,
          phone,
          city,
          email,
          message: `[OFFICIAL B2B EQUIPMENT ORDER: ${orderRef}]\nClinic: ${clinicName}\nTotal: ₹${finalTotal.toLocaleString('en-IN')}\nItems: ${items.map((i) => `${i.product.name} (Qty: ${i.quantity})`).join(', ')}`,
        }),
      })

      // Save order to customer account if authenticated
      if (user?.id) {
        try {
          await fetch('/api/account/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerId: user.id,
              order: {
                orderId: orderRef,
                createdAt: new Date().toISOString(),
                total: finalTotal,
                itemCount: items.reduce((s, it) => s + it.quantity, 0),
                status: 'received',
                items: items.map((it) => ({
                  productId: it.product.id,
                  name: it.product.name,
                  quantity: it.quantity,
                  price: it.product.salePrice ?? it.product.price ?? 0,
                })),
                invoiceRef: `INV-${orderRef}`,
              },
            }),
          })
        } catch (e) {
          console.warn('[ORDER RECORD WARNING]', e)
        }
      }

      clearCart()
      setOrderComplete(orderRef)
    } catch (err) {
      console.error('[CHECKOUT ERROR]', err)
      setError('An error occurred during order dispatch. Please contact our support team directly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="checkout-page-root">
      <SiteHeader />

      <main className="checkout-page-main">
        <div className="checkout-page-container">
          {orderComplete ? (
            <div className="order-confirmed-card">
              <div className="confirmed-icon-wrap">
                <CheckCircle2 size={52} strokeWidth={1.5} />
              </div>
              <span className="confirmed-eyebrow">PRACTICE REQUISITION CONFIRMED</span>
              <h1>Requisition Order Dispatched</h1>
              <p className="confirmed-ref">
                Reference ID: <strong>{orderComplete}</strong>
              </p>
              <p className="confirmed-desc">
                Thank you, Dr. {doctorName}. Your clinical order has been recorded in our Coimbatore
                fulfillment system. Our clinical logistics team will verify GST details and provide
                commercial dispatch tracking within 2 business hours.
              </p>
              <div className="confirmed-contact-box">
                <span>Immediate Delivery Inquiries:</span>
                <a href="tel:+919677777694">+91 96777 77694</a>
                <span>·</span>
                <a href="mailto:newvisiondent@gmail.com">newvisiondent@gmail.com</a>
              </div>
              <div className="confirmed-actions">
                <Link href="/" className="btn-confirmed-home">
                  Return to Home
                </Link>
                <Link href="/categories/surgical" className="btn-confirmed-browse">
                  Continue Browsing Equipment
                </Link>
              </div>
            </div>
          ) : (
            <div className="checkout-content-grid">
              {/* Left Column: Form */}
              <div className="checkout-form-col">
                <div className="checkout-header">
                  <span className="checkout-eyebrow">INSTITUTIONAL B2B PROCUREMENT</span>
                  <h1>Practice Checkout</h1>
                  <p>
                    Provide verified dental practice and delivery information for tax invoicing and
                    doorstep clinical logistics.
                  </p>
                </div>

                {error && <div className="checkout-error-banner">{error}</div>}

                <form onSubmit={handlePlaceOrder} className="checkout-form">
                  {/* Practice Details */}
                  <div className="checkout-fieldset">
                    <h3 className="fieldset-title">
                      <Building size={17} />
                      <span>Clinic & Doctor Credentials</span>
                    </h3>

                    <div className="form-grid-2">
                      <div className="checkout-input-group">
                        <label>Doctor / Clinician Name *</label>
                        <input
                          type="text"
                          required
                          value={doctorName}
                          onChange={(e) => setDoctorName(e.target.value)}
                          placeholder="Dr. Anand Natarajan"
                        />
                      </div>
                      <div className="checkout-input-group">
                        <label>Clinic / Practice Name *</label>
                        <input
                          type="text"
                          required
                          value={clinicName}
                          onChange={(e) => setClinicName(e.target.value)}
                          placeholder="Shree Dental Specialist Center"
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="checkout-input-group">
                        <label>Official Practice Email *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="orders@dentalclinic.com"
                        />
                      </div>
                      <div className="checkout-input-group">
                        <label>Contact Phone / Mobile *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 96777 77694"
                        />
                      </div>
                    </div>

                    <div className="checkout-input-group">
                      <label>Practice GSTIN (Optional, for 18% Input Tax Credit)</label>
                      <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="33AAAAA0000A1Z5"
                      />
                    </div>
                  </div>

                  {/* Delivery Location */}
                  <div className="checkout-fieldset">
                    <h3 className="fieldset-title">
                      <MapPin size={17} />
                      <span>Clinical Delivery Location</span>
                    </h3>

                    <div className="checkout-input-group full">
                      <label>Practice Street Address & Floor / Suite *</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Suite 204, MedZone Building, Ram Nagar"
                      />
                    </div>

                    <div className="form-grid-3">
                      <div className="checkout-input-group">
                        <label>City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div className="checkout-input-group">
                        <label>State *</label>
                        <input
                          type="text"
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                        />
                      </div>
                      <div className="checkout-input-group">
                        <label>PIN Code *</label>
                        <input
                          type="text"
                          required
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Preference */}
                  <div className="checkout-fieldset">
                    <h3 className="fieldset-title">
                      <Lock size={17} />
                      <span>B2B Settlement Method</span>
                    </h3>

                    <div className="payment-options-grid">
                      <label
                        className={`payment-option-card ${paymentMethod === 'bank_transfer' ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={() => setPaymentMethod('bank_transfer')}
                        />
                        <div>
                          <strong>Official RTGS / NEFT Commercial Wire</strong>
                          <p>Direct bank transfer upon proforma invoice receipt with instant dispatch.</p>
                        </div>
                      </label>

                      <label
                        className={`payment-option-card ${paymentMethod === 'clinical_invoice' ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'clinical_invoice'}
                          onChange={() => setPaymentMethod('clinical_invoice')}
                        />
                        <div>
                          <strong>Authorized Institutional Purchase Order</strong>
                          <p>30-day institutional credit for verified hospitals and group practices.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button type="submit" disabled={submitting} className="btn-place-order">
                    <span>{submitting ? 'Transmitting Order...' : 'Confirm Practice Order'}</span>
                    <ArrowRight size={17} />
                  </button>
                </form>
              </div>

              {/* Right Column: Order Summary */}
              <div className="checkout-summary-col">
                <div className="checkout-summary-card">
                  <h3>Equipment Summary</h3>

                  <div className="checkout-items-list">
                    {items.map((item) => (
                      <div key={item.product.id} className="checkout-item-row">
                        <img
                          src={item.product.images[0] || '/placeholder.jpg'}
                          alt={item.product.name}
                        />
                        <div className="checkout-item-info">
                          <span className="item-mfr">{item.product.manufacturer}</span>
                          <h4>{item.product.name}</h4>
                          <span className="item-qty">Qty: {item.quantity}</span>
                        </div>
                        <span className="item-price">
                          ₹
                          {((item.product.salePrice ?? item.product.price ?? 0) * item.quantity).toLocaleString(
                            'en-IN'
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="checkout-calc-block">
                    <div className="calc-row">
                      <span>Equipment Subtotal</span>
                      <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="calc-row">
                      <span>Applicable GST (18%)</span>
                      <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="calc-row">
                      <span>Clinical Delivery</span>
                      <span className="free-tag">Complimentary</span>
                    </div>
                    <div className="calc-divider" />
                    <div className="calc-row total">
                      <span>Total Invoice Amount</span>
                      <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="checkout-trust-box">
                    <ShieldCheck size={18} />
                    <div>
                      <strong>Official New Vision B2B Warranty</strong>
                      <p>
                        All equipment serial numbers registered directly with OEM manufacturers for
                        immediate warranty coverage and regional technician access.
                      </p>
                    </div>
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
