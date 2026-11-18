import fs from 'fs/promises'
import path from 'path'
import { CustomerUser, CustomerOrderSummary, CustomerAddress } from '@/lib/types/ecommerce'

const CUSTOMERS_FILE_PATH = path.join(process.cwd(), 'data', 'customers.json')

async function ensureCustomersFile(): Promise<void> {
  try {
    await fs.access(CUSTOMERS_FILE_PATH)
  } catch {
    const dir = path.dirname(CUSTOMERS_FILE_PATH)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(CUSTOMERS_FILE_PATH, JSON.stringify([], null, 2), 'utf-8')
  }
}

export async function getAllCustomers(): Promise<CustomerUser[]> {
  await ensureCustomersFile()
  try {
    const raw = await fs.readFile(CUSTOMERS_FILE_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CustomerUser[]) : []
  } catch (error) {
    console.error('[CUSTOMERS STORE] Error reading customers:', error)
    return []
  }
}

async function writeCustomers(customers: CustomerUser[]): Promise<void> {
  await ensureCustomersFile()
  await fs.writeFile(CUSTOMERS_FILE_PATH, JSON.stringify(customers, null, 2), 'utf-8')
}

export async function getCustomerByFirebaseUid(firebaseUid: string): Promise<CustomerUser | null> {
  if (!firebaseUid) return null
  const customers = await getAllCustomers()
  return customers.find((c) => c.firebaseUid === firebaseUid) || null
}

export async function getCustomerBySupabaseUid(supabaseUid: string): Promise<CustomerUser | null> {
  if (!supabaseUid) return null
  const customers = await getAllCustomers()
  return customers.find((c) => c.supabaseUid === supabaseUid) || null
}

export async function getCustomerById(id: string): Promise<CustomerUser | null> {
  if (!id) return null
  const customers = await getAllCustomers()
  return customers.find((c) => c.id === id) || null
}

export interface SyncCustomerPayload {
  supabaseUid?: string
  firebaseUid?: string
  name?: string
  email?: string
  phone?: string
  photoURL?: string
  provider: 'google' | 'phone' | 'email' | 'password' | 'supabase'
  clinicName?: string
}

export async function findOrCreateCustomer(payload: SyncCustomerPayload): Promise<CustomerUser> {
  const customers = await getAllCustomers()
  const existingIndex = customers.findIndex(
    (c) =>
      (payload.supabaseUid && c.supabaseUid === payload.supabaseUid) ||
      (payload.firebaseUid && c.firebaseUid === payload.firebaseUid) ||
      (payload.email && c.email?.toLowerCase() === payload.email.trim().toLowerCase())
  )
  const now = new Date().toISOString()

  if (existingIndex !== -1) {
    // Returning customer: update lastLoginAt and any newly provided verified fields
    const current = customers[existingIndex]
    const updated: CustomerUser = {
      ...current,
      supabaseUid: payload.supabaseUid || current.supabaseUid,
      firebaseUid: payload.firebaseUid || current.firebaseUid,
      name: payload.name?.trim() || current.name || 'Practitioner',
      email: payload.email?.trim().toLowerCase() || current.email,
      phone: payload.phone?.trim() || current.phone,
      photoURL: payload.photoURL || current.photoURL,
      provider: payload.provider || current.provider,
      clinicName: payload.clinicName?.trim() || current.clinicName,
      lastLoginAt: now,
    }
    customers[existingIndex] = updated
    await writeCustomers(customers)
    return updated
  }

  // New genuine customer account creation
  const newCustomer: CustomerUser = {
    id: `cust_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    supabaseUid: payload.supabaseUid,
    firebaseUid: payload.firebaseUid,
    name: payload.name?.trim() || (payload.email ? payload.email.split('@')[0] : 'Clinical Member'),
    email: payload.email?.trim().toLowerCase() || undefined,
    phone: payload.phone?.trim() || undefined,
    photoURL: payload.photoURL || undefined,
    provider: payload.provider,
    clinicName: payload.clinicName?.trim() || '',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641009',
    role: payload.email?.toLowerCase().includes('admin@newvision') ? 'admin' : 'customer',
    savedAddresses: [],
    orders: [],
    createdAt: now,
    lastLoginAt: now,
  }

  customers.unshift(newCustomer)
  await writeCustomers(customers)
  return newCustomer
}

export async function updateCustomerProfile(
  id: string,
  updates: Partial<CustomerUser>
): Promise<CustomerUser | null> {
  const customers = await getAllCustomers()
  const index = customers.findIndex((c) => c.id === id || c.firebaseUid === id)
  if (index === -1) return null

  const current = customers[index]
  const updated: CustomerUser = {
    ...current,
    name: updates.name?.trim() ?? current.name,
    clinicName: updates.clinicName?.trim() ?? current.clinicName,
    gstin: updates.gstin?.trim() ?? current.gstin,
    city: updates.city?.trim() ?? current.city,
    state: updates.state?.trim() ?? current.state,
    pincode: updates.pincode?.trim() ?? current.pincode,
    phone: updates.phone?.trim() ?? current.phone,
    lastLoginAt: new Date().toISOString(),
  }

  customers[index] = updated
  await writeCustomers(customers)
  return updated
}

export async function addCustomerOrder(
  customerIdOrUid: string,
  order: CustomerOrderSummary
): Promise<boolean> {
  const customers = await getAllCustomers()
  const index = customers.findIndex(
    (c) => c.id === customerIdOrUid || c.firebaseUid === customerIdOrUid
  )
  if (index === -1) return false

  const customer = customers[index]
  const orders = customer.orders || []
  orders.unshift(order)
  customer.orders = orders

  customers[index] = customer
  await writeCustomers(customers)
  return true
}
