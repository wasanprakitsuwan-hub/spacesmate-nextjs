'use client'

import { useState } from 'react'

const PACKAGES = [
  {
    name: 'Starter',
    price: 299,
    period: 'เดือน',
    features: ['1 ประกาศ', 'แสดงผลมาตรฐาน', 'รูปภาพสูงสุด 5 รูป', 'อัปเดตข้อมูลได้เสมอ'],
    popular: false,
    color: '#e8f5f0',
    badge: '',
  },
  {
    name: 'Pro',
    price: 599,
    period: 'เดือน',
    features: ['3 ประกาศ', 'แสดงผลพรีเมียม', 'รูปภาพสูงสุด 15 รูป', 'สถิติการดูประกาศ', 'ป้าย "แนะนำ"'],
    popular: true,
    color: '#02402e',
    badge: 'ยอดนิยม',
  },
  {
    name: 'Business',
    price: 1299,
    period: 'เดือน',
    features: ['ประกาศไม่จำกัด', 'แสดงผลสูงสุด', 'รูปภาพไม่จำกัด', 'สถิติเชิงลึก', 'ทีมงานสนับสนุน', 'ป้าย "พาร์ทเนอร์"'],
    popular: false,
    color: '#d97f11',
    badge: 'ธุรกิจ',
  },
]

export default function RevenuePage() {
  const [tab, setTab] = useState<'packages' | 'transactions'>('packages')

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 3px', color: '#02402e' }}>แพ็กเกจ & รายได้</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>จัดการแผนการสมัครสมาชิกและติดตามรายได้</p>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'รายได้เดือนนี้', value: '—', sub: 'ระบบกำลังพัฒนา', icon: '💳', bg: '#e8f5f0', color: '#048c73' },
          { label: 'สมาชิกทั้งหมด', value: '—', sub: 'ยังไม่มีข้อมูล', icon: '👥', bg: '#e0f2f9', color: '#0284c7' },
          { label: 'MRR', value: '—', sub: 'Monthly Recurring', icon: '📈', bg: '#fff6e9', color: '#d97f11' },
          { label: 'Churn Rate', value: '—', sub: 'อัตรายกเลิก', icon: '📉', bg: '#fee2e2', color: '#b91c1c' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{k.label}</span>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{k.icon}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#02402e', lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 6 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[{ k: 'packages', l: 'แพ็กเกจ' }, { k: 'transactions', l: 'ธุรกรรม' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as any)} style={{
            padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            background: tab === t.k ? '#02402e' : '#f4f6f5', color: tab === t.k ? '#fff' : '#334155',
          }}>{t.l}</button>
        ))}
      </div>

      {tab === 'packages' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {PACKAGES.map(pkg => (
            <div key={pkg.name} style={{
              background: pkg.popular ? '#02402e' : '#fff',
              border: `1px solid ${pkg.popular ? '#02402e' : '#eef0ef'}`,
              borderRadius: 20, padding: '28px 24px',
              boxShadow: pkg.popular ? '0 12px 40px -10px rgba(2,64,46,0.3)' : '0 4px 20px -12px rgba(2,64,46,0.06)',
              position: 'relative',
            }}>
              {pkg.badge && (
                <span style={{
                  position: 'absolute', top: 20, right: 20,
                  fontSize: 11, fontWeight: 700, padding: '4px 10px',
                  borderRadius: 20, background: '#d97f11', color: '#fff',
                }}>{pkg.badge}</span>
              )}
              <div style={{ fontSize: 13, fontWeight: 600, color: pkg.popular ? 'rgba(255,255,255,0.6)' : '#94a3b8', marginBottom: 8 }}>{pkg.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: pkg.popular ? '#fff' : '#02402e' }}>฿{pkg.price.toLocaleString()}</span>
                <span style={{ fontSize: 13, color: pkg.popular ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>/{pkg.period}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {pkg.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, color: pkg.popular ? '#d97f11' : '#048c73' }}>✓</span>
                    <span style={{ fontSize: 13.5, color: pkg.popular ? 'rgba(255,255,255,0.85)' : '#334155' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button style={{
                width: '100%', padding: '11px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: pkg.popular ? '#d97f11' : '#02402e', color: '#fff',
                fontSize: 14, fontWeight: 600,
              }}>เลือกแพ็กเกจนี้</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'transactions' && (
        <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>💳</div>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 6 }}>ยังไม่มีธุรกรรม</div>
            <div style={{ fontSize: 13 }}>ระบบชำระเงินกำลังถูกพัฒนา จะเปิดใช้งานเร็วๆ นี้</div>
          </div>
        </div>
      )}
    </div>
  )
}
