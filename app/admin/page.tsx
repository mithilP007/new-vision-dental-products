import type { Metadata } from 'next'
import { AdminProductManagement } from '@/components/admin-product-management'
import { BUSINESS_CONFIG } from '@/lib/business-config'

export const metadata: Metadata = {
  title: `Product Management Admin | ${BUSINESS_CONFIG.name}`,
  description: 'Manage dental product catalogue, categories, manufacturers, specifications, and clinical pricing.',
}

export default function AdminPage() {
  return <AdminProductManagement />
}
