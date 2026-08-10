import type { Metadata } from 'next'
import CookieSettingsLink from '@/components/consent/CookieSettingsLink'

/**
 * Privacy notice — v2, 10 August 2026.
 *
 * Rewritten from PDPA_Data_Map_and_Lawful_Basis.md and PDPA_Retention_Schedule.md
 * rather than from an idea of what the company does. Every retention period here
 * matches a job that actually runs nightly in the database; every recipient named
 * was verified firing on the deployed site.
 *
 * The previous version described browser-level cookie control the site no longer
 * relies on, named no recipients (Meta was absent entirely, despite its pixel
 * being live), had no cross-border section, stated no lawful bases, quoted
 * retention periods the database contradicts, and carried an effective date of
 * 6 มกราคม 2568 — a year before Space Works was incorporated.
 *
 * NOT YET REVIEWED BY COUNSEL. Published because the previous text was
 * inaccurate and Section 23 requires telling people what actually happens; an
 * accurate unreviewed notice beats a reviewed-looking wrong one. Lawful bases
 * are as proposed in the data map and may change on legal review.
 *
 * Deliberately NOT claimed: that processors are bound by signed data processing
 * agreements. None are filed yet, and Vercel Hobby has no DPA at all. Restore
 * that wording once PDPA_Processor_DPA_Register.md is complete.
 */

export const metadata: Metadata = {
  title: 'นโยบายความเป็นส่วนตัว | SpacesMate',
  description:
    'นโยบายความเป็นส่วนตัวของ Space Works Co., Ltd. (SpacesMate) — ข้อมูลที่เก็บ ฐานทางกฎหมาย ผู้รับข้อมูล การส่งข้อมูลไปต่างประเทศ ระยะเวลาเก็บรักษา และสิทธิของคุณ ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)',
  alternates: { canonical: 'https://spacesmate.com/privacy' },
}

const SECTIONS = [
  {
    title: '1. ข้อมูลที่เราเก็บ และฐานทางกฎหมาย',
    content: `เราเก็บข้อมูลเท่าที่จำเป็นตามวัตถุประสงค์แต่ละข้อ:

• ประกาศทรัพย์สิน — ชื่อผู้ติดต่อ โทรศัพท์ อีเมล LINE ID ที่อยู่ทรัพย์ พิกัด ราคา เงื่อนไขเช่า
   เพื่อเผยแพร่และจัดการประกาศ · ฐาน: การปฏิบัติตามสัญญา

• คำขอลงประกาศ — ชื่อ อีเมล โทรศัพท์ LINE ID รายละเอียดทรัพย์
   เพื่อพิจารณาและดำเนินการคำขอ · ฐาน: การดำเนินการตามคำขอก่อนเข้าทำสัญญา

• บัญชีผู้ใช้ — อีเมล ชื่อ-นามสกุล โทรศัพท์ LINE ID บทบาท รหัสผ่านที่เข้ารหัสแล้ว
   เพื่อยืนยันตัวตนและควบคุมสิทธิ · ฐาน: การปฏิบัติตามสัญญา

• การชำระเงิน — รหัสลูกค้าและรหัสการสมัครสมาชิกจาก Stripe แพ็กเกจ วันที่
   เพื่อเรียกเก็บค่าบริการ บัญชีและภาษี · ฐาน: สัญญา + หน้าที่ตามกฎหมาย

• คุกกี้วิเคราะห์และโฆษณา — ตัวระบุออนไลน์ IP address ข้อมูลหน้าเว็บและอุปกรณ์
   เพื่อวัดผลการใช้งานและโฆษณา · ฐาน: ความยินยอม (ถอนได้ตลอดเวลา)

• การสนทนาผ่าน LINE — ชื่อที่แสดง LINE user ID ข้อความ
   เพื่อตอบคำถามและให้บริการ · ฐาน: การดำเนินการก่อนเข้าทำสัญญา หรือประโยชน์โดยชอบด้วยกฎหมาย

เราไม่เก็บข้อมูลบัตรเครดิต ข้อมูลบัตรอยู่กับ Stripe และไม่ผ่านระบบของ SpacesMate

คุกกี้ที่จำเป็นสำหรับการเข้าสู่ระบบและความปลอดภัยไม่ได้ขอความยินยอม เพราะเว็บไซต์ทำงานไม่ได้หากไม่มี — และการเสนอเป็นตัวเลือกที่ปฏิเสธไม่ได้จริงย่อมไม่ใช่ทางเลือก`,
  },
  {
    title: '2. คุกกี้และความยินยอม',
    content: `เว็บไซต์ไม่โหลดเครื่องมือวิเคราะห์หรือโฆษณาใด ๆ จนกว่าคุณจะให้ความยินยอม

เมื่อคุณให้ความยินยอมแล้ว จะมีการโหลด:

• Google Tag Manager — ผู้รับ: Google
• Google Analytics 4 — ผู้รับ: Google (G-QBQV320QXT)
• Meta Pixel — ผู้รับ: Meta Platforms, Inc. (26085822227748725)

การถอนความยินยอมทำได้ตลอดเวลาและง่ายเท่ากับการให้ ผ่านลิงก์ "ตั้งค่าคุกกี้" ที่ส่วนท้ายของทุกหน้า การถอนมีผลทันที และไม่กระทบความชอบด้วยกฎหมายของการประมวลผลก่อนหน้า

เราบันทึกการตัดสินใจของคุณไว้ในระบบเพื่อพิสูจน์ได้ตามมาตรา 19 โดยบันทึกดังกล่าวไม่มี IP address และไม่มี user agent — เก็บเพียงว่ายินยอมอะไร ต่อนโยบายฉบับใด และเมื่อใด`,
  },
  {
    title: '3. การเปิดเผยข้อมูลและผู้ประมวลผล',
    content: `เราไม่ขายและไม่ให้เช่าข้อมูลส่วนบุคคลของคุณ

เราใช้ผู้ให้บริการภายนอกดังนี้ ซึ่งประมวลผลข้อมูลตามคำสั่งของเราและตามข้อกำหนดการให้บริการของแต่ละราย:

• Supabase — ฐานข้อมูลหลัก (บัญชี ประกาศ คำขอ) · สิงคโปร์
• Vercel — โฮสติ้งเว็บไซต์ (ข้อมูลคำขอ log) · สหรัฐอเมริกา / edge ทั่วโลก
• Google — Tag Manager, Analytics (ตัวระบุออนไลน์ ข้อมูลการใช้งาน) · สหรัฐอเมริกา
• Meta Platforms — Pixel เพื่อการโฆษณา (ตัวระบุออนไลน์ พฤติกรรมการเข้าชม) · สหรัฐอเมริกา
• Stripe — รับชำระเงิน (ข้อมูลบัตรและรหัสลูกค้า) · สหรัฐอเมริกา / ไอร์แลนด์
• n8n Cloud — ระบบอัตโนมัติ · สหภาพยุโรป
• LINE — ช่องทางติดต่อ (ข้อความและโปรไฟล์ LINE) · ญี่ปุ่น / ภูมิภาค

นอกจากนี้เราอาจเปิดเผยข้อมูลเมื่อกฎหมายกำหนด เช่น คำสั่งศาลหรือหน่วยงานรัฐ หรือกรณีควบรวมกิจการ ซึ่งจะแจ้งให้ทราบล่วงหน้า`,
  },
  {
    title: '4. การส่งข้อมูลไปต่างประเทศ (มาตรา 28–29)',
    content: `ผู้ให้บริการข้างต้นทั้งหมดตั้งอยู่นอกประเทศไทย ข้อมูลส่วนบุคคลของคุณจึงถูกส่งและจัดเก็บในต่างประเทศ

เราเลือกใช้ผู้ให้บริการที่มีมาตรฐานด้านความปลอดภัยและการคุ้มครองข้อมูลส่วนบุคคลเป็นที่ยอมรับในระดับสากล และประมวลผลข้อมูลภายใต้ข้อกำหนดการให้บริการที่กำหนดหน้าที่ด้านการคุ้มครองข้อมูล

หากคุณต้องการทราบรายละเอียดเกี่ยวกับผู้ให้บริการรายใดรายหนึ่งหรือมาตรการคุ้มครองที่ใช้ ติดต่อเราตามข้อ 8`,
  },
  {
    title: '5. ระยะเวลาการเก็บรักษา',
    content: `• ประกาศทรัพย์สิน — 24 เดือน หลังประกาศไม่ใช้งานและไม่มีการสมัครสมาชิกที่ยังมีผล
• คำขอลงประกาศที่อนุมัติแล้ว — 12 เดือน หลังสร้างประกาศ
• คำขอลงประกาศที่ปฏิเสธหรือไม่ดำเนินการ — 6 เดือน
• บัญชีผู้ใช้ — 12 เดือน หลังปิดบัญชี
• ข้อมูลการชำระเงินและบัญชี — 7 ปี นับจากสิ้นรอบบัญชี (พ.ร.บ. การบัญชี มาตรา 14)
• การสนทนาผ่าน LINE — 12 เดือน
• Google Analytics — 14 เดือน
• บันทึกความยินยอม — 3 ปี

เมื่อครบกำหนด ข้อมูลจะถูกลบหรือทำให้ไม่สามารถระบุตัวบุคคลได้โดยกระบวนการอัตโนมัติที่ทำงานทุกคืน`,
  },
  {
    title: '6. ความปลอดภัย',
    content: `• เข้ารหัสการรับส่งข้อมูลด้วย HTTPS/TLS
• ควบคุมการเข้าถึงตามบทบาทหน้าที่ (RBAC) และตรวจสอบสิทธิที่ฝั่งเซิร์ฟเวอร์ทุกครั้ง
• รหัสผ่านเก็บในรูปแบบ hash ไม่ใช่ข้อความธรรมดา
• บันทึกการเข้าถึงข้อมูลที่อ่อนไหวเพื่อการตรวจสอบ
• ทบทวนความเสี่ยงและสิทธิการเข้าถึงเป็นระยะ

ไม่มีระบบใดปลอดภัยสมบูรณ์ หากเกิดเหตุละเมิดข้อมูลส่วนบุคคลที่มีความเสี่ยงต่อสิทธิและเสรีภาพของคุณ เราจะแจ้งสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคลภายใน 72 ชั่วโมง ตามมาตรา 37(4) และแจ้งคุณโดยไม่ชักช้าเมื่อกฎหมายกำหนด`,
  },
  {
    title: '7. สิทธิของคุณ',
    content: `ภายใต้ PDPA คุณมีสิทธิ:

• เข้าถึง — ขอสำเนาข้อมูลส่วนบุคคลที่เราเก็บ (มาตรา 30)
• แก้ไข — ขอแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่เป็นปัจจุบัน (มาตรา 35)
• ลบ — ขอลบข้อมูลในกรณีที่กฎหมายอนุญาต (มาตรา 33)
• ระงับการใช้ — ขอให้ระงับการประมวลผลชั่วคราว (มาตรา 34)
• คัดค้าน — คัดค้านการประมวลผลที่อาศัยประโยชน์โดยชอบด้วยกฎหมาย หรือเพื่อการตลาด (มาตรา 32)
• โอนย้ายข้อมูล — ขอรับข้อมูลในรูปแบบที่อ่านได้ด้วยเครื่อง (มาตรา 31)
• ถอนความยินยอม — ตลอดเวลา และง่ายเท่ากับการให้ความยินยอม (มาตรา 19 วรรคห้า)
• ร้องเรียน — ต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (สคส.) หากเห็นว่าเราไม่ปฏิบัติตามกฎหมาย

เราจะตอบคำขอภายใน 30 วัน นับแต่ได้รับคำขอ`,
  },
  {
    title: '8. ติดต่อเรา',
    content: `บริษัท เสปซเวิร์คส จำกัด (Space Works Co., Ltd.)
ทะเบียนเลขที่ 0105569001611
ที่อยู่จดทะเบียน: 4004/856 ถนนพระรามที่ 4 แขวงพระโขนง เขตคลองเตย กรุงเทพมหานคร
อีเมล (รวมถึงเรื่องข้อมูลส่วนบุคคลและการใช้สิทธิ): support@spacesmate.com
เว็บไซต์: www.spacesmate.com`,
  },
  {
    title: '9. พนักงานและผู้ติดต่อฉุกเฉิน',
    content: `หากคุณเป็นพนักงานของ SpacesMate จะมีประกาศความเป็นส่วนตัวสำหรับพนักงานแยกต่างหากในระบบอินทราเน็ต ครอบคลุมข้อมูลการลงเวลา ตำแหน่งที่ตั้ง การลา และเอกสารประกอบ

ผู้ติดต่อฉุกเฉิน: พนักงานให้ชื่อและเบอร์โทรของผู้ติดต่อฉุกเฉินไว้กับเรา ข้อมูลนี้ใช้เพื่อติดต่อในกรณีฉุกเฉินเท่านั้น และจะถูกลบเมื่อพ้นสภาพการเป็นพนักงาน พนักงานควรแจ้งบุคคลดังกล่าวให้ทราบว่าได้ให้ข้อมูลไว้`,
  },
  {
    title: '10. การเปลี่ยนแปลงนโยบาย',
    content: `หากมีการเปลี่ยนแปลงสาระสำคัญ เราจะแจ้งทางอีเมลที่ลงทะเบียนไว้หรือประกาศบนเว็บไซต์

หากการเปลี่ยนแปลงกระทบวัตถุประสงค์ที่คุณเคยให้ความยินยอมไว้ เราจะขอความยินยอมใหม่ ความยินยอมที่ให้ไว้เพื่อวัตถุประสงค์หนึ่ง ไม่ใช่ความยินยอมเพื่ออีกวัตถุประสงค์หนึ่ง`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div style={{ background: '#02402e', padding: '52px 24px 60px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 12, color: '#d97f11', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>Legal</p>
          <h1 style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>นโยบายความเป็นส่วนตัว</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0 }}>มีผลบังคับใช้ตั้งแต่ 10 สิงหาคม 2569 | ปรับปรุงล่าสุด 10 สิงหาคม 2569</p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '52px 24px 80px' }}>
        {/* Intro */}
        <div style={{ padding: '24px', background: '#f7f9f8', borderRadius: 16, border: '1px solid #eef0ef', marginBottom: 40 }}>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.75, margin: 0, fontWeight: 300 }}>
            บริษัท เสปซเวิร์คส จำกัด (<strong>Space Works Co., Ltd.</strong>) ทะเบียนเลขที่ 0105569001611
            ซึ่งดำเนินธุรกิจในนาม <strong>SpacesMate</strong> เป็นผู้ควบคุมข้อมูลส่วนบุคคลตาม
            พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
          </p>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.75, margin: '12px 0 0', fontWeight: 300 }}>
            นโยบายนี้อธิบายว่าเราเก็บข้อมูลอะไร ใช้เพื่ออะไร อาศัยฐานทางกฎหมายใด เปิดเผยให้ใคร
            เก็บไว้นานเท่าใด และคุณมีสิทธิอะไรบ้าง
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {SECTIONS.map(s => (
            <div key={s.title}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#02402e', margin: '0 0 14px' }}>{s.title}</h2>
              <div style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-line', fontWeight: 300 }}>{s.content}</div>
            </div>
          ))}
        </div>

        {/* Cookie settings — the withdrawal route promised in section 2 and 7.
            Repeated here as well as in the footer, because someone reading about
            their right to withdraw should be able to act on it without hunting. */}
        <div style={{ marginTop: 44, padding: '20px 24px', background: '#f7f9f8', borderRadius: 16, border: '1px solid #eef0ef' }}>
          <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.7, margin: '0 0 10px', fontWeight: 300 }}>
            ต้องการเปลี่ยนหรือถอนความยินยอมเรื่องคุกกี้?
          </p>
          <CookieSettingsLink className="text-sm font-semibold underline" />
        </div>
      </div>
    </div>
  )
}
