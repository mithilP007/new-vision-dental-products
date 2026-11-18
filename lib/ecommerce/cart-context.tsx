'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Product, CartItem } from '@/lib/types/ecommerce'
import { useAuth } from './auth-context'

interface CartContextType {
  items: CartItem[]
  totalItems: number
  subtotal: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addToCart: (product: Product, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const GUEST_CART_KEY = 'nv_cart_guest'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const currentStorageKey = user ? `nv_cart_cust_${user.id}` : GUEST_CART_KEY

  // Load and merge cart on user change or initial mount
  useEffect(() => {
    try {
      if (user) {
        // Customer is authenticated
        const customerCartKey = `nv_cart_cust_${user.id}`
        const customerStored = localStorage.getItem(customerCartKey)
        let customerItems: CartItem[] = customerStored ? JSON.parse(customerStored) : []

        // Check if there was an active guest cart to merge
        const guestStored = localStorage.getItem(GUEST_CART_KEY)
        if (guestStored) {
          const guestItems: CartItem[] = JSON.parse(guestStored)
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            const merged = [...customerItems]
            guestItems.forEach((guestItem) => {
              const existingIndex = merged.findIndex(
                (item) => item.product.id === guestItem.product.id
              )
              if (existingIndex > -1) {
                merged[existingIndex].quantity += guestItem.quantity
              } else {
                merged.push(guestItem)
              }
            })
            customerItems = merged
            // Clear guest cart after successful merge
            localStorage.removeItem(GUEST_CART_KEY)
          }
        }

        setItems(customerItems)
        localStorage.setItem(customerCartKey, JSON.stringify(customerItems))
      } else {
        // Guest mode
        const guestStored = localStorage.getItem(GUEST_CART_KEY)
        if (guestStored) {
          const parsed = JSON.parse(guestStored)
          if (Array.isArray(parsed)) {
            setItems(parsed)
          }
        } else {
          setItems([])
        }
      }
    } catch (e) {
      console.warn('[CART] Could not parse localStorage:', e)
    } finally {
      setIsInitialized(true)
    }
  }, [user])

  // Save to active storage key whenever items change
  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem(currentStorageKey, JSON.stringify(items))
    } catch (e) {
      console.warn('[CART] Could not save to localStorage:', e)
    }
  }, [items, isInitialized, currentStorageKey])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), [])

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    if (!product || product.isQuoteOnly || product.price === null) {
      return
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id)
      if (existingIndex > -1) {
        const next = [...prev]
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        }
        return next
      } else {
        return [
          ...prev,
          {
            product,
            quantity,
            addedAt: new Date().toISOString(),
          },
        ]
      }
    })

    setIsOpen(true)
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId)
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = items.reduce((acc, item) => {
    const price = item.product.salePrice ?? item.product.price ?? 0
    return acc + price * item.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
