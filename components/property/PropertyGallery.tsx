'use client'

import { useState, useCallback } from 'react'

interface Props {
  images: string[]       // all gallery images
  title: string
  priceDisplay: string
  typeLabel: string
  featured: boolean
}

export default function PropertyGallery({ images, title, priceDisplay, typeLabel, featured }: Props) {
  const [active, setActive]         = useState(0)
  const [lightboxOpen, setLightbox] = useState(false)
  const [lightboxIdx, setLbIdx]     = useState(0)

  const prev = useCallback(() => setActive(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setActive(i => (i + 1) % images.length), [images.length])

  const lbPrev = () => setLbIdx(i => (i - 1 + images.length) % images.length)
  const lbNext = () => setLbIdx(i => (i + 1) % images.length)

  function openLightbox(idx: number) {
    setLbIdx(idx)
    setLightbox(true)
  }

  const single = images.length <= 1

  return (
    <>
      {/* ── Main gallery ─────────────────────────────────────── */}
      <div style={{ background: '#0d2d22' }}>

        {/* Hero image */}
        <div
          style={{ position: 'relative', width: '100%', height: 'clamp(260px, 52vw, 500px)', cursor: single ? 'default' : 'zoom-in', overflow: 'hidden' }}
          onClick={() => !single && openLightbox(active)}
        >
          {images[active] ? (
            <img
              key={active}
              src={images[active]}
              alt={`${title} — รูปที่ ${active + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#02402e,#048c73)' }} />
          )}

          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(2,64,46,0.4))' }} />

          {/* Price badge */}
          <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
            <span style={{ display: 'inline-block', color: '#fff', fontWeight: 700, fontSize: 20, padding: '8px 16px', borderRadius: 12, background: 'rgba(2,64,46,0.82)', backdropFilter: 'blur(8px)' }}>
              {priceDisplay}
            </span>
          </div>

          {/* Featured badge */}
          {featured && (
            <div style={{ position: 'absolute', top: 14, left: 14 }}>
              <span style={{ display: 'inline-block', color: '#fff', fontWeight: 600, fontSize: 12, padding: '5px 12px', borderRadius: 20, background: '#d97f11' }}>แนะนำ</span>
            </div>
          )}

          {/* Type label */}
          <div style={{ position: 'absolute', top: 14, right: 14 }}>
            <span style={{ display: 'inline-block', color: '#fff', fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 20, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(6px)' }}>
              {typeLabel}
            </span>
          </div>

          {/* Counter + zoom hint */}
          {!single && (
            <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)', padding: '4px 10px', borderRadius: 20 }}>
                {active + 1} / {images.length}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ⊕
              </span>
            </div>
          )}

          {/* Prev / Next arrows */}
          {!single && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                aria-label="รูปก่อนหน้า"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(6px)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}
              >‹</button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                aria-label="รูปถัดไป"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(6px)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}
              >›</button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {!single && (
          <div style={{ display: 'flex', gap: 4, padding: '4px 4px', overflowX: 'auto', scrollSnapType: 'x mandatory', background: '#0d2d22' }}>
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`ดูรูปที่ ${i + 1}`}
                style={{
                  flexShrink: 0, width: 80, height: 56, border: 'none', padding: 0, cursor: 'pointer',
                  borderRadius: 6, overflow: 'hidden', scrollSnapAlign: 'start',
                  outline: i === active ? '2.5px solid #d97f11' : '2.5px solid transparent',
                  outlineOffset: 1, transition: 'outline .15s', opacity: i === active ? 1 : 0.6,
                }}
              >
                {src ? (
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#02402e' }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            style={{ position: 'absolute', top: 18, right: 18, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✕</button>

          {/* Counter */}
          <span style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
            {lightboxIdx + 1} / {images.length}
          </span>

          {/* Main image */}
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', position: 'relative' }}>
            <img
              src={images[lightboxIdx]}
              alt={`${title} รูปที่ ${lightboxIdx + 1}`}
              style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12, objectFit: 'contain', display: 'block' }}
            />
          </div>

          {/* Prev */}
          <button
            onClick={e => { e.stopPropagation(); lbPrev() }}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: 48, height: 48, borderRadius: '50%', cursor: 'pointer', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >‹</button>

          {/* Next */}
          <button
            onClick={e => { e.stopPropagation(); lbNext() }}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: 48, height: 48, borderRadius: '50%', cursor: 'pointer', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >›</button>

          {/* Thumbnail strip in lightbox */}
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, overflowX: 'auto', maxWidth: '90vw', padding: '0 4px' }}>
            {images.map((src, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setLbIdx(i) }}
                style={{
                  flexShrink: 0, width: 56, height: 40, border: 'none', padding: 0, cursor: 'pointer',
                  borderRadius: 5, overflow: 'hidden',
                  outline: i === lightboxIdx ? '2px solid #d97f11' : '2px solid rgba(255,255,255,0.2)',
                  opacity: i === lightboxIdx ? 1 : 0.55, transition: 'all .15s',
                }}
              >
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
