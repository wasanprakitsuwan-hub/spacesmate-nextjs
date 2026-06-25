'use client'

import { useState } from 'react'

const ROLES = [
  { name: 'Super Admin', email: 'wasan.prakitsuwan@gmail.com', role: 'super_admin', label: 'Super Admin', color: '#d97f11' },
  { name: 'SpacesMate Admin', email: 'wasan.p@spacesmate.com', role: 'admin', label: 'Admin', color: '#048c73' },
]

const AREAS = [
  'สุขุมวิท', 'สีลม', 'อ่อนนุช', 'บางนา', 'ลาดพร้าว',
  'จตุจักร', 'ราษฎร์บูรณะ', 'ปิ่นเกล้า', 'พระราม 9', 'รัชดา',
]

const SEO_KEYWORDS = [
  'คอนโดให้เช่ากรุงเทพ', 'อพาร์ทเม้นท์ให้เช่า', 'ห้องพักให้เช่า',
  'property management bangkok', 'condo for rent bangkok',
  'apartment for rent sukhumvit', 'proptech thailand',
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'keywords' | 'config'>('roles')
  const [siteName, setSiteName] = useState('SpacesMate')
  const [siteEmail, setSiteEmail] = useState('hello@spacesmate.com')
  const [lineOA, setLineOA] = useState('@spacesmate')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const TABS = [
    { k: 'roles', l: 'บทบาทและสิทธิ์' },
    { k: 'keywords', l: 'คีย์เวิร์ด SEO' },
    { k: 'config', l: 'ตั้งค่าทั่วไป' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 3px', color: '#02402e' }}>ตั้งค่า</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>กำหนดค่าระบบ บทบาท และ SEO</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid #eef0ef', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.k} onClick={() => setActiveTab(t.k as any)} style={{
            padding: '9px 18px', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
            background: activeTab === t.k ? '#fff' : 'transparent',
            color: activeTab === t.k ? '#02402e' : '#94a3b8',
            borderBottom: activeTab === t.k ? '2px solid #02402e' : '2px solid transparent',
            marginBottom: -1,
          }}>{t.l}</button>
        ))}
      </div>

      {/* ROLES tab */}
      {activeTab === 'roles' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>ผู้ดูแลระบบและสิทธิ์การเข้าถึง Dashboard</p>
          </div>

          <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, overflow: 'hidden', marginBottom: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eef0ef' }}>
                  {['ชื่อ', 'อีเมล', 'บทบาท', ''].map(h => (
                    <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLES.map((r, i) => (
                  <tr key={r.email} style={{ borderBottom: i < ROLES.length - 1 ? '1px solid #f1f5f4' : 'none' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#e8f5f0', color: '#048c73', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                          {r.name.charAt(0)}
                        </span>
                        <span style={{ fontWeight: 600, color: '#02402e' }}>{r.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>{r.email}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 11px', borderRadius: 20, background: r.color + '20', color: r.color }}>{r.label}</span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {r.role !== 'super_admin' && (
                        <button style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #eef0ef', background: '#fff', color: '#64748b', fontSize: 12, cursor: 'pointer' }}>แก้ไข</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Permissions legend */}
          <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: '#02402e' }}>สิทธิ์การเข้าถึง</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
              {[
                { action: 'ดูภาพรวม Dashboard', super: true, admin: true },
                { action: 'อนุมัติ / ปฏิเสธประกาศ', super: true, admin: true },
                { action: 'จัดการผู้ใช้งาน', super: true, admin: false },
                { action: 'แก้ไขแพ็กเกจและราคา', super: true, admin: false },
                { action: 'เผยแพร่บทความ', super: true, admin: true },
                { action: 'ตั้งค่าระบบ', super: true, admin: false },
              ].map(p => (
                <div key={p.action} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', background: '#f8fafc', borderRadius: 10 }}>
                  <span style={{ color: '#334155' }}>{p.action}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span title="Super Admin" style={{ color: p.super ? '#22c55e' : '#e2e8f0' }}>●</span>
                    <span title="Admin" style={{ color: p.admin ? '#22c55e' : '#e2e8f0' }}>●</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8' }}>
              ● Super Admin &nbsp;&nbsp; ● Admin
            </div>
          </div>
        </div>
      )}

      {/* KEYWORDS tab */}
      {activeTab === 'keywords' && (
        <div>
          <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22, marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px', color: '#02402e' }}>ทำเลหลักที่ครอบคลุม</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>พื้นที่กรุงเทพฯ ที่ SpacesMate ให้บริการและมีหน้า SEO Landing Page</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {AREAS.map(a => (
                <span key={a} style={{ padding: '7px 16px', borderRadius: 20, background: '#e8f5f0', color: '#048c73', fontSize: 13.5, fontWeight: 500 }}>
                  📍 {a}
                </span>
              ))}
              <button style={{ padding: '7px 16px', borderRadius: 20, border: '2px dashed #eef0ef', background: 'transparent', color: '#94a3b8', fontSize: 13.5, cursor: 'pointer' }}>
                + เพิ่มทำเล
              </button>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 22 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px', color: '#02402e' }}>คีย์เวิร์ด SEO หลัก</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>คีย์เวิร์ดที่ APEX ใช้สร้าง SEO Landing Pages และ PRISM ใช้วางแผน Content</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {SEO_KEYWORDS.map(k => (
                <span key={k} style={{ padding: '7px 16px', borderRadius: 20, background: '#fff6e9', color: '#d97f11', fontSize: 13, fontWeight: 500 }}>
                  🔍 {k}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONFIG tab */}
      {activeTab === 'config' && (
        <div style={{ background: '#fff', border: '1px solid #eef0ef', borderRadius: 18, padding: 26 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 20px', color: '#02402e' }}>ตั้งค่าทั่วไปของระบบ</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 500 }}>
            {[
              { label: 'ชื่อเว็บไซต์', value: siteName, set: setSiteName, placeholder: 'SpacesMate' },
              { label: 'อีเมลติดต่อ', value: siteEmail, set: setSiteEmail, placeholder: 'hello@spacesmate.com' },
              { label: 'LINE Official Account', value: lineOA, set: setLineOA, placeholder: '@spacesmate' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>{f.label}</label>
                <input
                  value={f.value} onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 11, border: '1px solid #eef0ef', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #eef0ef' }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#02402e', margin: '0 0 14px' }}>สถานะระบบ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}>
              {[
                { label: 'Supabase Database', status: 'เชื่อมต่อแล้ว', ok: true },
                { label: 'Vercel Deployment', status: 'Active', ok: true },
                { label: 'Stripe Payments', status: 'ยังไม่ตั้งค่า', ok: false },
                { label: 'LINE OA Webhook', status: 'ยังไม่ตั้งค่า', ok: false },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#f8fafc', borderRadius: 10 }}>
                  <span style={{ fontSize: 13.5, color: '#334155' }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: s.ok ? '#dcfce7' : '#fee2e2', color: s.ok ? '#15803d' : '#b91c1c' }}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            style={{ marginTop: 24, padding: '12px 28px', borderRadius: 12, border: 'none', background: saved ? '#22c55e' : '#02402e', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'background .3s' }}
          >
            {saved ? '✓ บันทึกแล้ว' : 'บันทึกการตั้งค่า'}
          </button>
        </div>
      )}
    </div>
  )
}
