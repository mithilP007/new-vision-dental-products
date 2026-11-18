'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Product, WishlistItem } from '@/lib/types/ecommerce'
import { useAuth } from './auth-context'

interface WishlistContextType {
  items: WishlistItem[]
  totalItems: number
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (product: Product) => void
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const GUEST_WISHLIST_KEY = 'nv_wishlist_guest'

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  const currentStorageKey = user ? `nv_wishlist_cust_${user.id}` : GUEST_WISHLIST_KEY

  // Load and merge wishlist on user change
  useEffect(() => {
    try {
      if (user) {
        const customerKey = `nv_wishlist_cust_${user.id}`
        const customerStored = localStorage.getItem(customerKey)
        let customerItems: WishlistItem[] = customerStored ? JSON.parse(customerStored) : []

        // Merge guest wishlist
        const guestStored = localStorage.getItem(GUEST_WISHLIST_KEY)
        if (guestStored) {
          const guestItems: WishlistItem[] = JSON.parse(guestStored)
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            const merged = [...customerItems]
            guestItems.forEach((guestItem) => {
              if (!merged.some((i) => i.product.id === guestItem.product.id)) {
                merged.push(guestItem)
              }
            })
            customerItems = merged
            localStorage.removeItem(GUEST_WISHLIST_KEY)
          }
        }

        setItems(customerItems)
        localStorage.setItem(customerKey, JSON.stringify(customerItems))
      } else {
        const guestStored = localStorage.getItem(GUEST_WISHLIST_KEY)
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
      console.warn('[WISHLIST] Could not parse localStorage:', e)
    } finally {
      setIsInitialized(true)
    }
  }, [user])

  // Save to active storage key
  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem(currentStorageKey, JSON.stringify(items))
    } catch (e) {
      console.warn('[WISHLIST] Could not save to localStorage:', e)
    }
  }, [items, isInitialized, currentStorageKey])

  const isInWishlist = useCallback(
    (productId: string) => {
      return items.some((item) => item.product.id === productId)
    },
    [items]
  )

  const addToWishlist = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((item) => item.product.id === product.id)) return prev
      return [...prev, { product, addedAt: new Date().toISOString() }]
    })
  }, [])

  const removeFromWishlist = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }, [])

  const toggleWishlist = useCallback((product: Product) => {
    setItems((prev) => {
      const exists = prev.some((item) => item.product.id === product.id)
      if (exists) {
        return prev.filter((item) => item.product.id !== product.id)
      } else {
        return [...prev, { product, addedAt: new Date().toISOString() }]
      }
    })
  }, [])

  const clearWishlist = useCallback(() => {
    setItems([])
  }, [])

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalItems: items.length,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
