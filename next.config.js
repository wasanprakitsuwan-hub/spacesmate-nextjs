/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],   // serve AVIF → WebP → JPEG fallback
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

  // 301 redirects — old WordPress URLs → Next.js equivalents
  async redirects() {
    return [
      {
        source: '/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3%E0%B8%AD%E0%B8%9E%E0%B8%B2%E0%B8%A3%E0%B9%8C%E0%B8%97%E0%B9%80%E0%B8%A1%E0%B9%89%E0%B8%99%E0%B8%97%E0%B9%8C',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/รับบริหารอพาร์ทเม้นท์',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3%E0%B8%84%E0%B8%AD%E0%B8%99%E0%B9%82%E0%B8%94',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/รับบริหารคอนโด',
        destination: '/services',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
