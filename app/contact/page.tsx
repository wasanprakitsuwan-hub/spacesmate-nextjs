'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

const SERVICES = [
  'บริหารจัดการอพาร์ทเม้นท์',
  'บริหารจัดการคอนโด',
  'ลงประกาศเช่า/ขาย',
  'ปรึกษาเรื่องทรัพย์สิน',
  'อื่นๆ',
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: '', message: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="bg-white min-h-screen">

      {/* Header */}
      <div className="bg-spacemate-brandDark py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">ติดต่อเรา</h1>
          <p className="text-white/70 text-base font-light">ทีมงาน SpacesMate พร้อมให้คำปรึกษาและตอบกลับภายใน 24 ชั่วโมง</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Info */}
          <div>
            <h2 className="text-xl font-semibold text-spacemate-brandDark mb-6">ช่องทางติดต่อ</h2>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-spacemate-bgLight flex items-center justify-center flex-shrink-0 text-spacemate-brandTeal">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-spacemate-textCharcoal">อีเมล</p>
                  <p className="text-sm text-gray-500">hello@spacesmate.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-spacemate-bgLight flex items-center justify-center flex-shrink-0 text-spacemate-brandTeal">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-spacemate-textCharcoal">LINE@</p>
                  <a href="https://line.me/R/ti/p/@spacesmate" className="text-sm text-spacemate-brandTeal hover:underline">@spacesmate</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-spacemate-bgLight flex items-center justify-center flex-shrink-0 text-spacemate-brandTeal">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-spacemate-textCharcoal">ที่อยู่จดทะเบียน</p>
                  <p className="text-sm text-gray-500">4004/856 ถนนพระรามที่ 4 แขวงพระโขนง<br />เขตคลองเตย กรุงเทพมหานคร</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-5 rounded-2xl bg-spacemate-bgLight border border-spacemate-borderLight">
              <p className="text-xs text-gray-500 font-medium mb-2">เวลาทำการ</p>
              <p className="text-sm text-spacemate-textCharcoal">จันทร์ – ศุกร์: 9:00 – 18:00 น.</p>
              <p className="text-sm text-spacemate-textCharcoal">เสาร์: 10:00 – 16:00 น.</p>
            </div>
          </div>

          {/* Form */}
          <div>
            {submitted ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-spacemate-brandDark mb-2">ได้รับข้อความแล้ว!</h3>
                <p className="text-gray-500 text-sm">ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold text-spacemate-brandDark mb-6">ส่งข้อความถึงเรา</h2>

                <div>
                  <label className="label block mb-1.5">ชื่อ – นามสกุล *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="สมชาย ใจดี"
                    className="input-field w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label block mb-1.5">เบอร์โทรศัพท์ *</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="08X-XXX-XXXX"
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="label block mb-1.5">อีเมล</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className="input-field w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="label block mb-1.5">บริการที่สนใจ</label>
                  <select name="service" value={form.service} onChange={handleChange} className="input-field w-full">
                    <option value="">เลือกบริการ...</option>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label block mb-1.5">รายละเอียดเพิ่มเติม</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="บอกเราเพิ่มเติมเกี่ยวกับทรัพย์สินหรือความต้องการของคุณ..."
                    className="input-field w-full resize-none"
                  />
                </div>

                <button type="submit" className="btn-primary w-full">
                  ส่งข้อความ →
                </button>

                <p className="text-xs text-gray-400 text-center">
                  ข้อมูลของคุณปลอดภัยและเป็นความลับ ไม่มีการแชร์กับบุคคลที่สาม
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
