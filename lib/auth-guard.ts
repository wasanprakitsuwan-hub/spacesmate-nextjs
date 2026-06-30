import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase'

export type AuthUser = { id: string; email: string; role: 'admin' | 'super_admin' | 'landlord' }

/**
 * Verify JWT from Authorization header and require admin or super_admin role.
 * Returns AuthUser on success, NextResponse (error) on failure.
 * Usage: const auth = await requireAdmin(req); if (isErr(auth)) return auth
 */
export async function requireAdmin(req: NextRequest): Promise<AuthUser | NextResponse> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim()
  if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  try {
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data: { user }, error } = await anon.auth.getUser(token)
    if (error || !user) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })

    const svc = createServerClient()
    const { data: profile } = await svc.from('user_profiles').select('role').eq('id', user.id).single()
    const role = profile?.role

    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    return { id: user.id, email: user.email!, role: role as AuthUser['role'] }
  } catch {
    return NextResponse.json({ error: 'Auth check failed' }, { status: 500 })
  }
}

/**
 * Verify JWT from Authorization header — any authenticated user.
 * Returns { id, email } on success, NextResponse (error) on failure.
 */
export async function requireAuth(req: NextRequest): Promise<{ id: string; email: string } | NextResponse> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim()
  if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  try {
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data: { user }, error } = await anon.auth.getUser(token)
    if (error || !user) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    return { id: user.id, email: user.email! }
  } catch {
    return NextResponse.json({ error: 'Auth check failed' }, { status: 500 })
  }
}

/** Type guard: true when requireAdmin/requireAuth returned an error response */
export function isErr(v: unknown): v is NextResponse {
  return v instanceof NextResponse
}
