'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { DASH_T } from '@/lib/dashboard-i18n'
import { localeHref, enPath, thPath } from '@/lib/routes-i18n'
import { useLocale } from '@/lib/use-locale'
import { C, RADIUS } from '@/lib/ui'

/**
 * Chrome for both /owner-dashboard and /en/owner-dashboard.
 *
 * Takes the locale from the URL rather than a prop, because it is rendered by
 * two sibling layout files and there is nothing above it to pass one down.
 */
export default function DashboardChrome({ children }: { children: React.ReactNode }) {
  const locale = useLocale()
  const pathname = usePathname() ?? '/owner-dashboard'
  const t = DASH_T[locale]
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const supabase = createBrowserClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace(localeHref('/login', locale)); return }
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
        router.replace(localeHref('/login', locale))
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setUserEmail(session.user.email ?? '')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  async function handleLogout() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push(localeHref('/login', locale))
  }

  if (!authReady) {
    return (
      <div style={{ minHeight: '100vh', background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: `3px solid ${C.teal}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const displayName = userEmail.split('@')[0] || 'Owner'
  const listingsHref = localeHref('/owner-dashboard', locale)
  const profileHref = localeHref('/owner-dashboard/profile', locale)
  // Round 7: a side menu with two pages, every control a text button.
  const NAV = [
    { href: listingsHref, label: t.myListings, active: !pathname.includes('/owner-dashboard/profile') },
    { href: profileHref, label: t.profileTitle, active: pathname.includes('/owner-dashboard/profile') },
  ]
  const otherLang = locale === 'en'
    ? { href: thPath(pathname), lang: 'th', label: 'ภาษาไทย' }
    : { href: enPath(pathname) ?? '/en/owner-dashboard', lang: 'en', label: 'English' }
  const smallBtn: React.CSSProperties = {
    display: 'block', textAlign: 'center', padding: '7px 12px', border: `1px solid ${C.border}`, borderRadius: RADIUS,
    background: C.white, color: C.ink, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none',
  }

  return (
    <div className="sm-own" style={{ display: 'flex', minHeight: '100vh', background: C.paper, color: C.ink, fontFamily: "'Prompt', -apple-system, sans-serif" }}>
      {/* Below 860px the rail becomes a bar across the top. */}
      <style>{`
        @media (max-width: 860px) {
          .sm-own { flex-direction: column; }
          .sm-own-side { width: auto !important; height: auto !important; position: static !important; flex-direction: row !important; flex-wrap: wrap; align-items: center; gap: 8px !important; border-right: none !important; border-bottom: 1px solid ${C.line}; padding: 12px 16px !important; }
          .sm-own-side .sm-own-logo { margin: 0 8px 0 0 !important; }
          .sm-own-side .sm-own-foot { margin-top: 0 !important; border-top: none !important; padding: 0 !important; flex-direction: row !important; flex-wrap: wrap; align-items: center; }
          .sm-own-side .sm-own-who { display: none; }
          .sm-own-main { padding: 20px 16px 56px !important; }
        }
      `}</style>
      <aside className="sm-own-side" style={{
        width: 220, flexShrink: 0, background: C.white, borderRight: `1px solid ${C.line}`,
        padding: '22px 14px', display: 'flex', flexDirection: 'column', gap: 2,
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', boxSizing: 'border-box',
      }}>
        <Link href={localeHref('/', locale)} className="sm-own-logo" aria-label="SpacesMate" style={{ margin: '0 8px 22px', display: 'block' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="SpacesMate" style={{ height: 32, width: 'auto', display: 'block' }} />
        </Link>
        <Link href={localeHref('/list-your-property/new', locale)} style={{
          display: 'block', textAlign: 'center', background: C.teal, color: C.white, borderRadius: RADIUS,
          padding: '9px 14px', fontSize: 14, fontWeight: 500, textDecoration: 'none', marginBottom: 14,
        }}>
          {t.newListing}
        </Link>
        {NAV.map(n => (
          <Link key={n.href} href={n.href} aria-current={n.active ? 'page' : undefined} style={{
            display: 'block', padding: '9px 12px', borderRadius: RADIUS, fontSize: 14, textDecoration: 'none',
            background: n.active ? C.tint : 'transparent', color: n.active ? C.green : C.ink, fontWeight: n.active ? 500 : 400,
          }}>
            {n.label}
          </Link>
        ))}
        <div className="sm-own-foot" style={{ marginTop: 'auto', padding: '14px 8px 2px', borderTop: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href={localeHref('/', locale)} style={{ fontSize: 13.5, color: C.muted, textDecoration: 'none' }}>{t.website}</Link>
          {/* The portal's own language switch: same page, other language. */}
          <Link href={otherLang.href} hrefLang={otherLang.lang} style={{ fontSize: 13.5, color: C.muted, textDecoration: 'none' }}>{otherLang.label}</Link>
          <div className="sm-own-who" style={{ lineHeight: 1.35, minWidth: 0 }}>
            <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
            <div style={{ fontSize: 12, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
          </div>
          <button type="button" onClick={handleLogout} style={smallBtn}>{t.signOut}</button>
        </div>
      </aside>

      <main className="sm-own-main" style={{ flex: 1, minWidth: 0, padding: '28px 36px 56px' }}>
        {children}
      </main>
    </div>
  )
}
