import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from '../supabaseClient';

/** Ping Supabase Auth health — detects wrong URL, paused project, or offline network. */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured) {
    return { ok: false, code: 'unconfigured', message: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { ok: false, code: 'http_error', message: `Server responded with ${res.status}` };
    }
    return { ok: true, code: 'connected' };
  } catch (err) {
    clearTimeout(timeout);
    const msg = err?.message || String(err);

    if (err.name === 'AbortError') {
      return { ok: false, code: 'timeout', message: 'Connection timed out. Check your internet.' };
    }
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ENOTFOUND')) {
      return {
        ok: false,
        code: 'network',
        message:
          'Cannot reach your Supabase project. Open Supabase Dashboard → Project Settings → API and copy the exact Project URL. The project may be paused, deleted, or the URL in .env is wrong.',
      };
    }
    return { ok: false, code: 'unknown', message: msg };
  }
}

export function mapAuthError(error) {
  const msg = error?.message || error?.error_description || 'Authentication failed';

  if (
    msg.includes('Failed to fetch') ||
    msg.includes('fetch') ||
    error?.name === 'AuthRetryableFetchError'
  ) {
    return 'Network error: cannot reach Supabase. Verify your Project URL and anon key in .env, then restart npm run dev. For APK, add https://localhost to Supabase Auth → URL Configuration.';
  }
  if (msg.includes('Invalid login credentials')) {
    return 'Wrong email or password. Try again or sign up first.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Please confirm your email from the inbox link, or disable email confirmation in Supabase Auth settings.';
  }
  return msg;
}
