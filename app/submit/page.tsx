'use client'

import { useState } from 'react'
import { PROPERTY_TYPE_LABELS, AMENITY_LABELS } from '@/lib/constants'
import type { PropertyType } from '@/lib/types'

const STEPS = ['ข้อมูลทรัพย์สิน', 'ที่ตั้ง', 'รูปภาพ']

interface FormData {
  // Step 1
  title_th: string
  property_type: PropertyType | ''
  status: 'for_rent' | 'for_sale'
  price: string
  area_sqm: string
  bedrooms: string
  bathrooms: string
  floor: string
  description_th: string
  amenities: string[]
  // Step 2
  address_th: string
  district: string
  sub_district: string
  province: string
  postcode: string
  // Step 3
  images: File[]
}

const INITIAL: FormData = {
  title_th: '', property_type: '', status: 'for_rent',
  price: '', area_sqm: '', bedrooms: '1', bathrooms: '1', floor: '',
  description_th: '', amenities: [],
  address_th: '', district: '', sub_district: '',
  province: 'กรุงเทพมหานคร', postcode: '',
  images: [],
}

export default function SubmitPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitted, setSubmitted] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  function set(key: keyof FormData, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleAmenity(key: string) {
    set('amenities', form.amenities.includes(key)
      ? form.amenities.filter(a => a !== key)
      : [...form.amenities, key]
    )
  }

  function handleImages(files: FileList | null) {
    if (!files) return
    set('images', [...form.images, ...Array.from(files)].slice(0, 10))
  }

  function handleSubmit() {
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-spacemate-brandDark mb-3">ประกาศของคุณถูกส่งแล้ว!</h2>
          <p className="text-gray-500 text-sm mb-6">
            ทีมงาน SpacesMate จะตรวจสอบและเผยแพร่ประกาศของคุณภายใน 24 ชั่วโมง
            คุณจะได้รับแพ็กเกจทดลองใช้ฟรี 30 วัน
          </p>
          <a href="/" className="btn-primary inline-block">กลับหน้าแรก</a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-spacemate-brandDark mb-1">ลงประกาศที่พัก</h1>
        <p className="text-gray-400 text-sm">ง่าย 3 ขั้นตอน · ฟรี 30 วันแรก</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((label, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-all ${
              i < step ? 'bg-spacemate-brandTeal text-white'
              : i === step ? 'bg-spacemate-brandGold text-white shadow-lg scale-110'
              : 'bg-gray-200 text-gray-400'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium ${i === step ? 'text-spacemate-brandGold' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`absolute h-0.5 w-[calc(33%-2rem)] mt-4 translate-x-[calc(50%+1rem)] transition-colors ${i < step ? 'bg-spacemate-brandTeal' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-premium p-6 md:p-8">

        {/* ── Step 1: Property Info ── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="label">ชื่อประกาศ *</label>
              <input type="text" value={form.title_th} onChange={e => set('title_th', e.target.value)}
                placeholder="เช่น เช่าคอนโด ใกล้ BTS เอกมัย 1 ห้องนอน ราคาดี"
                className="input-field" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">ประเภทที่พัก *</label>
                <select value={form.property_type} onChange={e => set('property_type', e.target.value)} className="input-field">
                  <option value="">เลือกประเภท</option>
                  {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.th}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">สถานะ</label>
                <div className="flex rounded-lg border border-spacemate-borderLight overflow-hidden h-[46px]">
                  {(['for_rent', 'for_sale'] as const).map(s => (
                    <button key={s} type="button"
                      onClick={() => set('status', s)}
                      className={`flex-1 text-sm font-medium transition-colors ${form.status === s ? 'bg-spacemate-brandDark text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                      {s === 'for_rent' ? 'ให้เช่า' : 'ขาย'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">ราคา (บาท/เดือน) *</label>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                  placeholder="เช่น 15000" className="input-field" />
              </div>
              <div>
                <label className="label">ขนาดพื้นที่ (ตร.ม.) *</label>
                <input type="number" value={form.area_sqm} onChange={e => set('area_sqm', e.target.value)}
                  placeholder="เช่น 32" className="input-field" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">ห้องนอน</label>
                <select value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} className="input-field">
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} ห้อง</option>)}
                </select>
              </div>
              <div>
                <label className="label">ห้องน้ำ</label>
                <select value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} className="input-field">
                  {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} ห้อง</option>)}
                </select>
              </div>
              <div>
                <label className="label">ชั้น</label>
                <input type="number" value={form.floor} onChange={e => set('floor', e.target.value)}
                  placeholder="เช่น 7" className="input-field" />
              </div>
            </div>

            <div>
              <label className="label">รายละเอียด</label>
              <textarea value={form.description_th} onChange={e => set('description_th', e.target.value)}
                rows={4} placeholder="อธิบายจุดเด่น สิ่งอำนวยความสะดวก และทำเลของห้อง..."
                className="input-field resize-none" />
            </div>

            <div>
              <label className="label mb-3">สิ่งอำนวยความสะดวก</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(AMENITY_LABELS).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => toggleAmenity(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      form.amenities.includes(key)
                        ? 'bg-spacemate-brandDark text-white border-spacemate-brandDark'
                        : 'bg-white text-gray-500 border-spacemate-borderLight hover:border-spacemate-brandTeal'
                    }`}>
                    {label.icon} {label.th}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Location ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="label">ที่อยู่ *</label>
              <input type="text" value={form.address_th} onChange={e => set('address_th', e.target.value)}
                placeholder="เลขที่, อาคาร, ซอย, ถนน" className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">แขวง *</label>
                <input type="text" value={form.district} onChange={e => set('district', e.target.value)}
                  placeholder="เช่น พระโขนง" className="input-field" />
              </div>
              <div>
                <label className="label">เขต *</label>
                <input type="text" value={form.sub_district} onChange={e => set('sub_district', e.target.value)}
                  placeholder="เช่น คลองเตย" className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">จังหวัด</label>
                <input type="text" value={form.province} onChange={e => set('province', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">รหัสไปรษณีย์</label>
                <input type="text" value={form.postcode} onChange={e => set('postcode', e.target.value)}
                  placeholder="เช่น 10110" className="input-field" maxLength={5} />
              </div>
            </div>

            {/* Map Placeholder */}
            <div>
              <label className="label">ตำแหน่งบนแผนที่</label>
              <div className="h-48 bg-spacemate-bgLight border-2 border-dashed border-spacemate-brandTeal rounded-2xl flex flex-col items-center justify-center gap-2 text-spacemate-brandTeal">
                <span className="text-3xl">📍</span>
                <p className="text-sm font-medium">ปักหมุดตำแหน่งที่พัก</p>
                <p className="text-xs text-gray-400">คลิกเพื่อเลือกตำแหน่งบนแผนที่ (Google Maps จะเชื่อมต่อในเวอร์ชันจริง)</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Images ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleImages(e.dataTransfer.files) }}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                dragOver ? 'border-spacemate-brandGold bg-spacemate-brandGold/5' : 'border-spacemate-brandTeal hover:bg-spacemate-bgLight'
              }`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="text-4xl mb-3">📷</div>
              <p className="font-semibold text-spacemate-brandDark mb-1">ลากรูปภาพมาวางที่นี่</p>
              <p className="text-gray-400 text-sm">หรือคลิกเพื่อเลือกไฟล์ · JPG, PNG · สูงสุด 10 รูป</p>
              <input id="file-input" type="file" multiple accept="image/*" className="hidden"
                onChange={e => handleImages(e.target.files)} />
            </div>

            {/* Preview Grid */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {form.images.map((file, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-spacemate-bgLight group">
                    <img src={URL.createObjectURL(file)} alt={`preview-${i}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => set('images', form.images.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                    >×</button>
                    {i === 0 && <span className="absolute bottom-1 left-1 badge-gold text-xs">หน้าปก</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Free Trial Badge */}
            <div className="bg-spacemate-brandGold/10 border border-spacemate-brandGold rounded-xl p-4 text-center">
              <p className="text-spacemate-brandGold font-semibold text-sm">🎉 ฟรี 30 วันแรก</p>
              <p className="text-gray-500 text-xs mt-1">ไม่ต้องใช้บัตรเครดิต · ยกเลิกได้ทุกเมื่อ</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-outline-dark flex-1 text-sm">
              ← ย้อนกลับ
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="btn-primary flex-1 text-sm">
              ถัดไป →
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn-primary flex-1 text-sm">
              ✓ เผยแพร่ประกาศ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
