'use client'

import { useState } from 'react'
import { sanitizeHtml } from '@/lib/sanitize'

interface Props {
  contentTh: string | null
  contentEn: string | null
  /**
   * Which language to show first. On the English page the visitor has already
   * said what they want — defaulting to Thai there makes the English body look
   * missing when it exists.
   */
  defaultLang?: 'th' | 'en'
}

/**
 * Renders the property description body with an optional TH/EN language toggle.
 * The toggle only appears when an English description is available.
 */
export default function DescriptionBody({ contentTh, contentEn, defaultLang = 'th' }: Props) {
  const hasEnBody = !!contentEn
  const [lang, setLang] = useState<'th' | 'en'>(defaultLang === 'en' && hasEnBody ? 'en' : 'th')

  const hasTh = contentTh && !contentTh.includes('เนื้อหาไม่พร้อม') && !contentTh.includes('ไม่พบเนื้อหา')
  const hasEn = hasEnBody

  if (!hasTh && !hasEn) return null

  const activeContent = lang === 'en' && hasEn ? contentEn : contentTh

  return (
    <div>
      {/* Language toggle — only shown when English body exists */}
      {hasEn && (
        <div style={{ display: 'flex', gap: 0, marginBottom: 14, borderRadius: 6, overflow: 'hidden', border: '1px solid #dcd8ce', width: 'fit-content' }}>
          {(['th', 'en'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: '5px 16px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: lang === l ? '#02402e' : '#ffffff',
                color:      lang === l ? '#fff'    : '#231f20',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {l === 'th' ? 'ภาษาไทย' : 'English'}
            </button>
          ))}
        </div>
      )}

      {activeContent && (
        <div
          className="property-content"
          
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(activeContent) }}
        />
      )}
    </div>
  )
}
