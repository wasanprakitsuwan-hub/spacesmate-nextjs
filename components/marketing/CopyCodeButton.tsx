'use client'

import { useState } from 'react'
import Icon from '@/components/ui/Icon'
import { C } from '@/lib/ui'

/** "Copy code" on the promo banner. Falls back silently where the clipboard API is blocked. */
export default function CopyCodeButton({ code, label, copiedLabel }: { code: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button type="button" aria-live="polite"
      onClick={() => {
        navigator.clipboard?.writeText(code).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }).catch(() => {})
      }}
      style={{ border: 0, background: C.white, color: C.green, fontWeight: 600, fontSize: 14, padding: '0 16px', minHeight: 52, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
      <Icon name={copied ? 'check' : 'copy'} size={16} color={C.green} strokeWidth={1.8} />
      {copied ? copiedLabel : label}
    </button>
  )
}
