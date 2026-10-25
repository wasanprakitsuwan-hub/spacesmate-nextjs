'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { C, RADIUS, btnStyle } from '@/lib/ui'
import { PageHead, Section, Notice, Loading, input, label } from '@/components/admin/ui'
import { type Guide, type GuideLocale, type GuideStep, DEFAULT_GUIDE, LISTING_GUIDE_KEY, normaliseGuide } from '@/lib/guide-data'

async function getToken() {
  const { data: { session } } = await createBrowserClient().auth.getSession()
  return session?.access_token ?? ''
}

// Pages › คู่มือการลงประกาศ. Edits the /guide text in both languages and saves
// it to site_settings 'listing_guide'; the settings API refreshes the page cache.
export default function GuideEditorPage() {
  const [guides, setGuides]   = useState<Record<GuideLocale, Guide>>(DEFAULT_GUIDE)
  const [lang, setLang]       = useState<GuideLocale>('th')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)
  const [uploading, setUploading] = useState<number | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken()
        const r = await fetch(`/api/dashboard/settings?key=${LISTING_GUIDE_KEY}`, { headers: { Authorization: `Bearer ${token}` } })
        const d = await r.json()
        const stored = d?.data as Record<string, unknown> | null
        if (stored) setGuides({
          th: stored.th ? normaliseGuide(stored.th, 'th') : DEFAULT_GUIDE.th,
          en: stored.en ? normaliseGuide(stored.en, 'en') : DEFAULT_GUIDE.en,
        })
      } catch { setMsg({ tone: 'err', text: 'โหลดคู่มือที่บันทึกไว้ไม่สำเร็จ แสดงค่าเริ่มต้นแทน' }) }
      setLoading(false)
    })()
  }, [])

  const g = guides[lang]
  const update = (next: Partial<Guide>) => setGuides(all => ({ ...all, [lang]: { ...all[lang], ...next } }))
  const setStep = (i: number, next: Partial<GuideStep>) => update({ steps: g.steps.map((s, j) => j === i ? { ...s, ...next } : s) })
  const moveStep = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= g.steps.length) return
    const steps = [...g.steps];[steps[i], steps[j]] = [steps[j], steps[i]]
    update({ steps })
  }

  async function uploadImage(i: number, file: File) {
    setUploading(i)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('type', 'image')
      const token = await getToken()
      const r = await fetch('/api/dashboard/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      const d = await r.json()
      if (!r.ok || !d.url) throw new Error(d.error ?? 'Upload failed')
      setStep(i, { image: d.url })
    } catch (e: any) { setMsg({ tone: 'err', text: `อัปโหลดรูปไม่สำเร็จ: ${e.message}` }) }
    setUploading(null)
  }

  async function save() {
    setSaving(true); setMsg(null)
    try {
      // Drop empty rows so a half-added item never reaches the page.
      const clean = (x: Guide): Guide => ({
        ...x,
        steps: x.steps.filter(s => s.title.trim()).map(s => ({ ...s, items: s.items.filter(it => it.text.trim()) })),
        faq: x.faq.filter(f => f.q.trim() && f.a.trim()),
      })
      const token = await getToken()
      const r = await fetch('/api/dashboard/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: LISTING_GUIDE_KEY, value: { th: clean(guides.th), en: clean(guides.en) } }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.detail || d.error || 'บันทึกไม่สำเร็จ')
      setMsg({ tone: 'ok', text: 'บันทึกแล้ว หน้าคู่มือบนเว็บอัปเดตทันที' })
    } catch (e: any) { setMsg({ tone: 'err', text: `ผิดพลาด: ${e.message}` }) }
    setSaving(false)
  }

  const small: React.CSSProperties = { background: 'none', border: 'none', color: C.teal, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }
  const danger: React.CSSProperties = { ...small, color: '#b42318' }

  return (
    <div>
      <PageHead
        back={{ href: '/dashboard/pages', label: 'หน้าเว็บ (Pages)' }}
        title="คู่มือการลงประกาศ"
        sub={<>แก้ข้อความหน้า <a href={lang === 'en' ? '/en/guide' : '/guide'} target="_blank" rel="noreferrer" style={{ color: C.teal }}>{lang === 'en' ? '/en/guide' : '/guide'}</a> ทุกบรรทัดควรตรงกับการทำงานจริงของเว็บ</>}
        actions={<>
          <div style={{ display: 'inline-flex', border: `1px solid ${C.border}`, borderRadius: RADIUS, overflow: 'hidden' }}>
            {(['th', 'en'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: '10px 16px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, background: lang === l ? C.green : C.white, color: lang === l ? C.white : C.ink }}>
                {l === 'th' ? 'ไทย' : 'English'}
              </button>
            ))}
          </div>
          <button onClick={save} disabled={saving || loading} className="sm-btn-primary" style={btnStyle('primary')}>{saving ? 'กำลังบันทึก...' : 'บันทึกทั้งสองภาษา'}</button>
        </>}
      />

      {msg && <div style={{ marginBottom: 16 }}><Notice tone={msg.tone}>{msg.text}</Notice></div>}
      {loading ? <Loading /> : (
        <>
          <Section title="หัวเรื่อง">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={label}>ชื่อคู่มือ (H1)</label><input value={g.title} onChange={e => update({ title: e.target.value })} style={input} /></div>
              <div><label style={label}>คำนำ</label><textarea value={g.intro} onChange={e => update({ intro: e.target.value })} rows={2} style={{ ...input, resize: 'vertical' }} /></div>
            </div>
          </Section>

          {g.steps.map((s, i) => (
            <Section key={i} title={`ขั้นที่ ${i + 1}`} aside={
              <div style={{ display: 'flex', gap: 14 }}>
                <button onClick={() => moveStep(i, -1)} disabled={i === 0} style={small}>ขึ้น</button>
                <button onClick={() => moveStep(i, 1)} disabled={i === g.steps.length - 1} style={small}>ลง</button>
                <button onClick={() => update({ steps: g.steps.filter((_, j) => j !== i) })} style={danger}>ลบขั้นนี้</button>
              </div>
            }>
              <div className="sm-guide-step" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 220px', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div><label style={label}>ชื่อขั้นตอน</label><input value={s.title} onChange={e => setStep(i, { title: e.target.value })} style={input} /></div>
                  <label style={{ ...label, marginBottom: 0 }}>รายการ (ข้อความ และหมายเหตุสีเทาใต้ข้อความ)</label>
                  {s.items.map((it, k) => (
                    <div key={k} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'start' }}>
                      <textarea value={it.text} onChange={e => setStep(i, { items: s.items.map((x, m) => m === k ? { ...x, text: e.target.value } : x) })} rows={2} placeholder="ข้อความ" style={{ ...input, resize: 'vertical' }} />
                      <textarea value={it.note ?? ''} onChange={e => setStep(i, { items: s.items.map((x, m) => m === k ? { ...x, note: e.target.value || undefined } : x) })} rows={2} placeholder="หมายเหตุ (ไม่บังคับ)" style={{ ...input, resize: 'vertical', color: C.muted }} />
                      <button onClick={() => setStep(i, { items: s.items.filter((_, m) => m !== k) })} style={{ ...danger, paddingTop: 10 }}>ลบ</button>
                    </div>
                  ))}
                  <div><button onClick={() => setStep(i, { items: [...s.items, { text: '' }] })} style={small}>+ เพิ่มรายการ</button></div>
                </div>
                <div>
                  <label style={label}>ภาพหน้าจอ</label>
                  {s.image
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={s.image} alt="" style={{ width: '100%', borderRadius: RADIUS, border: `1px solid ${C.line}`, display: 'block' }} />
                    : <div style={{ aspectRatio: '4 / 3', border: `1px dashed ${C.border}`, borderRadius: RADIUS, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: C.faint, background: C.paper }}>ยังไม่มีรูป</div>}
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <label style={{ ...small, display: 'inline-block' }}>
                      {uploading === i ? 'กำลังอัปโหลด...' : s.image ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
                      <input type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(i, f); e.target.value = '' }} />
                    </label>
                    {s.image && <button onClick={() => setStep(i, { image: undefined })} style={danger}>เอารูปออก</button>}
                  </div>
                </div>
              </div>
            </Section>
          ))}
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => update({ steps: [...g.steps, { title: '', items: [{ text: '' }] }] })} className="sm-btn-ghost" style={btnStyle('ghost')}>+ เพิ่มขั้นตอน</button>
          </div>

          <Section title="คำถามท้ายคู่มือ">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {g.faq.map((f, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, alignItems: 'start' }}>
                  <input value={f.q} onChange={e => update({ faq: g.faq.map((x, j) => j === i ? { ...x, q: e.target.value } : x) })} placeholder="คำถาม" style={input} />
                  <textarea value={f.a} onChange={e => update({ faq: g.faq.map((x, j) => j === i ? { ...x, a: e.target.value } : x) })} rows={2} placeholder="คำตอบ" style={{ ...input, resize: 'vertical' }} />
                  <button onClick={() => update({ faq: g.faq.filter((_, j) => j !== i) })} style={{ ...danger, paddingTop: 10 }}>ลบ</button>
                </div>
              ))}
              <div><button onClick={() => update({ faq: [...g.faq, { q: '', a: '' }] })} style={small}>+ เพิ่มคำถาม</button></div>
            </div>
          </Section>

          <button onClick={() => { if (confirm(`คืนค่าคู่มือภาษา${lang === 'th' ? 'ไทย' : 'อังกฤษ'}เป็นค่าเริ่มต้น? (ยังไม่บันทึกจนกว่าจะกดบันทึก)`)) update(DEFAULT_GUIDE[lang]) }} style={danger}>
            คืนค่าเริ่มต้นของภาษานี้
          </button>
        </>
      )}
      <style>{`@media (max-width: 900px) { .sm-guide-step { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
