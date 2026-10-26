'use client'

// Shared pieces of the admin users list and the per-user page.
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

export interface UserListings {
  total: number; active: number; pending: number; expired: number
}

export interface UserRow {
  id:                  string
  email:               string
  first_name:          string | null
  last_name:           string | null
  full_name:           string | null
  phone:               string | null
  role:                string
  status:              string
  package:             string | null
  package_type:        string | null
  package_expires_at:  string | null
  created_at:          string
  updated_at:          string | null
  listings:            UserListings
}

export interface DetailListing {
  id:               string
  title_th:         string | null
  title_en:         string | null
  slug:             string | null
  property_type:    string | null
  listing_status:   string | null
  package_type:     string | null
  created_at:       string
  expires_at:       string | null
  address_district: string | null
}

export interface UserDetail {
  profile: UserRow & { display_name: string; active_package: string | null; package_expires_at: string | null }
  listings: DetailListing[]
}

export type CallerRole = 'admin' | 'super_admin'

export const ROLE_STYLE: Record<string, { bg: string; color: string; label: string; icon: string }> = {
  super_admin: { bg: '#fdf3e3', color: '#d97f11', label: 'Super Admin', icon: 'grade' },
  admin:       { bg: '#fff1e6', color: '#c2560c', label: 'Admin',       icon: 'key' },
  landlord:    { bg: '#eaf6f1', color: '#048c73', label: 'เจ้าของ',     icon: 'home' },
}

export const PACKAGE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  free:     { bg: '#f1f5f9', color: '#64748b', label: 'Free' },
  basic:    { bg: '#e0f2fe', color: '#0284c7', label: 'Basic' },
  pro:      { bg: '#ede9fe', color: '#7c3aed', label: 'Pro' },
  premium:  { bg: '#fdf3e3', color: '#d97f11', label: 'Premium' },
}

export const LISTING_STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active:   { bg: '#dcfce7', color: '#15803d', label: 'เผยแพร่' },
  pending:  { bg: '#fef9c3', color: '#a16207', label: 'รออนุมัติ' },
  expired:  { bg: '#fee2e2', color: '#dc2626', label: 'หมดอายุ' },
  inactive: { bg: '#f1f5f9', color: '#64748b', label: 'ปิดใช้งาน' },
}

export function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'วันนี้'
  if (days === 1) return 'เมื่อวาน'
  if (days < 30) return `${days} วันที่แล้ว`
  return `${Math.floor(days / 30)} เดือนที่แล้ว`
}

export async function getToken() {
  const { data: { session } } = await createBrowserClient().auth.getSession()
  return session?.access_token ?? ''
}

// ── Suspend Confirm Modal ─────────────────────────────────────────────────────
export function SuspendModal({ user, onClose, onDone }: { user: UserRow; onClose: () => void; onDone: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const isSuspending = user.status !== 'suspended'
  const displayName  = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.full_name || user.email

  async function confirm() {
    setLoading(true); setError('')
    try {
      const token = await getToken()
      const r = await fetch('/api/dashboard/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: user.id, status: isSuspending ? 'suspended' : 'active' }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Failed')
      onDone(); onClose()
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(2,64,46,0.3)', zIndex: 200, backdropFilter: 'blur(3px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 400, background: '#fff', borderRadius: 20, zIndex: 201,
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)', fontFamily: "'Prompt', -apple-system, sans-serif", overflow: 'hidden',
      }}>
        <div style={{
          background: isSuspending ? '#fff7ed' : '#f0fdf4',
          borderBottom: `1px solid ${isSuspending ? '#fed7aa' : '#bbf7d0'}`,
          padding: '20px 24px', display: 'flex', gap: 14, alignItems: 'flex-start',
        }}>
          <span className="msym" style={{ fontSize: 28, color: isSuspending ? '#c2560c' : '#15803d', flexShrink: 0, fontVariationSettings: "'wght' 400, 'FILL' 1", marginTop: 2 }}>
            {isSuspending ? 'block' : 'check_circle'}
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: isSuspending ? '#92400e' : '#14532d' }}>
              {isSuspending ? 'ระงับบัญชีผู้ใช้' : 'เปิดใช้งานบัญชี'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: isSuspending ? '#b45309' : '#166534' }}>
              {isSuspending ? 'ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้' : 'ผู้ใช้จะสามารถเข้าสู่ระบบได้ตามปกติ'}
            </p>
          </div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f8faf9', borderRadius: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: ROLE_STYLE[user.role]?.bg ?? '#eaf6f1', color: ROLE_STYLE[user.role]?.color ?? '#048c73', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
              {(user.first_name || user.email || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#02402e' }}>{displayName}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{user.email}</div>
            </div>
          </div>
          {error && <div style={{ padding: '10px 13px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>{error}</div>}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f4', display: 'flex', gap: 10 }}>
          <button onClick={onClose} disabled={loading} style={{ flex: 1, padding: '11px', borderRadius: 11, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
          <button onClick={confirm} disabled={loading} style={{
            flex: 2, padding: '11px', borderRadius: 11, border: 'none',
            background: loading ? '#94a3b8' : isSuspending ? '#c2560c' : '#15803d', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {loading ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />กำลังดำเนินการ...</>
              : <>{isSuspending ? 'ระงับบัญชี' : 'เปิดใช้งาน'}</>}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
export function DeleteConfirmModal({ user, onClose, onDeleted }: { user: UserRow; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false)
  const [error,    setError]    = useState('')
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.full_name || user.email

  async function confirm() {
    setDeleting(true); setError('')
    try {
      const token = await getToken()
      const r = await fetch(`/api/dashboard/users?id=${user.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Delete failed')
      onDeleted(); onClose()
    } catch (e: any) { setError(e.message); setDeleting(false) }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(2,64,46,0.3)', zIndex: 200, backdropFilter: 'blur(3px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 420, background: '#fff', borderRadius: 20, zIndex: 201,
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)', fontFamily: "'Prompt', -apple-system, sans-serif", overflow: 'hidden',
      }}>
        <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', padding: '20px 24px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span className="msym" style={{ fontSize: 28, color: '#dc2626', flexShrink: 0, fontVariationSettings: "'wght' 400, 'FILL' 1", marginTop: 2 }}>delete_forever</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#991b1b' }}>ลบผู้ใช้งาน</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#b91c1c' }}>การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
          </div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f8faf9', borderRadius: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: ROLE_STYLE[user.role]?.bg ?? '#eaf6f1', color: ROLE_STYLE[user.role]?.color ?? '#048c73', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
              {(user.first_name || user.email || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#02402e' }}>{displayName}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{user.email}</div>
            </div>
          </div>
          <div style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 8px' }}>การลบจะดำเนินการดังนี้:</p>
            <ul style={{ margin: 0, paddingLeft: '1.4em' }}>
              <li>ลบบัญชีออกจากระบบทั้งหมด (ถาวร)</li>
              <li>ประกาศทั้งหมด <strong style={{ color: '#c2410c' }}>{user.listings.total} รายการ</strong> จะถูกซ่อนโดยอัตโนมัติ</li>
              <li>ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้อีก</li>
            </ul>
          </div>
          {error && <div style={{ marginTop: 14, padding: '10px 13px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>{error}</div>}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f4', display: 'flex', gap: 10 }}>
          <button onClick={onClose} disabled={deleting} style={{ flex: 1, padding: '11px', borderRadius: 11, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
          <button onClick={confirm} disabled={deleting} style={{
            flex: 2, padding: '11px', borderRadius: 11, border: 'none',
            background: deleting ? '#94a3b8' : '#dc2626', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {deleting ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />กำลังลบ...</>
              : <>ยืนยันการลบ</>}
          </button>
        </div>
      </div>
    </>
  )
}

