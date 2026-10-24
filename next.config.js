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
