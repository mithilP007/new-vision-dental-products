'use client'

import React from 'react'
import { AuthProvider } from '@/lib/ecommerce/auth-context'
import { WishlistProvider } from '@/lib/ecommerce/wishlist-context'
import { CartProvider } from '@/lib/ecommerce/cart-context'
import { CartDrawer } from '@/components/cart-drawer'
import { AuthModal } from '@/components/auth-modal'
import { GlobalSearchModal } from '@/components/global-search-modal'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          {children}
          <CartDrawer />
          <AuthModal />
          <GlobalSearchModal />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  )
}
