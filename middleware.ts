import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// SpacesMate middleware — enforce unpublished pages → 404
//
// Unpublished page list is fetched from /api/dashboard/pages/unpublished
// and cached in module scope for 60 seconds to avoid per-request DB hits.
// On DB error, middleware fails open (does NOT block pages).
// ─────────────────────────────────────────────────────────────────────────────

let unpublishedPaths: string[] = []
let cacheExpiry = 0

async function getUnpublishedPaths(origin: string): Promise<string[]> {
  const now = Date.now()
  if (now < cacheExpiry) return unpublishedPaths

  try {
    const res = await fetch(`${origin}/api/dashboard/pages/unpublished`, {
      next: { revalidate: 60 },
    })
    if (res.ok) {
      const data = await res.json()
      unpublishedPaths = data.paths ?? []
    }
  } catch {
    // Fail open — DB error should not block the site
  }

  cacheExpiry = now + 60_000 // refresh every 60s
  return unpublishedPaths
}

// Paths to always skip (admin, API, static, Next internals)
const SKIP_PREFIXES = [
  '/dashboard',
  '/owner-dashboard',
  '/api/',
  '/_next/',
  '/favicon',
  '/logo',
  '/fonts',
  '/images',
]

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl

  // Skip admin/API/static paths
  if (SKIP_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check if this path is unpublished
  const blocked = await getUnpublishedPaths(origin)

  if (blocked.includes(pathname)) {
    // Return a clean 404 — rewrite to Next.js not-found
    const url = req.nextUrl.clone()
    url.pathname = '/not-found'
    return NextResponse.rewrite(url, { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
}
