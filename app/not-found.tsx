/**
 * The 404 page, and the one file that has to render its own <html>.
 *
 * WHY IT EXISTS NOW AND DID NOT BEFORE
 *   There was no not-found.tsx: an unmatched URL fell through to Next's
 *   built-in 404, which rendered inside app/layout.tsx. That is why a 404
 *   used to arrive with the nav, the cookie banner and the Thai metadata
 *   attached.
 *
 *   Splitting the root layout into app/(th)/ and app/(en)/ removed the layout
 *   that page was borrowing. A URL that matches no route belongs to neither
 *   group — there is nothing to tell Next which root layout to wrap it in — so
 *   this file supplies its own <html> and <body>.
 *
 *   middleware.ts also depends on this: an unpublished path is rewritten to
 *   /not-found with status 404, so this is not only the fallback for typos,
 *   it is the page every unpublished route serves.
 *
 * WHY IT IS BILINGUAL
 *   An unmatched URL carries no locale. Guessing one would be wrong half the
 *   time, so it offers both doors and says the same thing twice.
 *
 * WHY THE STYLES ARE INLINE
 *   This page must render correctly even when something is badly wrong with
 *   the build. Inline styles have no dependency on the Tailwind pipeline.
 */
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page not found · ไม่พบหน้านี้',
  robots: { index: false, follow: false },
}

const link: React.CSSProperties = {
  display: 'inline-block',
  padding: '12px 26px',
  borderRadius: 24,
  fontSize: 14.5,
  fontWeight: 600,
  textDecoration: 'none',
}

export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '40px 24px',
            textAlign: 'center',
            background: 'linear-gradient(135deg,#02402e,#048c73)',
            color: '#fff',
            fontFamily: "'Prompt', system-ui, -apple-system, sans-serif",
          }}
        >
          <p style={{ fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
            SpacesMate
          </p>
          <h1 style={{ fontSize: 'clamp(30px,6vw,52px)', fontWeight: 700, margin: '6px 0 0', letterSpacing: '-0.5px' }}>
            404
          </h1>
          <p style={{ fontSize: 16, margin: '0 0 2px', color: 'rgba(255,255,255,0.9)' }}>
            We couldn&rsquo;t find that page.
          </p>
          <p style={{ fontSize: 15, margin: 0, color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
            ไม่พบหน้าที่คุณกำลังมองหา
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 24 }}>
            <Link href="/" style={{ ...link, background: '#d97f11', color: '#fff' }}>
              หน้าแรก
            </Link>
            <Link href="/en" style={{ ...link, color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.3)' }}>
              English home
            </Link>
          </div>
        </main>
      </body>
    </html>
  )
}
