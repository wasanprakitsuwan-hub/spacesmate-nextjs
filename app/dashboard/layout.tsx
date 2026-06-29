'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

const NAV = [
  { href: '/dashboard',            label: 'ภาพรวมระบบ',       icon: '⊞',  exact: true },
  { href: '/dashboard/listings',   label: 'จัดการประกาศ',     icon: '🏠', exact: false },
  { href: '/dashboard/users',      label: 'ผู้ใช้งาน',         icon: '👥', exact: false },
  { href: '/dashboard/revenue',    label: 'แพ็กเกจ & รายได้', icon: '💳', exact: false },
  { href: '/dashboard/enquiries',  label: 'คำขอรับบริการ',    icon: '🤝', exact: false, badge: 0 },
  { href: '/dashboard/blog',       label: 'บทความ',            icon: '📝', exact: false },
  { href: '/dashboard/settings',   label: 'ตั้งค่า',           icon: '⚙️', exact: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [authReady, setAuthReady] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [pendingBadge, setPendingBadge] = useState(0)

  useEffect(() => {
    const supabase = createBrowserClient()

    // getSession() reads localStorage directly — instant, no async wait.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      setUserEmail(session.user.email ?? '')

      // Role check — only 'admin' can access /dashboard
      // Best-effort: if profile fetch fails, fall through (don't lock out admin)
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        if (profile && profile.role === 'landlord') {
          router.replace('/owner-dashboard')
          return
        }
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
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(d => setPendingBadge(d.pending ?? 0))
      .catch(() => {})
  }, [authReady])

  async function handleLogout() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!authReady) {
    return (
      <div style={{ minHeight: '100vh', background: '#02402e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #d97f11', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const initial = (userEmail.charAt(0) || 'A').toUpperCase()
  const displayName = userEmail.split('@')[0] || 'Admin'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f5', fontFamily: "'Prompt', -apple-system, sans-serif" }}>

      {/* ── SIDEBAR ─────────────────────────────────── */}
      <aside style={{
        width: 248, flexShrink: 0, background: '#02402e',
        padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4,
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px 20px' }}>
          <span style={{
            width: 30, height: 30, borderRadius: 9, background: '#d97f11',
            color: '#02402e', fontWeight: 700, fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>S</span>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>SpacesMate</div>
            <div style={{ color: '#d97f11', fontSize: 10, fontWeight: 600, letterSpacing: 1.5 }}>ADMIN</div>
          </div>
        </div>

        {/* Nav */}
        {NAV.map(n => {
          const isActive = n.exact ? pathname === n.href : (pathname ?? '').startsWith(n.href)
          const badge = n.href === '/dashboard/listings' ? pendingBadge : (n.badge || 0)
          return (
            <Link key={n.href} href={n.href} style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '11px 13px', borderRadius: 11,
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              textDecoration: 'none', transition: 'all .18s',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{n.icon}</span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {badge > 0 && (
                <span style={{
                  background: '#d97f11', color: '#fff', fontSize: 11, fontWeight: 600,
                  minWidth: 20, height: 20, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px',
                }}>{badge}</span>
              )}
            </Link>
          )
        })}

        {/* User footer */}
        <div style={{ marginTop: 'auto', padding: '14px 13px 4px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 34, height: 34, borderRadius: '50%', background: '#048c73',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: 14, flexShrink: 0,
          }}>{initial}</span>
          <div style={{ lineHeight: 1.2, minWidth: 0, flex: 1 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Space Works</div>
          </div>
          <button onClick={handleLogout} title="ออกจากระบบ" style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer', fontSize: 18, padding: '0 2px', lineHeight: 1,
          }}>⇥</button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #eef0ef',
          padding: '0 32px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <Link href="/" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
            ← กลับไปยังเว็บไซต์
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, background: '#f4f6f5',
              borderRadius: 11, padding: '8px 14px', fontSize: 13, color: '#94a3b8',
              minWidth: 200, border: '1px solid #eef0ef',
            }}>
              🔍 <span>ค้นหา...</span>
            </div>
            <span style={{
              position: 'relative', width: 40, height: 40, borderRadius: 11,
              background: '#f4f6f5', border: '1px solid #eef0ef',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 20,
            }}>
              🔔
              <span style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: '50%', background: '#d97f11' }} />
            </span>
          </div>
        </header>

        {/* Page */}
        <main style={{ flex: 1, padding: '28px 32px 56px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
