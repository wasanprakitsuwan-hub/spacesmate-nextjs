'use client'

// ── Revenue & Stats Page ──────────────────────────────────────────────────────
// Package pricing is managed in WooCommerce (spacesmate.com/wp-admin).
// Payment processing and promo codes are managed in Stripe (dashboard.stripe.com).
// This page shows revenue KPIs only.

export default function RevenuePage() {
  const KPI = [
    {
      label:  'รายได้เดือนนี้',
      value:  '—',
      sub:    'เชื่อมต่อ Stripe เพื่อดูข้อมูล',
      icon:   'payments',
      bg:     '#e8f5f0',
      color:  '#048c73',
    },
    {
      label:  'สมาชิกที่ใช้งาน',
      value:  '—',
      sub:    'จากฐานข้อมูล Supabase',
      icon:   'group',
      bg:     '#eef2ff',
      color:  '#4f46e5',
    },
    {
      label:  'MRR',
      value:  '—',
      sub:    'Monthly Recurring Revenue',
      icon:   'trending_up',
      bg:     '#fff6e9',
      color:  '#d97f11',
    },
    {
      label:  'Churn Rate',
      value:  '—',
      sub:    'อัตรายกเลิก / เดือน',
      icon:   'trending_down',
      bg:     '#fef2f2',
      color:  '#b91c1c',
    },
  ]

  const LINKS = [
    {
      title:   'Stripe Dashboard',
      desc:    'ดูรายได้ ธุรกรรม และจัดการ Promo Code / Coupon',
      icon:    'credit_card',
      href:    'https://dashboard.stripe.com',
      color:   '#635bff',
      bg:      '#f5f4ff',
    },
    {
      title:   'WooCommerce',
      desc:    'จัดการแพ็กเกจ ราคา และ Orders บน WordPress',
      icon:    'shopping_bag',
      href:    'https://spacesmate.com/wp-admin/edit.php?post_type=product',
      color:   '#7f54b3',
      bg:      '#f5f0fb',
    },
    {
      title:   'Promo Codes',
      desc:    'สร้าง / แก้ไข Promotion Codes ใน Stripe',
      icon:    'local_offer',
      href:    'https://dashboard.stripe.com/coupons',
      color:   '#d97f11',
      bg:      '#fff7ed',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: '#02402e', letterSpacing: '-0.3px' }}>รายได้</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>ภาพรวมรายได้และการชำระเงิน — ข้อมูลสดจาก Stripe และ WooCommerce</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {KPI.map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '20px 20px 18px', boxShadow: '0 2px 12px -6px rgba(2,64,46,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>{k.label}</span>
              <span style={{
                width: 36, height: 36, borderRadius: 10, background: k.bg,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span className="msym" style={{ fontSize: 20, color: k.color, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{k.icon}</span>
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#02402e', lineHeight: 1, marginBottom: 6 }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Notice banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f0f7f4 0%, #e8f5f0 100%)',
        border: '1px solid #c8e6da', borderRadius: 16,
        padding: '18px 22px', marginBottom: 28,
        display: 'flex', alignItems: 'flex-start', gap: 14,
      }}>
        <span className="msym" style={{ fontSize: 22, color: '#048c73', marginTop: 1, flexShrink: 0, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>info</span>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#02402e', marginBottom: 4 }}>รายได้จริงอยู่ใน Stripe และ WooCommerce</div>
          <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
            ระบบชำระเงินดำเนินการผ่าน <strong>Stripe</strong> (Payment Gateway) และ <strong>WooCommerce</strong> (แพ็กเกจ)
            การเชื่อมต่อ Stripe API กับ Dashboard นี้จะเพิ่มในอนาคต
            ปัจจุบันกรุณาดูรายงานโดยตรงจากลิงก์ด้านล่าง
          </div>
        </div>
      </div>

      {/* Quick links to external platforms */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>จัดการผ่านแพลตฟอร์มภายนอก</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {LINKS.map(l => (
            <a key={l.title} href={l.href} target="_blank" rel="noopener noreferrer"
              style={{
                background: '#fff', border: '1px solid #eef0ef', borderRadius: 16,
                padding: '20px 20px', textDecoration: 'none', display: 'block',
                boxShadow: '0 2px 12px -6px rgba(2,64,46,0.06)',
                transition: 'all .18s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px -8px rgba(2,64,46,0.14)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px -6px rgba(2,64,46,0.06)'; (e.currentTarget as HTMLElement).style.transform = '' }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: l.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <span className="msym" style={{ fontSize: 22, color: l.color, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{l.icon}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#02402e', marginBottom: 5 }}>{l.title}</div>
              <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.5 }}>{l.desc}</div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: l.color, fontWeight: 600 }}>
                เปิดลิงก์
                <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 0" }}>open_in_new</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Promo code note */}
      <div style={{
        marginTop: 20, padding: '14px 18px',
        background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span className="msym" style={{ fontSize: 18, color: '#d97f11', flexShrink: 0, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>local_offer</span>
        <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.55 }}>
          <strong>Promo Code / Coupon:</strong> สร้างและจัดการ Promo Code ได้ที่{' '}
          <a href="https://dashboard.stripe.com/coupons" target="_blank" rel="noopener noreferrer"
            style={{ color: '#d97f11', fontWeight: 700, textDecoration: 'underline' }}>
            Stripe › Products › Coupons
          </a>
          {' '}— ไม่สามารถจัดการได้จาก Dashboard นี้โดยตรง
        </div>
      </div>
    </div>
  )
}
