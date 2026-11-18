'use client'

import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseUrl, getSupabaseAnonKey } from './config'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  const supabaseUrl = getSupabaseUrl() || 'https://placeholder.supabase.co'
  const supabaseAnonKey = getSupabaseAnonKey() || 'placeholder-anon-key'

  client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return client
}
