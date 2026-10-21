'use client'

// ── Revenue & Stats Page ──────────────────────────────────────────────────────
// Payment processing and promo codes are managed via Stripe (dashboard.stripe.com).
// Package sales flow through the Stripe payment link / checkout — not WordPress.
// Live payment revenue will be available once the Stripe API is wired to this dashboard.
// What we CAN show now: active subscriber count pulled from Supabase user_profiles.

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

export default function RevenuePage() {
  const [activeSubscribers, setActiveSubscribers] = useState<number | null>(null)
  const [totalUsers, setTotalUsers]               = useState<number | null>(null)

  // Pull subscriber stats directly from Supabase via the users API we already have
  useEffect(() => {
    createBrowserClient().auth.getSession().then(({ data: { session } }) => {
    fetch('/api/dashboard/users', {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })
      .then(r => r.json())
      .then((d: { users?: Array<{ active_package?: string | null; package_expires_at?: string | null }> }) => {
        const users = d.users ?? []
        setTotalUsers(users.length)
        const now = new Date()
        const active = users.filter(u =>
          u.active_package !== null &&
          u.active_package !== undefined &&
          (u.package_expires_at === null || u.package_expires_at === undefined || new Date(u.package_expires_at) > now)
        ).length
        setActiveSubscribers(active)
      })
      .catch(() => {})
    })
  }, [])

  const fmt = (n: number | null) => n === null ? '—' : n.toLocaleString()

  const KPI = [
    {
      label:  'รายได้เดือนนี้',
      value:  '—',
      sub:    'เชื่อมต่อ Stripe API เพื่อดูข้อมูล',
      icon:   'payments',
      bg:     '#e8f5f0',
      color:  '#048c73',
    },
    {
      label:  'สมาชิกที่ใช้งาน',
      value:  fmt(activeSubscribers),
      sub:    activeSubscribers !== null ? `จาก ${fmt(totalUsers)} ผู้ใช้ทั้งหมด` : 'กำลังโหลด...',
      icon:   'verified_user',
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
      desc:    'ดูรายได้ ธุรกรรม ยอดชำระ และรายงานทางการเงิน',
      icon:    'credit_card',
      href:    'https://dashboard.stripe.com',
      color:   '#635bff',
      bg:      '#f5f4ff',
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
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>ภาพรวมรายได้และการชำระเงิน — ข้อมูลสดจาก Supabase และ Stripe</p>
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
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#02402e', marginBottom: 4 }}>รายได้จริงอยู่ใน Stripe</div>
          <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
            ระบบชำระเงินดำเนินการผ่าน <strong>Stripe</strong> — ยอดรายได้จริง (฿), MRR, และ Churn Rate
            จะแสดงในหน้านี้โดยอัตโนมัติเมื่อเชื่อมต่อ Stripe API ในอนาคต
            ปัจจุบัน <strong>จำนวนสมาชิก</strong> ดึงมาจาก Supabase ได้เลย — ส่วนยอดเงินกรุณาดูจาก Stripe โดยตรง
          </div>
        </div>
      </div>

      {/* Quick links to external platforms */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>จัดการผ่าน Stripe โดยตรง</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          {LINKS.map(l => (
            <a key={l.title} href={l.href} target="_blank" rel="noopener noreferrer"
              style={{
                background: '#fff', border: '1px solid #eef0ef', borderRadius: 16,
                padding: '22px 22px', textDecoration: 'none', display: 'block',
                boxShadow: '0 2px 12px -6px rgba(2,64,46,0.06)',
                transition: 'all .18s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px -8px rgba(2,64,46,0.14)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px -6px rgba(2,64,46,0.06)'; (e.currentTarget as HTMLElement).style.transform = '' }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 13, background: l.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <span className="msym" style={{ fontSize: 24, color: l.color, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{l.icon}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#02402e', marginBottom: 6 }}>{l.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 14 }}>{l.desc}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: l.color, fontWeight: 600 }}>
                เปิดใน Stripe
                <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 400, 'FILL' 0" }}>open_in_new</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Promo code note */}
      <div style={{
        padding: '14px 18px',
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
