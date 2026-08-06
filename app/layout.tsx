import type { Metadata } from 'next'
import { Prompt } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
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

export const metadata: Metadata = {
  title: {
    default: 'SpacesMate — ค้นหาที่พักในกรุงเทพ อพาร์ทเม้นท์ คอนโด บ้านเช่า',
    template: '%s | SpacesMate',
  },
  description: 'SpacesMate — แพลตฟอร์มค้นหาที่พักในกรุงเทพ อพาร์ทเม้นท์ คอนโด บ้านเช่า โคเวิร์กกิ้งสเปซ และออฟฟิศ ประกาศที่ผ่านการยืนยัน ไม่มีค่าใช้จ่ายซ่อน',
  keywords: ['เช่าคอนโด', 'เช่าอพาร์ทเม้นท์', 'บ้านเช่า', 'Bangkok rental', 'SpacesMate', 'ที่พักกรุงเทพ'],
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://spacesmate.com',
    siteName: 'SpacesMate',
    images: [{ url: 'https://spacesmate.com/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={prompt.variable}>
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
