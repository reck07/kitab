import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/$/, '');
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const isValidSupabaseUrl =
  isSupabaseConfigured && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl);

const isJwtAnonKey = supabaseAnonKey?.startsWith('eyJ');
const isPublishableKey = supabaseAnonKey?.startsWith('sb_publishable_');

if (!isSupabaseConfigured) {
  console.warn('[Kitāb] Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env then restart dev server.');
} else {
  if (!isValidSupabaseUrl) {
    console.warn('[Kitāb] VITE_SUPABASE_URL should be https://YOUR-REF.supabase.co (no trailing path).');
  }
  if (!isJwtAnonKey && !isPublishableKey) {
    console.warn('[Kitāb] Anon key should start with eyJ... (legacy) or sb_publishable_... (new). Copy from Supabase → API keys.');
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      global: {
        fetch: (url, options = {}) =>
          fetch(url, { ...options, cache: 'no-store' }),
      },
    })
  : null;
