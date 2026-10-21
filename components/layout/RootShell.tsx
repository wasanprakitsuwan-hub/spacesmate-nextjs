/**
 * The one root layout body, rendered by both locale root layouts.
 *
 * WHY THERE ARE TWO ROOT LAYOUTS
 *   `<html lang>` can only be set by a root layout, and a Next.js app has one
 *   root layout unless you use multiple route groups at the top level. So with
 *   a single app/layout.tsx, every page on the site shipped `lang="th"` —
 *   including all 19 English routes. A screen reader read the English copy
 *   with a Thai voice, and Chrome offered to translate English *from* Thai.
 *
 *   The alternative was reading the path via `headers()` in the root layout,
 *   which opts every route out of static rendering. 46 routes are prerendered
 *   here, so that was not worth it.
 *
 * WHY THE BODY LIVES HERE AND NOT IN THE LAYOUTS
 *   Two root layouts means two files that must stay identical in everything
 *   except `lang`. This codebase has already paid for that pattern twice — the
 *   Thai and English area pages drifted until a schema fix had to be applied
 *   by hand in both copies, and the same happened to the blog. So the layouts
 *   are three lines each and everything real is here, where there is one copy.
 *
 * KNOWN COST
 *   Navigating between a Thai route and an English one now crosses a root
 *   layout boundary, which Next.js serves as a full page load rather than a
 *   client-side transition. That happens only on the language toggle, which is
 *   a deliberate, infrequent action.
 */
import Script from 'next/script'
import { Prompt } from 'next/font/google'
import ConditionalSiteLayout from '@/components/layout/ConditionalSiteLayout'
import { OrganizationLd, WebSiteLd } from '@/components/seo/JsonLd'
import Analytics from '@/components/consent/Analytics'
import ConsentBanner from '@/components/consent/ConsentBanner'

// ── Prompt font — self-hosted via next/font (eliminates render-blocking external request)
const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['400', '600', '700'],   // 300+500 removed — saves 2 Thai font file downloads on mobile
  display: 'swap',
  variable: '--font-prompt',
  preload: true,
})

export default function RootShell({
  lang,
  children,
}: {
  lang: 'th' | 'en'
  children: React.ReactNode
}) {
  return (
    <html lang={lang} className={prompt.variable}>
      <body className="bg-spacemate-bgLight text-spacemate-textCharcoal font-sans antialiased">
        <OrganizationLd />
        <WebSiteLd />

        <ConditionalSiteLayout>{children}</ConditionalSiteLayout>

        {/* Tracking now lives behind consent.
            The GTM snippet and its <noscript> iframe used to sit here and fired
            on every page load, before the visitor had been asked anything.
            <Analytics /> loads GTM only once consent has been given.

            The <noscript> fallback is deliberately not reinstated: a visitor
            with JavaScript disabled cannot be shown a banner, cannot answer it,
            and cannot have an answer stored, so the only defensible behaviour
            is to track them not at all. */}
        <Analytics />
        <ConsentBanner />

        {/* Material Symbols Rounded — loaded non-blocking after page is interactive.
            The 5.2 MB variable font must NOT block initial render.
            Icons appear shortly after hydration; FCP/LCP are unaffected. */}
        <Script
          id="load-material-symbols"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var l = document.createElement('link');
              l.rel = 'stylesheet';
              l.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap';
              document.head.appendChild(l);
            `,
          }}
        />
      </body>
    </html>
  )
}
