'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

export default function OwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const supabase = createBrowserClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      setUserEmail(session.user.email ?? '')

      // If admin/super_admin → send to admin dashboard (use service-role API to bypass RLS)
      try {
        const r = await fetch('/api/auth/role', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const { role } = await r.json()
        if (role === 'admin' || role === 'super_admin') { router.replace('/dashboard'); return }
      } catch { /* proceed as owner */ }

      setAuthReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login')
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setUserEmail(session.user.email ?? '')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

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

  const initial = (userEmail.charAt(0) || 'O').toUpperCase()
  const displayName = userEmail.split('@')[0] || 'Owner'

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f5', fontFamily: "'Prompt', -apple-system, sans-serif" }}>

      {/* Top Navigation */}
      <header style={{
        background: '#02402e',
        padding: '0 32px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 10, background: '#d97f11',
            color: '#02402e', fontWeight: 700, fontSize: 17,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>S</span>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>SpacesMate</div>
            <div style={{ color: '#d97f11', fontSize: 10, fontWeight: 600, letterSpacing: 1.5 }}>OWNER PORTAL</div>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link href="/owner-dashboard" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '8px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.1)' }}>
            ประกาศของฉัน
          </Link>
          <Link href="/submit" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '8px 14px', borderRadius: 9 }}>
            + ลงประกาศใหม่
          </Link>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, textDecoration: 'none', padding: '8px 14px', borderRadius: 9 }}>
            เว็บไซต์
          </Link>
        </div>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 34, height: 34, borderRadius: '50%', background: '#048c73',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: 14,
          }}>{initial}</span>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer', fontSize: 13, padding: '7px 14px', borderRadius: 9, fontFamily: 'inherit', fontWeight: 500,
          }}>
            ออกจากระบบ
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 72px' }}>
        {children}
      </main>
    </div>
  )
}
