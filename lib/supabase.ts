import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Browser client — SINGLETON ─────────────────────────────────────────────
// One instance per browser tab. Re-creating the client on every call causes
// token-refresh races and breaks session persistence. The singleton ensures
// autoRefreshToken runs in exactly one place and localStorage is shared.
let _browserClient: ReturnType<typeof createClient> | null = null

export function createBrowserClient() {
  if (typeof window === 'undefined') {
    // SSR context — no localStorage, return a fresh client (not cached)
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  if (!_browserClient) {
    _browserClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _browserClient
}

// Legacy named export kept for any existing imports
export const supabase = createBrowserClient()

// ── Server client — never cached, service role, no session persistence ─────
// Passes cache:'no-store' to every internal fetch so Next.js data cache
// never serves stale Supabase query results between writes and reads.
export function createServerClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        fetch: (url: RequestInfo | URL, options?: RequestInit) =>
          fetch(url, { ...options, cache: 'no-store' }),
      },
    }
  )
}
