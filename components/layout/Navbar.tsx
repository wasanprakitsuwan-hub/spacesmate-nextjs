'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import AuthModal from '@/components/auth/AuthModal'

interface UserInfo {
  role:               string | null
  full_name:          string | null
  active_package:     string | null
  package_expires_at: string | null
  dashUrl:            string
}

function userHasActivePackage(info: UserInfo | null): boolean {
  if (!info) return false
  if (!info.active_package) return false
  if (!info.package_expires_at) return true   // null expiry = admin/unlimited
  return new Date(info.package_expires_at) > new Date()
}

function displayName(info: UserInfo | null, email: string | null | undefined): string {
  if (info?.full_name?.trim()) return info.full_name.trim().split(' ')[0]
  if (email) return email.split('@')[0]
  return 'บัญชีของฉัน'
}

export default function Navbar() {
  const pathname   = usePathname()
  const router     = useRouter()
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [authModal,   setAuthModal]   = useState(false)
  const [session,     setSession]     = useState<any>(null)
  const [userInfo,    setUserInfo]    = useState<UserInfo | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [userMenu,    setUserMenu]    = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function fetchUserInfo(token: string) {
    try {
      const r = await fetch('/api/auth/role', { headers: { Authorization: `Bearer ${token}` } })
      const d = await r.json()
      setUserInfo({
        role:               d.role               ?? null,
        full_name:          d.full_name           ?? null,
        active_package:     d.active_package      ?? null,
        package_expires_at: d.package_expires_at  ?? null,
        dashUrl: (d.role === 'admin' || d.role === 'super_admin') ? '/dashboard' : '/owner-dashboard',
      })
    } catch {
      setUserInfo(null)
    }
  }

  useEffect(() => {
    const supabase = createBrowserClient()

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s)
      if (s?.access_token) await fetchUserInfo(s.access_token)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s)
      if (s?.access_token) await fetchUserInfo(s.access_token)
      else setUserInfo(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const linkStyle = (href: string): React.CSSProperties => ({
    padding: '8px 14px',
    borderRadius: 20,
    fontSize: 14.5,
    fontWeight: isActive(href) ? 600 : 500,
    cursor: 'pointer',
    transition: 'all .2s',
    color: isActive(href) ? '#d97f11' : '#334155',
    background: isActive(href) ? 'rgba(217,127,17,0.12)' : 'transparent',
    textDecoration: 'none',
  })

  const ownerActive = isActive('/submit') || isActive('/manage')

  async function handleSignOut() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    setUserMenu(false)
    setSession(null)
    setUserInfo(null)
    router.push('/')
  }

  function handleListingClick(e: React.MouseEvent) {
    if (!session) {
      e.preventDefault()
      setAuthModal(true)
      return
    }
    if (!userHasActivePackage(userInfo)) {
      e.preventDefault()
      router.push('/pricing')
    }
    // Has active package → /submit link proceeds normally
  }

  const mobileLinks = [
    { label: 'ค้นหาที่พัก',       icon: 'search',    href: '/search' },
    { label: 'ลงประกาศปล่อยเช่า', icon: 'sell',       href: '/submit' },
    { label: 'รับฝากบริหาร',      icon: 'handshake',  href: '/manage' },
    { label: 'บทความ',            icon: 'article',    href: '/blog' },
    ...(session ? [{ label: 'แดชบอร์ด', icon: 'dashboard', href: userInfo?.dashUrl ?? '/owner-dashboard' }] : []),
  ]

  const uName = displayName(userInfo, session?.user?.email)

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#ffffff', borderBottom: '1px solid #eef0ef', boxShadow: '0 1px 8px -4px rgba(2,64,46,0.08)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', height: 66, display: 'flex', alignItems: 'center', gap: 30 }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Image src="/logo.png" alt="SpacesMate" width={168} height={52} style={{ height: 52, width: 'auto', display: 'block' }} priority />
        </Link>

        {/* Desktop nav links */}
        <div className="sm-navlinks" style={{ display: 'flex', gap: 4, marginLeft: 6, alignItems: 'center' }}>

          <Link href="/search" style={linkStyle('/search')}
            onMouseEnter={e => { if (!isActive('/search')) { (e.currentTarget as HTMLElement).style.background = '#f4f8f6'; (e.currentTarget as HTMLElement).style.color = '#02402e' } }}
            onMouseLeave={e => { if (!isActive('/search')) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#334155' } }}>
            ค้นหาที่พัก
          </Link>

          {/* สำหรับเจ้าของ dropdown */}
          <div className="sm-owner-menu" style={{ position: 'relative' }}>
            <a style={{
              padding: '8px 14px', borderRadius: 20, fontSize: 14.5, cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 3,
              fontWeight: ownerActive ? 600 : 500,
              color: ownerActive ? '#d97f11' : '#334155',
              background: ownerActive ? 'rgba(217,127,17,0.12)' : 'transparent',
            }}>
              สำหรับเจ้าของ <span className="msym" style={{ fontSize: 18 }}>expand_more</span>
            </a>
            <div className="sm-owner-pop">
              <Link href="/submit" style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '11px 13px', borderRadius: 12, cursor: 'pointer', transition: 'all .2s', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f4f8f6'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span className="msym" style={{ fontSize: 21, color: '#048c73', marginTop: 1 }}>sell</span>
                <span>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#231f20' }}>ลงประกาศปล่อยเช่า</span>
                  <span style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginTop: 1 }}>สร้างประกาศเอง ฟรี + แพ็กเกจ</span>
                </span>
              </Link>
              <Link href="/manage" style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '11px 13px', borderRadius: 12, cursor: 'pointer', transition: 'all .2s', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f4f8f6'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span className="msym" style={{ fontSize: 21, color: '#048c73', marginTop: 1 }}>handshake</span>
                <span>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#231f20' }}>รับฝากบริหาร</span>
                  <span style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginTop: 1 }}>ให้เราดูแลให้ครบวงจร</span>
                </span>
              </Link>
            </div>
          </div>

          <Link href="/blog" style={linkStyle('/blog')}
            onMouseEnter={e => { if (!isActive('/blog')) { (e.currentTarget as HTMLElement).style.background = '#f4f8f6'; (e.currentTarget as HTMLElement).style.color = '#02402e' } }}
            onMouseLeave={e => { if (!isActive('/blog')) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#334155' } }}>
            บทความ
          </Link>
        </div>

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

          {/* Auth area */}
          {!authLoading && (
            session ? (
              /* ── Username chip + dropdown ── */
              <div ref={userMenuRef} className="sm-hide-mobile" style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenu(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 14px', borderRadius: 22,
                    border: `1.5px solid ${userMenu ? '#02402e' : '#e2e8f0'}`,
                    background: userMenu ? '#f4f8f6' : '#fff',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .18s',
                    fontSize: 14, fontWeight: 600, color: '#02402e',
                  }}
                >
                  <span className="msym" style={{ fontSize: 17, color: '#048c73' }}>account_circle</span>
                  {uName}
                  <span className="msym" style={{ fontSize: 16, color: '#94a3b8', transition: 'transform .2s', display: 'inline-block', transform: userMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                </button>

                {/* Dropdown menu */}
                {userMenu && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 230, background: '#fff',
                    border: '1px solid #eef0ef', borderRadius: 16, padding: 7,
                    boxShadow: '0 18px 40px -14px rgba(2,64,46,0.22)',
                    zIndex: 60,
                  }}>
                    {/* User label */}
                    <div style={{ padding: '10px 13px 10px', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#02402e' }}>{uName}</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2, wordBreak: 'break-all' }}>{session?.user?.email}</div>
                    </div>

                    {/* 1 · ข้อมูลส่วนตัว */}
                    <Link href="/owner-dashboard/profile" onClick={() => setUserMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 10, fontSize: 13.5, fontWeight: 500, color: '#334155', textDecoration: 'none', transition: 'background .15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f4f8f6'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <span className="msym" style={{ fontSize: 18, color: '#048c73' }}>person</span>
                      ข้อมูลส่วนตัว
                    </Link>

                    {/* 2 · แดชบอร์ด */}
                    <Link href={userInfo?.dashUrl ?? '/owner-dashboard'} onClick={() => setUserMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 10, fontSize: 13.5, fontWeight: 500, color: '#334155', textDecoration: 'none', transition: 'background .15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f4f8f6'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <span className="msym" style={{ fontSize: 18, color: '#048c73' }}>dashboard</span>
                      แดชบอร์ด
                    </Link>

                    {/* Divider */}
                    <div style={{ height: 1, background: '#f1f5f9', margin: '4px 6px' }} />

                    {/* 3 · ออกจากระบบ */}
                    <button onClick={handleSignOut}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 10, fontSize: 13.5, fontWeight: 500, color: '#b91c1c', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fff5f5'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <span className="msym" style={{ fontSize: 18 }}>logout</span>
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setAuthModal(true)} className="sm-hide-mobile"
                style={{ fontSize: 14, fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 20, border: '1.5px solid #e2e8f0', background: '#fff', fontFamily: 'inherit', transition: 'all .18s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#02402e'; (e.currentTarget as HTMLElement).style.color = '#02402e' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#334155' }}>
                <span className="msym" style={{ fontSize: 17 }}>login</span>
                เข้าสู่ระบบ
              </button>
            )
          )}

          {/* ลงประกาศ CTA — checks package status before routing */}
          <Link href="/submit" onClick={handleListingClick}
            style={{ background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 14, padding: '10px 20px', borderRadius: 22, cursor: 'pointer', transition: 'all .2s', boxShadow: '0 4px 14px -4px rgba(217,127,17,0.5)', textDecoration: 'none', display: 'inline-block' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ''; (e.currentTarget as HTMLElement).style.transform = '' }}>
            ลงประกาศฟรี
          </Link>

          {/* Burger */}
          <button className="sm-burger" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ width: 42, height: 42, borderRadius: 12, border: '1px solid #e2e8f0', display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#334155', background: 'transparent' }}>
            <span className="msym" style={{ fontSize: 24 }}>{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div style={{ borderTop: '1px solid #eef0ef', background: '#fff', padding: '10px 16px 18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {mobileLinks.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px', borderRadius: 12, fontSize: 15.5, fontWeight: 500, cursor: 'pointer', color: '#334155', textDecoration: 'none', transition: 'all .2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f4f8f6'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span className="msym" style={{ fontSize: 21, color: '#048c73' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link href="/owner-dashboard/profile" onClick={() => setMobileOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px', borderRadius: 12, fontSize: 15.5, fontWeight: 500, cursor: 'pointer', color: '#334155', textDecoration: 'none', transition: 'all .2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f4f8f6'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <span className="msym" style={{ fontSize: 21, color: '#048c73' }}>person</span>
                  ข้อมูลส่วนตัว
                </Link>
                <button onClick={() => { setMobileOpen(false); handleSignOut() }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px', borderRadius: 12, fontSize: 15.5, fontWeight: 500, cursor: 'pointer', color: '#b91c1c', background: 'transparent', border: 'none', fontFamily: 'inherit', textAlign: 'left', transition: 'all .2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fff5f5'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <span className="msym" style={{ fontSize: 21, color: '#b91c1c' }}>logout</span>
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <button onClick={() => { setMobileOpen(false); setAuthModal(true) }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px', borderRadius: 12, fontSize: 15.5, fontWeight: 500, cursor: 'pointer', color: '#02402e', background: 'transparent', border: 'none', fontFamily: 'inherit', textAlign: 'left', transition: 'all .2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f4f8f6'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span className="msym" style={{ fontSize: 21, color: '#02402e' }}>login</span>
                เข้าสู่ระบบ / สมัครสมาชิก
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth modal */}
      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}

      <style>{`
        .sm-navlinks { display: flex !important; }
        .sm-hide-mobile { display: flex !important; }
        .sm-burger { display: none !important; }
        .sm-owner-pop {
          position: absolute; top: calc(100% + 6px); left: 0; width: 270px;
          background: #fff; border: 1px solid #eef0ef; border-radius: 16px; padding: 7px;
          box-shadow: 0 18px 40px -14px rgba(2,64,46,0.22); display: flex; flex-direction: column; gap: 2px;
          opacity: 0; visibility: hidden; transform: translateY(6px); transition: all .18s ease; z-index: 60;
        }
        .sm-owner-menu:hover .sm-owner-pop { opacity: 1; visibility: visible; transform: translateY(0); }
        @media (max-width: 900px) {
          .sm-navlinks { display: none !important; }
          .sm-hide-mobile { display: none !important; }
          .sm-burger { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
