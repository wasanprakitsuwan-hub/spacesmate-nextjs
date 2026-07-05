'use client'

// ─────────────────────────────────────────────────────────────────────────────
// /dashboard/pages — Full site page registry
// Static registry of every route in the Next.js app.
// Groups: Main Pages / Listing & Search / Blog / Area SEO / Legal / Auth / Owner
// ─────────────────────────────────────────────────────────────────────────────

const SITE_URL = 'https://spacesmate.com'

type PageStatus = 'live' | 'dynamic' | 'form' | 'redirect'

interface SitePage {
  label:       string        // Thai display name
  label_en:    string        // English label
  url:         string        // canonical path
  icon:        string        // Material Symbol name
  type:        PageStatus
  description: string        // one-liner on purpose
  indexable:   boolean       // should Google index this?
  cta?:        string        // optional: which dashboard page manages content for this
}

interface PageGroup {
  group:    string
  icon:     string
  color:    string
  pages:    SitePage[]
}

const PAGE_REGISTRY: PageGroup[] = [
  {
    group: 'หน้าหลัก',
    icon: 'home',
    color: '#02402e',
    pages: [
      {
        label: 'หน้าแรก',
        label_en: 'Home',
        url: '/',
        icon: 'home',
        type: 'live',
        description: 'Landing page — Featured listings, Why SpacesMate, Management CTA, Blog preview',
        indexable: true,
      },
      {
        label: 'เกี่ยวกับเรา',
        label_en: 'About Us',
        url: '/about',
        icon: 'info',
        type: 'live',
        description: 'Company story, mission, and asset-light model overview',
        indexable: true,
      },
      {
        label: 'บริการของเรา',
        label_en: 'Services',
        url: '/services',
        icon: 'workspaces',
        type: 'live',
        description: 'Apartment 10% / Condo 15% / Listing platform ฿299/mo — 3 service cards',
        indexable: true,
      },
      {
        label: 'แพ็กเกจราคา',
        label_en: 'Pricing',
        url: '/pricing',
        icon: 'sell',
        type: 'live',
        description: 'Listing subscription packages — Starter, Pro, Business',
        indexable: true,
      },
      {
        label: 'ติดต่อเรา',
        label_en: 'Contact',
        url: '/contact',
        icon: 'contact_mail',
        type: 'live',
        description: 'Contact form, social links, LINE',
        indexable: true,
      },
      {
        label: 'คำถามที่พบบ่อย',
        label_en: 'FAQ',
        url: '/faq',
        icon: 'quiz',
        type: 'live',
        description: 'AEO-optimized FAQ — audience tabs: เจ้าของ / ผู้เช่า',
        indexable: true,
      },
    ],
  },
  {
    group: 'ค้นหาและประกาศ',
    icon: 'search',
    color: '#048c73',
    pages: [
      {
        label: 'ค้นหาที่พัก',
        label_en: 'Search Rentals',
        url: '/search',
        icon: 'search',
        type: 'live',
        description: 'Listing search with filters — property type, area, price range, keyword',
        indexable: true,
      },
      {
        label: 'รายละเอียดประกาศ',
        label_en: 'Property Detail',
        url: '/property/[slug]',
        icon: 'apartment',
        type: 'dynamic',
        description: 'Individual listing detail page — images, specs, contact, map',
        indexable: true,
        cta: '/dashboard/listings',
      },
      {
        label: 'ลงประกาศ',
        label_en: 'Submit Listing',
        url: '/submit',
        icon: 'add_circle',
        type: 'live',
        description: 'Package selection landing — links to /submit/new?package=X',
        indexable: true,
      },
      {
        label: 'ฟอร์มลงประกาศ',
        label_en: 'Listing Form',
        url: '/submit/new',
        icon: 'edit_note',
        type: 'form',
        description: 'Multi-step listing form — details, location, images, package checkout',
        indexable: false,
      },
      {
        label: 'ลงประกาศสำเร็จ',
        label_en: 'Submit Success',
        url: '/submit/success',
        icon: 'check_circle',
        type: 'redirect',
        description: 'Confirmation page after Stripe checkout — tracks FB Pixel + GA4 event',
        indexable: false,
      },
    ],
  },
  {
    group: 'ฝากบริหาร',
    icon: 'handshake',
    color: '#d97f11',
    pages: [
      {
        label: 'ฝากบริหารทรัพย์สิน',
        label_en: 'Property Management Inquiry',
        url: '/manage',
        icon: 'handshake',
        type: 'form',
        description: 'Lead capture form for Stream 2 — full property management enquiries',
        indexable: true,
      },
    ],
  },
  {
    group: 'บทความ',
    icon: 'article',
    color: '#048c73',
    pages: [
      {
        label: 'บทความทั้งหมด',
        label_en: 'Blog',
        url: '/blog',
        icon: 'article',
        type: 'live',
        description: 'Blog listing page — all posts with category filter',
        indexable: true,
        cta: '/dashboard/blog',
      },
      {
        label: 'บทความ (ละเอียด)',
        label_en: 'Blog Post',
        url: '/blog/[slug]',
        icon: 'description',
        type: 'dynamic',
        description: 'Individual blog article — SEO meta per post, OG image',
        indexable: true,
        cta: '/dashboard/blog',
      },
    ],
  },
  {
    group: 'SEO พื้นที่ (ภาษาไทย)',
    icon: 'travel_explore',
    color: '#02402e',
    pages: [
      {
        label: 'หน้า SEO ตามทำเล (TH)',
        label_en: 'Area SEO Pages — Thai',
        url: '/area/[slug]',
        icon: 'location_on',
        type: 'dynamic',
        description: '16 Bangkok areas — BTS/MRT station keyword pages with rich bilingual content',
        indexable: true,
        cta: '/dashboard/seo',
      },
      {
        label: 'หน้า SEO ตามทำเล (EN)',
        label_en: 'Area SEO Pages — English',
        url: '/en/area/[slug]',
        icon: 'language',
        type: 'dynamic',
        description: '16 Bangkok areas — English-language routes with hreflang to Thai counterpart',
        indexable: true,
        cta: '/dashboard/seo',
      },
    ],
  },
  {
    group: 'นโยบายและกฎหมาย',
    icon: 'gavel',
    color: '#64748b',
    pages: [
      {
        label: 'นโยบายความเป็นส่วนตัว',
        label_en: 'Privacy Policy',
        url: '/privacy',
        icon: 'policy',
        type: 'live',
        description: 'PDPA-compliant privacy policy for Space Works Co., Ltd.',
        indexable: true,
      },
      {
        label: 'เงื่อนไขการใช้งาน',
        label_en: 'Terms of Service',
        url: '/terms',
        icon: 'gavel',
        type: 'live',
        description: 'Terms and conditions for listing platform usage',
        indexable: true,
      },
    ],
  },
  {
    group: 'เจ้าของ & ระบบ',
    icon: 'manage_accounts',
    color: '#94a3b8',
    pages: [
      {
        label: 'เข้าสู่ระบบ',
        label_en: 'Login / Register',
        url: '/login',
        icon: 'login',
        type: 'form',
        description: 'Auth modal with login + signup tabs — Supabase Auth',
        indexable: false,
      },
      {
        label: 'แดชบอร์ดเจ้าของ',
        label_en: 'Owner Dashboard',
        url: '/owner-dashboard',
        icon: 'dashboard',
        type: 'live',
        description: 'Landlord view — manage own listings, package status, create/edit',
        indexable: false,
      },
      {
        label: 'โปรไฟล์เจ้าของ',
        label_en: 'Owner Profile',
        url: '/owner-dashboard/profile',
        icon: 'person',
        type: 'form',
        description: 'Edit profile — full name, phone, LINE ID, profile photo',
        indexable: false,
      },
    ],
  },
]

// ─── helpers ──────────────────────────────────────────────────────────────────

const TYPE_META: Record<PageStatus, { label: string; color: string; bg: string }> = {
  live:     { label: 'Static',  color: '#02402e', bg: '#edf5f0' },
  dynamic:  { label: 'Dynamic', color: '#0369a1', bg: '#e0f2fe' },
  form:     { label: 'Form',    color: '#92400e', bg: '#fef3c7' },
  redirect: { label: 'Event',   color: '#6d28d9', bg: '#ede9fe' },
}

const INDEXABLE_META = {
  yes: { label: 'Indexed',    color: '#02402e', bg: '#edf5f0' },
  no:  { label: 'No-index',   color: '#94a3b8', bg: '#f1f5f9' },
}

// ─── component ────────────────────────────────────────────────────────────────

export default function PagesPage() {
  const allPages   = PAGE_REGISTRY.flatMap(g => g.pages)
  const liveCount  = allPages.filter(p => p.type === 'live' || p.type === 'dynamic').length
  const indexCount = allPages.filter(p => p.indexable).length
  const dynCount   = allPages.filter(p => p.type === 'dynamic').length

  return (
    <div style={{ fontFamily: "'Prompt', -apple-system, sans-serif", maxWidth: 1120 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#231f20', margin: '0 0 4px' }}>Site Pages</h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          ทุก route ของ spacesmate.com — {allPages.length} หน้า
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'หน้าทั้งหมด', value: allPages.length,  icon: 'web',            color: '#02402e' },
          { label: 'Static / Dynamic', value: liveCount,   icon: 'check_circle',   color: '#048c73' },
          { label: 'Google Indexed',   value: indexCount,  icon: 'travel_explore', color: '#0369a1' },
          { label: 'Dynamic Routes',   value: dynCount,    icon: 'route',          color: '#d97f11' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff', border: '1px solid #eef0ef', borderRadius: 14,
            padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{
              width: 42, height: 42, borderRadius: 11, background: s.color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span className="msym" style={{ fontSize: 22, color: s.color, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{s.icon}</span>
            </span>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#231f20', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Groups */}
      {PAGE_REGISTRY.map(group => (
        <div key={group.group} style={{ marginBottom: 28 }}>

          {/* Group header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8, background: group.color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="msym" style={{ fontSize: 16, color: group.color, fontVariationSettings: "'wght' 400, 'FILL' 0" }}>{group.icon}</span>
            </span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#231f20' }}>{group.group}</span>
            <span style={{
              marginLeft: 2, background: '#f1f5f9', color: '#64748b',
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            }}>{group.pages.length} pages</span>
          </div>

          {/* Table card */}
          <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#fafbfa' }}>
                  {['หน้า', 'URL', 'ประเภท', 'Index', 'จัดการ / เปิด'].map((h, i) => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      color: '#94a3b8', fontWeight: 600, fontSize: 11,
                      letterSpacing: 0.5, borderBottom: '1px solid #eef0ef',
                      whiteSpace: 'nowrap',
                      width: i === 1 ? 220 : i === 4 ? 160 : undefined,
                    }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.pages.map((page, idx) => {
                  const typeMeta  = TYPE_META[page.type]
                  const idxMeta   = page.indexable ? INDEXABLE_META.yes : INDEXABLE_META.no
                  const isLast    = idx === group.pages.length - 1

                  return (
                    <tr key={page.url} style={{ borderBottom: isLast ? 'none' : '1px solid #f4f6f5' }}>

                      {/* Page name */}
                      <td style={{ padding: '13px 16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span className="msym" style={{
                            fontSize: 18, color: group.color, marginTop: 1, flexShrink: 0,
                            fontVariationSettings: "'wght' 300, 'FILL' 0",
                          }}>{page.icon}</span>
                          <div>
                            <div style={{ fontWeight: 600, color: '#231f20', marginBottom: 2 }}>{page.label}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{page.label_en}</div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, lineHeight: 1.5 }}>{page.description}</div>
                          </div>
                        </div>
                      </td>

                      {/* URL */}
                      <td style={{ padding: '13px 16px', verticalAlign: 'top' }}>
                        <code style={{
                          fontSize: 12, background: '#f8fafc', border: '1px solid #e2e8f0',
                          borderRadius: 6, padding: '3px 8px', color: '#334155',
                          display: 'inline-block', wordBreak: 'break-all',
                        }}>{page.url}</code>
                      </td>

                      {/* Type badge */}
                      <td style={{ padding: '13px 16px', verticalAlign: 'top' }}>
                        <span style={{
                          background: typeMeta.bg, color: typeMeta.color,
                          fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                          display: 'inline-block',
                        }}>{typeMeta.label}</span>
                      </td>

                      {/* Indexable */}
                      <td style={{ padding: '13px 16px', verticalAlign: 'top' }}>
                        <span style={{
                          background: idxMeta.bg, color: idxMeta.color,
                          fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                          display: 'inline-block',
                        }}>{idxMeta.label}</span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '13px 16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {/* Visit — skip pure dynamic with no real URL */}
                          {!page.url.includes('[') && (
                            <a
                              href={`${SITE_URL}${page.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '5px 11px', borderRadius: 8,
                                border: '1px solid #e2e8f0', background: '#fafbfa',
                                color: '#334155', fontSize: 12, fontWeight: 500,
                                textDecoration: 'none', cursor: 'pointer',
                              }}
                            >
                              <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>open_in_new</span>
                              Visit
                            </a>
                          )}
                          {/* Manage */}
                          {page.cta && (
                            <a
                              href={page.cta}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '5px 11px', borderRadius: 8,
                                border: '1px solid #02402e22', background: '#edf5f0',
                                color: '#02402e', fontSize: 12, fontWeight: 500,
                                textDecoration: 'none', cursor: 'pointer',
                              }}
                            >
                              <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>edit</span>
                              Manage
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Footer note */}
      <div style={{
        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10,
        color: '#64748b', fontSize: 12,
      }}>
        <span className="msym" style={{ fontSize: 18, color: '#94a3b8', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>info</span>
        <span>
          หน้าเพจทั้งหมดอยู่ใน <code style={{ background: '#e2e8f0', borderRadius: 4, padding: '1px 6px' }}>app/</code> ของ Next.js codebase —
          เพิ่ม/ลบหน้าต้องแก้ที่ codebase และอัปเดต registry นี้ใน <code style={{ background: '#e2e8f0', borderRadius: 4, padding: '1px 6px' }}>app/dashboard/pages/page.tsx</code>
        </span>
      </div>
    </div>
  )
}
