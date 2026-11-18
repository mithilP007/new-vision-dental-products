import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseAnonKey } from './config'

/**
 * Server-only Admin Client.
 * Uses SUPABASE_SERVICE_ROLE_KEY if set, otherwise falls back to public anon key.
 * NEVER expose this or import this in client-side components.
 */
export function createAdminClient() {
  const supabaseUrl = getSupabaseUrl()
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    getSupabaseAnonKey()

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
