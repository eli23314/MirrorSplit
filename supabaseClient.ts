import { createClient } from '@supabase/supabase-js'

const supabaseUrl = typeof window !== 'undefined'
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : '';
const supabaseAnonKey = typeof window !== 'undefined'
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

