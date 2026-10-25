'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { C, RADIUS } from '@/lib/ui'

const NAV = [
  { href: '/dashboard',                  label: 'ภาพรวมระบบ',    icon: 'grid_view',        exact: true },
  { href: '/dashboard/listings',         label: 'จัดการประกาศ',  icon: 'apartment',         exact: false },
  // superAdminOnly: admin and super_admin are otherwise equivalent — control of
  // user accounts is the one capability reserved to super_admin.
  { href: '/dashboard/users',            label: 'ผู้ใช้งาน',      icon: 'manage_accounts',  exact: false, superAdminOnly: true },
  { href: '/dashboard/pages',            label: 'หน้าเว็บ (Pages)', icon: 'web',             exact: false },
  // Property names, places, stations and their SEO pages — one menu.
  { href: '/dashboard/places',           label: 'สถานที่ค้นหา',   icon: 'travel_explore',    exact: false },
  // Landing pages per station, university and landmark: shared template and per-page text.
  { href: '/dashboard/rent-pages',       label: 'หน้าทำเล',       icon: 'location_city',     exact: false },
  { href: '/dashboard/revenue',          label: 'รายได้',         icon: 'bar_chart',         exact: false },
  { href: '/dashboard/blog',             label: 'บทความ',         icon: 'article',           exact: false },
  { href: '/dashboard/settings',         label: 'ตั้งค่า',        icon: 'settings',          exact: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [authReady, setAuthReady] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userRole,  setUserRole]  = useState<'admin' | 'super_admin'>('admin')
  const [pendingBadge, setPendingBadge] = useState(0)

  useEffect(() => {
    const supabase = createBrowserClient()

    // getSession() reads localStorage directly — instant, no async wait.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      setUserEmail(session.user.email ?? '')

      // Role check via service-role API — bypasses RLS completely
      try {
        const r = await fetch('/api/auth/role', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const { role } = await r.json()
        if (role === 'landlord') { router.replace('/owner-dashboard'); return }
        if (role === 'super_admin') setUserRole('super_admin')
        else setUserRole('admin')
      } catch { /* network error — proceed */ }

      setAuthReady(true)
    })

    // onAuthStateChange handles sign-out and silent token refresh only.
    // We do NOT redirect on every event — only when explicitly signed out.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login')
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setUserEmail(session.user.email ?? '')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    if (!authReady) return
    // The sidebar's pending badge. Without the token this was a 401 and the
    // badge silently stayed at 0 forever — so a queue of submissions waiting for
    // review looked like an empty one.
    ;(async () => {
      try {
        const { data: { session } } = await createBrowserClient().auth.getSession()
        if (!session) return
        const r = await fetch('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (!r.ok) return
        const d = await r.json()
        setPendingBadge(d.pending ?? 0)
      } catch { /* a missing badge is not worth interrupting the page for */ }
    })()
  }, [authReady])

  async function handleLogout() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!authReady) {
    return (
      <div style={{ minHeight: '100vh', background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: `3px solid ${C.teal}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const displayName = userEmail.split('@')[0] || 'Admin'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.paper, fontFamily: "'Prompt', -apple-system, sans-serif" }}>

      {/* ── SIDEBAR ── calm green rail, as in the approved admin mockups */}
      <aside className="sm-adm-side" style={{
        width: 232, flexShrink: 0, background: C.green,
        padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 2,
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* logo-white-h.png is the white mark cropped to its edges; see git history for why. */}
        <div style={{ padding: '2px 10px 20px', display: 'flex', alignItems: 'baseline', gap: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-white-h.png" alt="SpacesMate" style={{ width: 112, height: 'auto', display: 'block' }} />
          <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 12 }}>แอดมิน</span>
        </div>

        {NAV.filter(n => !('superAdminOnly' in n && n.superAdminOnly) || userRole === 'super_admin').map(n => {
          const isActive = n.exact ? pathname === n.href : (pathname ?? '').startsWith(n.href)
          const badge = n.href === '/dashboard/listings' ? pendingBadge : 0
          return (
            <Link key={n.href} href={n.href} aria-current={isActive ? 'page' : undefined} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 11px', borderRadius: RADIUS,
              fontSize: 14, textDecoration: 'none',
              color: isActive ? C.white : 'rgba(255,255,255,0.72)',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              fontWeight: isActive ? 500 : 400,
            }}>
              <span className="msym" style={{ fontSize: 19, lineHeight: 1, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{n.icon}</span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {badge > 0 && (
                <span style={{ background: C.white, color: C.green, fontSize: 11.5, fontWeight: 600, minWidth: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>{badge}</span>
              )}
            </Link>
          )
        })}

        <div style={{ marginTop: 'auto', padding: '14px 11px 2px', borderTop: '1px solid rgba(255,255,255,0.12)', display: 'grid', gap: 10 }}>
          <Link href="/" style={{ fontSize: 13.5, color: 'rgba(255,255,255,.75)', textDecoration: 'none' }}>← ดูเว็บไซต์</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ lineHeight: 1.3, minWidth: 0, flex: 1 }}>
              <div style={{ color: C.white, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{userRole === 'super_admin' ? 'Super admin' : 'Admin'}</div>
            </div>
            <button onClick={handleLogout} title="ออกจากระบบ" aria-label="ออกจากระบบ" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 2, lineHeight: 1 }}>
              <span className="msym" style={{ fontSize: 19, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── (the old top bar's search box and bell did nothing, so they are gone) */}
      <main style={{ flex: 1, minWidth: 0, padding: '28px 32px 56px' }} data-caller-role={userRole}>
        {children}
      </main>
    </div>
  )
}
