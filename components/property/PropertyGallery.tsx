'use client'

import { useState, useEffect, useCallback } from 'react'
import { PROPERTY_T, type Locale } from '@/lib/property-i18n'
import { C, RADIUS } from '@/lib/ui'

/**
 * Photo grid: one large photo and up to four beside it, with "see all N
 * photos" opening a full-screen viewer. On a phone only the large photo shows.
 * Redesign approved 25 Oct 2026.
 */
export default function PropertyGallery({ images, title, locale = 'th' }: { images: string[]; title: string; locale?: Locale }) {
  const t = PROPERTY_T[locale]
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)

  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, prev, next])

  function show(i: number) { setIdx(i); setOpen(true) }

  if (images.length === 0) {
    return <div style={{ aspectRatio: '16 / 7', borderRadius: RADIUS, background: C.line }} />
  }

  const side = images.slice(1, 5)
  const btn: React.CSSProperties = { border: 0, padding: 0, cursor: 'zoom-in', display: 'block', width: '100%', height: '100%', background: C.line, borderRadius: RADIUS, overflow: 'hidden' }
  const img: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }

  return (
    <>
      <div className={side.length ? 'sm-gallery' : undefined}
        style={{ position: 'relative', display: 'grid', gridTemplateColumns: side.length >= 3 ? '2fr 1fr 1fr' : side.length ? '2fr 1fr' : '1fr', gridTemplateRows: side.length ? '1fr 1fr' : '1fr', gap: 8, height: 'clamp(260px, 38vw, 460px)' }}>
        <button type="button" onClick={() => show(0)} style={{ ...btn, gridRow: side.length ? '1 / 3' : undefined }} aria-label={t.photoAlt(title, 1)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[0]} alt={t.photoAlt(title, 1)} style={img} />
        </button>
        {side.map((src, i) => (
          <button key={src + i} type="button" onClick={() => show(i + 1)} className="sm-gallery-side"
            style={{ ...btn, gridRow: side.length === 1 ? '1 / 3' : undefined, gridColumn: side.length === 3 && i === 2 ? '2 / 4' : undefined }}
            aria-label={t.photoAlt(title, i + 2)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={t.photoAlt(title, i + 2)} loading="lazy" style={img} />
          </button>
        ))}
        {images.length > 1 && (
          <button type="button" onClick={() => show(0)}
            style={{ position: 'absolute', right: 14, bottom: 14, background: C.white, color: C.ink, border: `1px solid ${C.border}`, borderRadius: RADIUS, padding: '7px 12px', fontSize: 13, fontWeight: 500, cursor: 'pointer', font: 'inherit' }}>
            {t.allPhotos(images.length)}
          </button>
        )}
      </div>
      <style>{`
        @media (max-width: 700px) {
          .sm-gallery { grid-template-columns: 1fr !important; grid-template-rows: 1fr !important; }
          .sm-gallery-side { display: none !important; }
        }
      `}</style>

      {open && (
        <div role="dialog" aria-modal="true" aria-label={title} onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(20,18,17,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button type="button" onClick={() => setOpen(false)} aria-label={t.closePhotos}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="msym" style={{ fontSize: 20 }}>close</span>
          </button>
          <span style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{idx + 1} / {images.length}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[idx]} alt={t.photoAlt(title, idx + 1)} onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: RADIUS, display: 'block' }} />
          {images.length > 1 && (
            <>
              <button type="button" onClick={e => { e.stopPropagation(); prev() }} aria-label={t.prevPhoto}
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: 48, height: 48, borderRadius: '50%', cursor: 'pointer', fontSize: 26 }}>‹</button>
              <button type="button" onClick={e => { e.stopPropagation(); next() }} aria-label={t.nextPhoto}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: 48, height: 48, borderRadius: '50%', cursor: 'pointer', fontSize: 26 }}>›</button>
              <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, overflowX: 'auto', maxWidth: '90vw', padding: '0 4px' }}>
                {images.map((src, i) => (
                  <button key={src + i} type="button" onClick={e => { e.stopPropagation(); setIdx(i) }} aria-label={t.photoAlt(title, i + 1)}
                    style={{ flexShrink: 0, width: 56, height: 40, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 4, overflow: 'hidden', outline: i === idx ? '2px solid #fff' : '2px solid transparent', opacity: i === idx ? 1 : 0.55 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
