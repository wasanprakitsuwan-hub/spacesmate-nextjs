/**
 * The 16 hand-written /area pages, folded into the /rent pages that now hold
 * their keywords (approved by the Founder, 24 Oct 2026). Must match
 * FOLDED_AREAS in lib/rent-slugs.ts, which also carries each page's
 * hand-written text across.
 */
const FOLDED_AREA_REDIRECTS = [
  ['condo-rent-bts-asok', '/rent/คอนโด-ใกล้-bts-อโศก'],
  ['apartment-rent-sukhumvit', '/rent/อพาร์ทเม้นท์-ใกล้-mrt-สุขุมวิท'],
  ['condo-rent-bts-ekkamai', '/rent/คอนโด-ใกล้-bts-เอกมัย'],
  ['house-rent-lat-phrao', '/rent/บ้านเช่า-ใกล้-mrt-ลาดพร้าว'],
  ['condo-rent-bts-thonglor', '/rent/คอนโด-ใกล้-bts-ทองหล่อ'],
  ['office-rent-silom', '/rent/ออฟฟิศ-ใกล้-bts-ศาลาแดง'],
  ['condo-rent-bts-on-nut', '/rent/คอนโด-ใกล้-bts-อ่อนนุช'],
  ['apartment-rent-ratchada', '/rent/อพาร์ทเม้นท์-ใกล้-mrt-รัชดาภิเษก'],
  ['house-rent-rama-9', '/rent/บ้านเช่า-ใกล้-mrt-พระราม-9'],
  ['condo-rent-mrt-lat-phrao', '/rent/คอนโด-ใกล้-mrt-ลาดพร้าว'],
  ['coworking-rent-sukhumvit', '/rent/โคเวิร์กกิ้ง-ใกล้-mrt-สุขุมวิท'],
  ['condo-rent-bts-saphan-kwai', '/rent/คอนโด-ใกล้-bts-สะพานควาย'],
  ['condo-rent-bts-ari', '/rent/คอนโด-ใกล้-bts-อารีย์'],
  ['apartment-rent-bang-na', '/rent/อพาร์ทเม้นท์-ใกล้-bts-บางนา'],
  ['condo-rent-mrt-phahon-yothin', '/rent/คอนโด-ใกล้-mrt-พหลโยธิน'],
  ['office-rent-sathorn', '/rent/ออฟฟิศ-ใกล้-bts-ช่องนนทรี'],
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Vercel's free plan includes 5,000 transformations, and every
    // photo × width × format counts as one. WebP only (not AVIF as well)
    // halves that, four widths instead of eight covers phones to desktop,
    // and a 31-day cache stops the same photo being remade.
    formats: ['image/webp'],
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [384],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Compress responses for all pages
  compress: true,

  // ── Legacy slug redirects ──────────────────────────────────────────────────
  // Four of the five slug generators used /[^\w\s-]/ , and \w is [A-Za-z0-9_],
  // so every Thai character was stripped. Thai-titled listings ended up with
  // slugs like "--mr4cgxgy" — no keywords, and unreadable.
  //
  // lib/slug.ts fixed generation; these three rows were rebuilt from their Thai
  // titles, keeping the original id suffix. 308s preserve any existing links and
  // whatever ranking signal the old URLs had accumulated.
  //
  // Safe to delete once Search Console shows no impressions on the old paths.
  async redirects() {
    return [
      // 24 Oct 2026: /submit renamed to /list-your-property, and /pricing merged
      // into it (packages + FAQ; buying happens at /checkout). Permanent, so
      // search engines move the old pages' standing across.
      { source: '/submit', destination: '/list-your-property', permanent: true },
      { source: '/submit/:path*', destination: '/list-your-property/:path*', permanent: true },
      { source: '/en/submit', destination: '/en/list-your-property', permanent: true },
      { source: '/en/submit/:path*', destination: '/en/list-your-property/:path*', permanent: true },
      { source: '/pricing', destination: '/list-your-property#packages', permanent: true },
      { source: '/en/pricing', destination: '/en/list-your-property#packages', permanent: true },
      // Archive URLs left over from the old WordPress site, still in Google's
      // index. Their posts now live under /blog.
      { source: '/category/:path*', destination: '/blog', permanent: true },
      { source: '/tag/:path*', destination: '/blog', permanent: true },
      { source: '/author/:path*', destination: '/blog', permanent: true },
      ...FOLDED_AREA_REDIRECTS.flatMap(([from, to]) => [
        { source: `/area/${from}`, destination: to, permanent: true },
        { source: `/en/area/${from}`, destination: `/en${to}`, permanent: true },
      ]),
      {
        source: '/property/-71-mr4d43l2',
        destination: '/property/เลดแบ็ค-เพลส-ที่พักสุขุมวิท-71-mr4d43l2',
        permanent: true,
      },
      {
        source: '/property/--mr4cgxgy',
        destination: '/property/ให้เช่า-คอนโด-ลุมพินี-เพลส-สวนพลู-สาทร-mr4cgxgy',
        permanent: true,
      },
      {
        source: '/property/-metro-luxe-rama-4-7-318154-bts-2819--mqzfhp7r',
        destination: '/property/เช่าคอนโด-metro-luxe-rama-4-ชั้น-7-ห้องใหม่-mqzfhp7r',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
