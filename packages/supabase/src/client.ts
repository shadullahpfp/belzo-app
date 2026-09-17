import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';
import { Database } from './types';

/**
 * Shared Browser / Mobile / Node Supabase Client Factory
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseClientOptions<'public'>
): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      '[Belzo Supabase] Missing Supabase URL or Anon/Service Key. Please configure environment variables.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: typeof globalThis !== 'undefined' && 'window' in globalThis,
      ...options?.auth,
    },
    ...options,
  });
}
