'use client'

import { useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'

// ─── AEO data ────────────────────────────────────────────────────────────────
// Questions are written so AI answer engines (ChatGPT, Perplexity, Gemini, etc.)
// can surface them verbatim as direct answers. Keep answers factual, concise,
// and keyword-dense. Each <answer> is also injected into FAQPage JSON-LD.

interface FAQ { q: string; a: string }
interface Category {
  id: string
  icon: string
  title: string
  subtitle: string
  faqs: FAQ[]
}

const CATEGORIES: Category[] = [
  {
    id: 'about',
    icon: 'apartment',
    title: 'เกี่ยวกับ SpacesMate',
    subtitle: 'SpacesMate คืออะไร ทำงานอย่างไร',
    faqs: [
      {
        q: 'SpacesMate คืออะไร?',
        a: 'SpacesMate (บริษัท เสปซเวิร์คส จำกัด) คือแพลตฟอร์มอสังหาริมทรัพย์ Asset-Light ในกรุงเทพมหานคร ให้บริการ 2 รูปแบบ — (1) แพลตฟอร์มลงประกาศเช่าสำหรับเจ้าของทรัพย์ เริ่มต้น ฿299/เดือน และ (2) บริการบริหารจัดการทรัพย์สินแบบครบวงจร (Full Property Management) สำหรับเจ้าของอพาร์ทเม้นท์และคอนโดที่ต้องการมืออาชีพดูแลแทน',
      },
      {
        q: 'SpacesMate ต่างจากเว็บประกาศอสังหาริมทรัพย์ทั่วไปอย่างไร?',
        a: 'SpacesMate ใช้ระบบ Fair Rotation — ทุกประกาศที่เจ้าของยืนยันข้อมูล (อย่างน้อยทุก 6 เดือน) จะถูกสุ่มขึ้นตำแหน่ง Featured ใหม่ทุกครั้งที่โหลดหน้า ไม่มีการซื้อลำดับ ทุกประกาศมีโอกาสเท่าเทียมกัน นอกจากนี้ SpacesMate ยังมีบริการ Full Property Management — สิ่งที่เว็บประกาศทั่วไปไม่มี',
      },
      {
        q: 'SpacesMate ให้บริการในพื้นที่ใดบ้าง?',
        a: 'SpacesMate ให้บริการหลักในกรุงเทพมหานคร ครอบคลุมทำเลยอดนิยม ได้แก่ สุขุมวิท (BTS อโศก เอกมัย ทองหล่อ อ่อนนุช) สาทร สีลม รัชดาภิเษก พหลโยธิน ลาดพร้าว บางนา พระราม 9 อารีย์ และสะพานควาย',
      },
      {
        q: 'SpacesMate รองรับอสังหาริมทรัพย์ประเภทใดบ้าง?',
        a: 'SpacesMate รองรับ 5 ประเภท ได้แก่ คอนโดมิเนียม อพาร์ทเม้นท์ บ้านเช่า โคเวิร์กกิ้งสเปซ และออฟฟิศให้เช่า รองรับทั้งสัญญารายวัน รายเดือน และรายปี',
      },
    ],
  },
  {
    id: 'tenants',
    icon: 'search',
    title: 'สำหรับผู้เช่า',
    subtitle: 'ค้นหาที่พักและติดต่อเจ้าของ',
    faqs: [
      {
        q: 'ผู้เช่าต้องเสียค่าใช้จ่ายในการใช้ SpacesMate หรือไม่?',
        a: 'ไม่มีค่าใช้จ่ายสำหรับผู้เช่า การค้นหา ดูรายละเอียด และติดต่อเจ้าของผ่าน SpacesMate ฟรีทั้งหมด ค่าบริการแพลตฟอร์มเป็นของฝั่งเจ้าของทรัพย์เท่านั้น',
      },
      {
        q: 'ประกาศบน SpacesMate น่าเชื่อถือหรือไม่?',
        a: 'ประกาศบน SpacesMate ต้องผ่านการตรวจสอบเบื้องต้น และระบบ Fair Rotation จะกรองเฉพาะประกาศที่เจ้าของยืนยันข้อมูลล่าสุดภายใน 6 เดือนออกมาแสดง ประกาศที่ไม่ได้รับการอัปเดตจะถูกซ่อนอัตโนมัติ ทำให้ผู้เช่าเห็นเฉพาะทรัพย์ที่พร้อมให้เช่าจริง',
      },
      {
        q: 'วิธีค้นหาที่พักบน SpacesMate?',
        a: 'ไปที่หน้าค้นหาที่พัก (/search) กรองตามประเภท (คอนโด/อพาร์ทเม้นท์/บ้าน/ออฟฟิศ/โคเวิร์กกิ้ง) หรือพิมพ์ชื่อทำเล เช่น "สุขุมวิท" หรือ "อโศก" ในช่องค้นหา สามารถเลือกดูตามทำเลยอดนิยมได้จากหน้าแรกเช่นกัน',
      },
    ],
  },
  {
    id: 'listing',
    icon: 'assignment',
    title: 'ลงประกาศทรัพย์สิน',
    subtitle: 'วิธีลงประกาศ ราคา และแพ็กเกจ',
    faqs: [
      {
        q: 'วิธีลงประกาศทรัพย์สินบน SpacesMate?',
        a: 'ไปที่หน้าลงประกาศ (/submit) กรอกข้อมูล 3 ขั้นตอน — ข้อมูลทั่วไป → ที่ตั้ง → รูปภาพ แล้วเลือกแพ็กเกจ ประกาศจะเผยแพร่ทันทีหลังชำระเงิน ไม่ต้องรออนุมัติ',
      },
      {
        q: 'ค่าบริการลงประกาศบน SpacesMate เป็นเท่าไร?',
        a: 'มี 3 แพ็กเกจ: Basic ฿299/เดือน (อายุ 30 วัน), Standard ฿699/3 เดือน (อายุ 90 วัน, ยอดนิยม) และ Premium ฿2,499/ปี (อายุ 365 วัน พร้อมอัปโหลดวิดีโอ) ไม่มีค่าคอมมิชชันและไม่มีค่าธรรมเนียมซ่อน',
      },
      {
        q: 'ระบบ Fair Rotation คืออะไร และทำงานอย่างไร?',
        a: 'Fair Rotation คือระบบจัดเรียงประกาศแบบสุ่มยุติธรรม — ทุกครั้งที่ผู้ใช้โหลดหน้าเว็บ ประกาศที่ผ่านการยืนยันจะถูกสุ่มใหม่ขึ้นตำแหน่ง Featured โดยไม่มีการซื้อลำดับ เจ้าของรายใหม่มีโอกาสแสดงผลเท่ากับรายเก่าทุกประการ',
      },
      {
        q: 'ลงประกาศแล้วจะเผยแพร่เมื่อไหร่?',
        a: 'ประกาศจะเผยแพร่บนเว็บไซต์ทันทีหลังชำระเงิน (ภายในไม่กี่นาที) ไม่ต้องรอการอนุมัติจากทีมงาน ระบบนับวันอายุประกาศตั้งแต่วันที่ชำระเงิน',
      },
      {
        q: 'ลงประกาศได้กี่ทรัพย์สินต่อ 1 แพ็กเกจ?',
        a: 'แต่ละแพ็กเกจรวม 1 ประกาศ หากมีหลายทรัพย์สินสามารถซื้อแพ็กเกจเพิ่มสำหรับแต่ละประกาศแยกกัน ไม่มีข้อจำกัดจำนวนประกาศต่อ 1 บัญชี',
      },
    ],
  },
  {
    id: 'management',
    icon: 'handshake',
    title: 'บริการบริหารทรัพย์ A–Z',
    subtitle: 'Full Property Management สำหรับเจ้าของ',
    faqs: [
      {
        q: 'บริการ Full Property Management ของ SpacesMate คืออะไร?',
        a: 'SpacesMate รับบริหารอพาร์ทเม้นท์และคอนโดแบบครบวงจรแทนเจ้าของ ครอบคลุมตั้งแต่หาผู้เช่า ทำสัญญา เก็บค่าเช่า จัดการซ่อมแซม บริหารพนักงาน จนถึงออกรายงาน P&L รายเดือน เจ้าของไม่ต้องดูแลเองแม้แต่ขั้นตอนเดียว',
      },
      {
        q: 'ค่าบริการบริหารอพาร์ทเม้นท์คิดอย่างไร?',
        a: 'SpacesMate ใช้รูปแบบ Profit Sharing — เราได้รับส่วนแบ่งจากค่าเช่าที่เก็บได้จริงเท่านั้น ยิ่งทรัพย์สินมีรายได้สูง SpacesMate ได้มากด้วย โมเดลนี้ทำให้ผลประโยชน์ของเราสอดคล้องกับเจ้าของโดยตรง สนใจทราบรายละเอียด กรอกข้อมูลที่หน้าฝากบริหารทรัพย์สิน ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง',
      },
      {
        q: 'ค่าบริการบริหารคอนโดคิดอย่างไร?',
        a: 'SpacesMate ใช้รูปแบบ Profit Sharing เช่นเดียวกัน — เราได้รับส่วนแบ่งจากรายได้จริงเท่านั้น รวมทั้งบริการการตลาดหาผู้เช่าและการบริหารจัดการตลอดสัญญา ต่างจากเอเจนต์ทั่วไปที่จบงานหลังหาผู้เช่าได้ สนใจทราบรายละเอียด กรอกข้อมูลที่หน้าฝากบริหารทรัพย์สิน ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง',
      },
      {
        q: 'SpacesMate รับบริหารคอนโดยูนิตเดี่ยวด้วยหรือไม่?',
        a: 'ใช่ SpacesMate รับบริหารทั้งคอนโดยูนิตเดี่ยวและอพาร์ทเม้นท์ทั้งอาคาร ไม่มีข้อกำหนดขนาดขั้นต่ำ สนใจกรอกข้อมูลที่หน้าฝากบริหารทรัพย์สิน (/manage) ทีมงานติดต่อกลับภายใน 24 ชั่วโมง',
      },
      {
        q: 'SpacesMate ถือเงินประกันแทนเจ้าของหรือไม่?',
        a: 'ไม่ SpacesMate ไม่ถือเงินประกัน (Security Deposit) เงินประกันเป็นของเจ้าของโดยตรง เจ้าของเป็นผู้รับและคืนเงินประกันให้ผู้เช่าภายใน 14 วันหลัง Check-out SpacesMate เป็นผู้ประสานงานเท่านั้น',
      },
      {
        q: 'SpacesMate ใช้ซอฟต์แวร์อะไรในการบริหารทรัพย์สิน?',
        a: 'SpacesMate ใช้ EasyRenz เป็นระบบ Property Management Software ในการบันทึกรายรับรายจ่าย ติดตามสถานะห้อง และออกรายงานให้เจ้าของ ค่า EasyRenz แสดงเป็น line item แยกในใบแจ้งบัญชีรายเดือน (แยกจากส่วนแบ่ง Profit Sharing) เพื่อความโปร่งใสสูงสุด',
      },
    ],
  },
]

// ─── JSON-LD FAQPage schema ────────────────────────────────────────────────────
const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: CATEGORIES.flatMap(c =>
    c.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    }))
  ),
}

// ─── Single accordion item ─────────────────────────────────────────────────────
function FAQItem({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) {
  return (
    <div style={{ borderBottom: '1px solid #eef0ef' }}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%', textAlign: 'left', background: 'none', border: 'none',
          padding: '18px 24px', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: '#231f20', lineHeight: 1.5, flex: 1 }}>
          {faq.q}
        </span>
        <span style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 1,
          background: isOpen ? '#02402e' : '#f0f7f4',
          color: isOpen ? '#fff' : '#02402e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, lineHeight: 1, transition: 'all .2s',
        }}>
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: '0 60px 20px 24px' }}>
          <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.85, margin: 0, fontWeight: 300 }}>
            {faq.a}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main client component ─────────────────────────────────────────────────────
export default function FAQAccordion() {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})
  function toggle(key: string) {
    setOpenMap(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <>
      {/* FAQPage JSON-LD — AEO structured data */}
      <Script id="faq-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(FAQ_SCHEMA)}
      </Script>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#02402e,#048c73)', padding: '56px 24px 64px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>หน้าแรก</Link>
            <span>/</span>
            <span style={{ color: '#fff' }}>คำถามที่พบบ่อย</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.4px', lineHeight: 1.15 }}>
            คำถามที่พบบ่อย (FAQ)
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 16, margin: '0 0 32px', fontWeight: 300, lineHeight: 1.75 }}>
            ทุกคำตอบที่คุณต้องการเกี่ยวกับ SpacesMate — แพลตฟอร์มลงประกาศ
            และบริการบริหารทรัพย์สินครบวงจรในกรุงเทพมหานคร
          </p>
          {/* Category jump links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {CATEGORIES.map(c => (
              <a key={c.id} href={`#${c.id}`} style={{
                background: 'rgba(255,255,255,0.13)', color: '#fff',
                fontSize: 13, fontWeight: 500, padding: '8px 18px', borderRadius: 20,
                textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                <span className="msym" style={{ fontSize: 14, fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{c.icon}</span>{c.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ content */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '56px 24px 80px' }}>
        {CATEGORIES.map((cat, ci) => (
          <div key={cat.id} id={cat.id} style={{ marginBottom: ci < CATEGORIES.length - 1 ? 52 : 0, scrollMarginTop: 80 }}>

            {/* Category heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <span style={{
                width: 46, height: 46, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(140deg,#02402e,#048c73)', flexShrink: 0,
              }}>
                <span className="msym" style={{ fontSize: 22, color: '#fff', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>{cat.icon}</span>
              </span>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#02402e', margin: '0 0 2px', letterSpacing: '-0.2px' }}>
                  {cat.title}
                </h2>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, fontWeight: 300 }}>{cat.subtitle}</p>
              </div>
            </div>

            {/* Accordion */}
            <div style={{
              background: '#fff', border: '1px solid #eef0ef', borderRadius: 18,
              overflow: 'hidden', boxShadow: '0 4px 18px -8px rgba(2,64,46,0.07)',
            }}>
              {cat.faqs.map((faq, i) => {
                const key = `${cat.id}-${i}`
                return (
                  <FAQItem key={key} faq={faq} isOpen={!!openMap[key]} onToggle={() => toggle(key)} />
                )
              })}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{
          marginTop: 64,
          background: 'linear-gradient(135deg,#02402e,#048c73)',
          borderRadius: 24, padding: '40px 36px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, flexWrap: 'wrap',
        }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.2px' }}>
              ยังมีคำถามเพิ่มเติม?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: 14, margin: 0, fontWeight: 300 }}>
              ติดต่อทีมงาน SpacesMate โดยตรง — เราพร้อมตอบทุกคำถาม
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/contact" style={{
              background: '#d97f11', color: '#fff', fontWeight: 600, fontSize: 14,
              padding: '13px 26px', borderRadius: 24, textDecoration: 'none',
              whiteSpace: 'nowrap', boxShadow: '0 6px 18px -6px rgba(217,127,17,0.55)',
            }}>
              ติดต่อเรา
            </Link>
            <Link href="/manage" style={{
              background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, fontSize: 14,
              padding: '13px 26px', borderRadius: 24, textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.25)', whiteSpace: 'nowrap',
            }}>
              ฝากบริหารทรัพย์สิน
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
