import type { Metadata } from 'next'
import { Prompt } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import ConditionalSiteLayout from '@/components/layout/ConditionalSiteLayout'

const GTM_ID = 'GTM-PJ6X4NHS'

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
        {/* GTM noscript fallback — immediately after <body> */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <ConditionalSiteLayout>{children}</ConditionalSiteLayout>

        {/* Google Tag Manager */}
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />

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
