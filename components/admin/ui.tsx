'use client'

// Small building blocks for the redesigned admin pages, on the same tokens as
// the public site: paper ground, hairline borders, no shadows.
import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { C, RADIUS } from '@/lib/ui'

export const card: CSSProperties = { background: C.white, border: `1px solid ${C.line}`, borderRadius: RADIUS }

export const input: CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: RADIUS, border: `1px solid ${C.border}`,
  fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', background: C.white, color: C.ink,
}

export const label: CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: C.muted, marginBottom: 6 }

export const th: CSSProperties = {
  padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: C.muted, fontSize: 12.5,
  whiteSpace: 'nowrap', borderBottom: `1px solid ${C.line}`, background: C.paper,
}

export const td: CSSProperties = { padding: '12px 16px', borderBottom: `1px solid ${C.line2}`, fontSize: 13.5, color: C.ink, verticalAlign: 'middle' }

export function PageHead({ title, sub, back, actions }: { title: ReactNode; sub?: ReactNode; back?: { href: string; label: string }; actions?: ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {back && (
        <Link href={back.href} style={{ fontSize: 13, color: C.teal, textDecoration: 'none' }}>← {back.label}</Link>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginTop: back ? 8 : 0 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: C.green, lineHeight: 1.35 }}>{title}</h1>
          {sub && <p style={{ margin: '4px 0 0', fontSize: 14, color: C.muted }}>{sub}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
      </div>
    </div>
  )
}

export function Stat({ value, label: text }: { value: ReactNode; label: string }) {
  return (
    <div style={{ ...card, padding: '16px 18px' }}>
      <div style={{ fontSize: 24, fontWeight: 600, color: C.green, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{text}</div>
    </div>
  )
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'red' }) {
  const t = {
    neutral: { bg: C.paper, color: C.muted, bd: C.line },
    green:   { bg: C.tint, color: C.green, bd: '#cfe5dc' },
    amber:   { bg: C.amberTint, color: C.amber, bd: '#f0dcc0' },
    red:     { bg: '#fdf0ef', color: '#b42318', bd: '#f5d0cc' },
  }[tone]
  return (
    <span style={{ display: 'inline-block', fontSize: 12, padding: '2px 8px', borderRadius: 4, background: t.bg, color: t.color, border: `1px solid ${t.bd}`, fontWeight: 500, whiteSpace: 'nowrap' }}>{children}</span>
  )
}

export function Section({ title, aside, children, pad = true }: { title?: ReactNode; aside?: ReactNode; children: ReactNode; pad?: boolean }) {
  return (
    <section style={{ ...card, marginBottom: 16 }}>
      {title && (
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.green }}>{title}</h2>
          {aside}
        </div>
      )}
      <div style={pad ? { padding: 18 } : undefined}>{children}</div>
    </section>
  )
}

export function Notice({ tone = 'ok', children }: { tone?: 'ok' | 'err'; children: ReactNode }) {
  const err = tone === 'err'
  return (
    <div style={{ padding: '10px 12px', borderRadius: RADIUS, fontSize: 13.5, background: err ? '#fdf0ef' : C.tint, color: err ? '#b42318' : C.green, border: `1px solid ${err ? '#f5d0cc' : '#cfe5dc'}` }}>{children}</div>
  )
}

export function Loading() {
  return <p style={{ padding: '48px 0', textAlign: 'center', color: C.muted, fontSize: 14, margin: 0 }}>กำลังโหลด...</p>
}
