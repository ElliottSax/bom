/**
 * Supabase Client Configuration for Web App
 *
 * This file configures the Supabase client for use in the Next.js web app.
 * It provides a singleton instance that can be imported throughout the app.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check .env.local'
  )
}

/**
 * Supabase client instance
 *
 * This client is configured with:
 * - Auto-refresh tokens
 * - Persistent sessions
 * - Real-time subscriptions
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

/**
 * Database types (auto-generated from schema)
 *
 * To regenerate these types:
 * 1. Run: supabase gen types typescript --project-id YOUR_PROJECT_REF > apps/web/lib/database.types.ts
 * 2. Import: import { Database } from './database.types'
 * 3. Use: createClient<Database>(...)
 */
