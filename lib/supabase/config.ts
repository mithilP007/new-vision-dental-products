/**
 * Supabase Project Configuration & URL Helper
 */

export const BUCKET_NAME = 'product-images'

export function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return ''
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return sanitizeSupabaseUrl(url)
}

export function getSupabaseAnonKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder') &&
    !url.includes('your-project') &&
    !key.includes('your_anon_key') &&
    !key.includes('placeholder')
  )
}
