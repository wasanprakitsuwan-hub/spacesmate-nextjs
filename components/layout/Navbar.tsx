'use client'

// Link here is LocaleLink: it keeps the reader in the language they are already
// reading, so an href written as a Thai path resolves to its English
// counterpart on /en/* pages. An href with no English page passes through
// unchanged. The list of which is in lib/routes-i18n, deliberately not
// repeated here — it was copied into 16 files and went stale in all of them
// the moment /manage and /blog got English pages. See
// components/ui/LocaleLink and lib/routes-i18n.
import Link from '@/components/ui/LocaleLink'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createBrowserClient } from '@/lib/supabase'
// Lazy-load AuthModal — 369-line component, only needed when user clicks เข้าสู่ระบบ
const AuthModal = dynamic(() => import('@/components/auth/AuthModal'), { ssr: false })
import LanguageToggle, { MobileLanguageToggle } from '@/components/layout/LanguageToggle'
import { SITE_T } from '@/lib/site-i18n'
import { localeHref } from '@/lib/routes-i18n'
import { useLocale } from '@/lib/use-locale'
import { C, RADIUS } from '@/lib/ui'

interface UserInfo {
  role:               string | null
  full_name:          string | null
  active_package:     string | null
  package_expires_at: string | null
  dashUrl:            string
}

function displayName(info: UserInfo | null, email: string | null | undefined, fallback: string): string {
  if (info?.full_name?.trim()) return info.full_name.trim().split(' ')[0]
  if (email) return email.split('@')[0]
  return fallback
}

export default function Navbar() {
  const pathname   = usePathname()
  const locale     = useLocale()
  const t          = SITE_T[locale]
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

  // Quiet links: ink by default, green with a 2px underline when current.
  const linkStyle = (href: string): React.CSSProperties => ({
    padding: '8px 2px',
    margin: '0 10px',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    color: isActive(href) ? C.green : C.ink,
    borderBottom: `2px solid ${isActive(href) ? C.green : 'transparent'}`,
    textDecoration: 'none',
  })

  const ownerActive = isActive('/list-your-property') || isActive('/manage')

  async function handleSignOut() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    setUserMenu(false)
    setSession(null)
    setUserInfo(null)
    router.push('/')
  }

  // Every "list a property" button goes to the listing form. A logged-out
  // owner registers first and is sent back to the form; after saving, the form
  // itself decides between publishing (free slot) and checkout.
  function handleListingClick(e: React.MouseEvent) {
    if (session) return
    e.preventDefault()
    const form = localeHref('/list-your-property/new', locale)
    router.push(`${localeHref('/login', locale)}?tab=signup&redirect=${encodeURIComponent(form)}`)
  }

  const mobileLinks = [
    { label: t.navSearch,  icon: 'search',    href: '/search' },
    { label: t.navSubmit,  icon: 'sell',       href: '/list-your-property' },
    { label: t.navManage,  icon: 'handshake',  href: '/manage' },
    { label: t.navBlog,    icon: 'article',    href: '/blog' },
    ...(session ? [{ label: t.navDashboard, icon: 'dashboard', href: userInfo?.dashUrl ?? '/owner-dashboard' }] : []),
  ]

  const uName = displayName(userInfo, session?.user?.email, t.navMyAccount)

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: C.paper, borderBottom: `1px solid ${C.line}` }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', gap: 28 }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Image src="/logo.png" unoptimized alt="SpacesMate" width={130} height={40} style={{ height: 40, width: 'auto', display: 'block' }} priority />
        </Link>

        {/* Desktop nav links */}
        <div className="sm-navlinks" style={{ display: 'flex', gap: 0, marginLeft: 4, alignItems: 'center' }}>

          <Link href="/search" style={linkStyle('/search')}
            className="sm-navlink">
            {t.navSearch}
          </Link>

          {/* สำหรับเจ้าของ dropdown */}
          <div className="sm-owner-menu" style={{ position: 'relative' }}>
            <a className="sm-navlink" style={{
              padding: '8px 2px', margin: '0 10px', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2,
              fontWeight: 500,
              color: ownerActive ? C.green : C.ink,
              borderBottom: `2px solid ${ownerActive ? C.green : 'transparent'}`,
            }}>
              {t.navForOwners} <span className="msym" style={{ fontSize: 18 }}>expand_more</span>
            </a>
            <div className="sm-owner-pop">
              <Link href="/list-your-property" style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '11px 13px', borderRadius: 6, cursor: 'pointer', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.paper}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span className="msym" style={{ fontSize: 21, color: C.teal, marginTop: 1 }}>sell</span>
                <span>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#231f20' }}>{t.navSubmit}</span>
                  <span style={{ display: 'block', fontSize: 12, color: C.muted, marginTop: 1 }}>{t.navSubmitDesc}</span>
                </span>
              </Link>
              <Link href="/manage" style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '11px 13px', borderRadius: 6, cursor: 'pointer', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.paper}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span className="msym" style={{ fontSize: 21, color: C.teal, marginTop: 1 }}>handshake</span>
                <span>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#231f20' }}>{t.navManage}</span>
                  <span style={{ display: 'block', fontSize: 12, color: C.muted, marginTop: 1 }}>{t.navManageDesc}</span>
                </span>
              </Link>
            </div>
          </div>

          <Link href="/blog" style={linkStyle('/blog')}
            className="sm-navlink">
            {t.navBlog}
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
                    padding: '8px 12px', borderRadius: 6,
                    border: `1px solid ${userMenu ? C.green : C.border}`,
                    background: C.white,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .18s',
                    fontSize: 14, fontWeight: 500, color: C.green,
                  }}
                >
                  <span className="msym" style={{ fontSize: 17, color: C.teal }}>account_circle</span>
                  {uName}
                  <span className="msym" style={{ fontSize: 16, color: '#94a3b8', transition: 'transform .2s', display: 'inline-block', transform: userMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                </button>

                {/* Dropdown menu */}
                {userMenu && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 230, background: '#fff',
                    border: `1px solid ${C.line}`, borderRadius: 8, padding: 6,
                    boxShadow: '0 10px 28px -16px rgba(35,31,32,0.25)',
                    zIndex: 60,
                  }}>
                    {/* User label */}
                    <div style={{ padding: '10px 13px 10px', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#02402e' }}>{uName}</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2, wordBreak: 'break-all' }}>{session?.user?.email}</div>
                    </div>

                    {/* 1 · ข้อมูลส่วนตัว */}
                    <Link href="/owner-dashboard/profile" onClick={() => setUserMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: RADIUS, fontSize: 13.5, fontWeight: 500, color: C.ink, textDecoration: 'none', transition: 'background .15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.white}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <span className="msym" style={{ fontSize: 18, color: C.teal }}>person</span>
                      {t.navProfile}
                    </Link>

                    {/* 2 · แดชบอร์ด */}
                    <Link href={userInfo?.dashUrl ?? '/owner-dashboard'} onClick={() => setUserMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: RADIUS, fontSize: 13.5, fontWeight: 500, color: C.ink, textDecoration: 'none', transition: 'background .15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.white}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <span className="msym" style={{ fontSize: 18, color: C.teal }}>dashboard</span>
                      {t.navDashboard}
                    </Link>

                    {/* Divider */}
                    <div style={{ height: 1, background: '#f1f5f9', margin: '4px 6px' }} />

                    {/* 3 · ออกจากระบบ */}
                    <button onClick={handleSignOut}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: RADIUS, fontSize: 13.5, fontWeight: 500, color: '#b91c1c', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fff5f5'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <span className="msym" style={{ fontSize: 18 }}>logout</span>
                      {t.navSignOut}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setAuthModal(true)} className="sm-hide-mobile"
                style={{ fontSize: 14, fontWeight: 500, color: C.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '9px 4px', border: 'none', background: 'transparent', fontFamily: 'inherit' }}>
                {t.navSignIn}
              </button>
            )
          )}

          {/* Language switch — renders only when this page has a counterpart */}
          <LanguageToggle className="sm-hide-mobile" />

          {/* ลงประกาศ CTA — straight to the listing form */}
          <Link href="/list-your-property/new" onClick={handleListingClick}
            className="sm-navcta"
            style={{ background: C.teal, color: '#fff', fontWeight: 500, fontSize: 14, padding: '9px 16px', borderRadius: 6, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
            {t.navListCta}
          </Link>

          {/* Burger */}
          <button className="sm-burger" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ width: 42, height: 42, borderRadius: 6, border: `1px solid ${C.border}`, display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.ink, background: C.white }}>
            <span className="msym" style={{ fontSize: 24 }}>{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div style={{ borderTop: `1px solid ${C.line}`, background: C.paper, padding: '10px 16px 18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {mobileLinks.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px', borderRadius: 6, fontSize: 15.5, fontWeight: 500, cursor: 'pointer', color: C.ink, textDecoration: 'none', transition: 'all .2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.white}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span className="msym" style={{ fontSize: 21, color: C.teal }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            {/* Language switch — same rule as desktop: only when a counterpart exists */}
            <MobileLanguageToggle onNavigate={() => setMobileOpen(false)} />

            {session ? (
              <>
                <Link href="/owner-dashboard/profile" onClick={() => setMobileOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px', borderRadius: 6, fontSize: 15.5, fontWeight: 500, cursor: 'pointer', color: C.ink, textDecoration: 'none', transition: 'all .2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.white}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <span className="msym" style={{ fontSize: 21, color: C.teal }}>person</span>
                  {t.navProfile}
                </Link>
                <button onClick={() => { setMobileOpen(false); handleSignOut() }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px', borderRadius: 12, fontSize: 15.5, fontWeight: 500, cursor: 'pointer', color: '#b91c1c', background: 'transparent', border: 'none', fontFamily: 'inherit', textAlign: 'left', transition: 'all .2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fff5f5'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <span className="msym" style={{ fontSize: 21, color: '#b91c1c' }}>logout</span>
                  {t.navSignOut}
                </button>
              </>
            ) : (
              <button onClick={() => { setMobileOpen(false); setAuthModal(true) }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px', borderRadius: 12, fontSize: 15.5, fontWeight: 500, cursor: 'pointer', color: '#02402e', background: 'transparent', border: 'none', fontFamily: 'inherit', textAlign: 'left', transition: 'all .2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.white}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span className="msym" style={{ fontSize: 21, color: '#02402e' }}>login</span>
                {t.navSignInUp}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth modal */}
      {authModal && <AuthModal onClose={() => setAuthModal(false)} locale={locale} />}

      <style>{`
        .sm-navlinks { display: flex !important; }
        .sm-hide-mobile { display: flex !important; }
        .sm-burger { display: none !important; }
        .sm-navlink:hover { color: ${C.green} !important; }
        .sm-navcta:hover { background: ${C.green} !important; }
        .sm-owner-pop {
          position: absolute; top: calc(100% + 6px); left: 0; width: 270px;
          background: #fff; border: 1px solid ${C.line}; border-radius: 8px; padding: 6px;
          box-shadow: 0 10px 28px -16px rgba(35,31,32,0.25); display: flex; flex-direction: column; gap: 2px;
          opacity: 0; visibility: hidden; transform: translateY(4px); transition: all .15s ease; z-index: 60;
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
