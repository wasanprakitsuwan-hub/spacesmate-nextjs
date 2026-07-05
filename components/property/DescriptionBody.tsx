'use client'

import { useState } from 'react'

interface Props {
  contentTh: string | null
  contentEn: string | null
}

/**
 * Renders the property description body with an optional TH/EN language toggle.
 * The toggle only appears when an English description is available.
 */
export default function DescriptionBody({ contentTh, contentEn }: Props) {
  const [lang, setLang] = useState<'th' | 'en'>('th')

  const hasTh = contentTh && !contentTh.includes('เนื้อหาไม่พร้อม') && !contentTh.includes('ไม่พบเนื้อหา')
  const hasEn = !!contentEn

  if (!hasTh && !hasEn) return null

  const activeContent = lang === 'en' && hasEn ? contentEn : contentTh

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Language toggle — only shown when English body exists */}
      {hasEn && (
        <div style={{ display: 'flex', gap: 0, marginBottom: 14, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', width: 'fit-content' }}>
          {(['th', 'en'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: '5px 16px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: lang === l ? '#02402e' : '#f8fafc',
                color:      lang === l ? '#fff'    : '#64748b',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {l === 'th' ? '🇹🇭 ภาษาไทย' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      )}

      {activeContent && (
        <div
          className="property-content"
          style={{ color: '#475569', lineHeight: 1.75, fontSize: 15 }}
          dangerouslySetInnerHTML={{ __html: activeContent }}
        />
      )}
    </div>
  )
}
