/**
 * The 404 body, shared by every place that can produce one.
 *
 * WHY IT IS A COMPONENT AND NOT A PAGE
 *   The first attempt was a single app/not-found.tsx rendering its own <html>,
 *   on the reasoning that a URL matching no route belongs to neither locale
 *   group and so has no root layout to borrow. Next.js 14 rejects that at
 *   build time:
 *
 *     × not-found.tsx doesn't have a root layout.
 *
 *   A root-level not-found is still treated as a page, and every page needs a
 *   root layout. So the 404 lives inside the groups, where there is one, and
 *   this holds the markup so the copies cannot drift.
 *
 * THE THREE PLACES IT IS USED
 *   app/(th)/not-found.tsx        notFound() thrown by a Thai route
 *   app/(en)/not-found.tsx        notFound() thrown by an English route
 *   app/(th)/not-found/page.tsx   the real /not-found URL, which middleware.ts
 *                                 rewrites unpublished paths to with status 404
 *
 *   The third is easy to miss and is not about typos: every unpublished page
 *   on the site serves it.
 *
 * WHY IT IS BILINGUAL
 *   A 404 often carries no reliable locale — an unmatched URL has none at all.
 *   Guessing would be wrong half the time, so it offers both doors.
 */
import Link from 'next/link'

const link: React.CSSProperties = {
  display: 'inline-block',
  padding: '12px 26px',
  borderRadius: 24,
  fontSize: 14.5,
  fontWeight: 600,
  textDecoration: 'none',
}

export default function NotFoundBody() {
  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '72px 24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg,#02402e,#048c73)',
        color: '#fff',
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
  )
}
