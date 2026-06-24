import Link from 'next/link'
import type { Metadata } from 'next'
import { blogPosts, getBlogPostBySlug, fetchPostContent, formatThaiDate } from '@/lib/blog-data'
import { notFound } from 'next/navigation'

interface Props {
  params: { slug: string }
}

// Pre-render all blog posts at build time
export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug)
  if (!post) return { title: 'ไม่พบบทความ | SpacesMate' }
  return {
    title: `${post.title} | SpacesMate`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image, alt: post.imageAlt }],
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = getBlogPostBySlug(params.slug)
  if (!post) notFound()

  // Fetch full HTML content from WP REST API at build time (cached forever)
  const content = await fetchPostContent(post.id)

  // Related posts — same category, exclude current
  const related = blogPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3)

  return (
    <div className="bg-white min-h-screen">

      {/* Hero image */}
      <div className="w-full h-64 md:h-96 overflow-hidden bg-spacemate-bgLight relative">
        <img
          src={post.image}
          alt={post.imageAlt}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(2,64,46,0.25))' }} />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/blog" className="hover:text-spacemate-brandDark transition-colors">บทความ</Link>
          <span>/</span>
          <span className="text-spacemate-brandDark font-medium line-clamp-1">{post.title}</span>
        </div>

        {/* Category badge */}
        <span className="inline-block text-xs font-semibold text-spacemate-brandTeal bg-spacemate-bgLight px-3 py-1.5 rounded-full mb-4">
          {post.category}
        </span>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-spacemate-brandDark mb-5 leading-snug tracking-tight">
          {post.title}
        </h1>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-gray-400 text-sm mb-8 pb-8 border-b border-spacemate-borderLight">
          <span className="msym" style={{ fontSize: 16, color: '#048c73' }}>calendar_today</span>
          <span>{formatThaiDate(post.date)}</span>
          <span>·</span>
          <span>SpacesMate</span>
        </div>

        {/* Full content from WP (HTML rendered) */}
        <div
          className="blog-content text-gray-700 leading-relaxed text-base"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* CTA block */}
        <div
          className="mt-14 p-7 rounded-2xl text-white"
          style={{ background: 'radial-gradient(120% 160% at 85% 10%, #055c43, #02402e 60%)' }}
        >
          <div className="flex items-start gap-4">
            <span className="msym text-4xl text-spacemate-brandTeal flex-shrink-0">handshake</span>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">มีทรัพย์สินอยากปล่อยเช่า?</h3>
              <p className="text-white/70 text-sm mb-4">
                ให้ SpacesMate ดูแลตั้งแต่หาผู้เช่า ทำสัญญา ไปจนถึงเก็บค่าเช่า — ครบวงจรในที่เดียว
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/services"
                  className="inline-block text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-all hover:brightness-110"
                  style={{ background: '#d97f11' }}
                >
                  ดูบริการรับฝากบริหาร
                </Link>
                <Link
                  href="/submit"
                  className="inline-block text-white/80 font-medium text-sm px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10 transition-all"
                >
                  ลงประกาศฟรี
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-lg font-bold text-spacemate-brandDark mb-6">บทความที่เกี่ยวข้อง</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group rounded-xl border border-spacemate-borderLight overflow-hidden hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="h-32 overflow-hidden bg-spacemate-bgLight">
                    <img
                      src={p.image}
                      alt={p.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-spacemate-brandDark leading-snug line-clamp-3 group-hover:text-spacemate-brandTeal transition-colors">
                      {p.title}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">{formatThaiDate(p.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Blog content styles */}
      <style>{`
        .blog-content p { margin-bottom: 1.25rem; }
        .blog-content h2 { font-size: 1.35rem; font-weight: 700; color: #02402e; margin: 2rem 0 0.85rem; }
        .blog-content h3 { font-size: 1.1rem; font-weight: 600; color: #231f20; margin: 1.5rem 0 0.6rem; }
        .blog-content ul, .blog-content ol { padding-left: 1.4rem; margin-bottom: 1.25rem; }
        .blog-content li { margin-bottom: 0.4rem; }
        .blog-content strong, .blog-content b { color: #231f20; font-weight: 600; }
        .blog-content a { color: #048c73; text-decoration: underline; }
        .blog-content img { border-radius: 12px; margin: 1.5rem 0; max-width: 100%; }
        .blog-content blockquote { border-left: 3px solid #048c73; padding-left: 1rem; color: #64748b; font-style: italic; margin: 1.5rem 0; }
        .blog-content hr { border: none; border-top: 1px solid #eef0ef; margin: 2rem 0; }
      `}</style>
    </div>
  )
}
