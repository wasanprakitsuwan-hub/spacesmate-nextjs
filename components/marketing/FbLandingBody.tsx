import FbAttribution from '@/components/marketing/FbAttribution'
import CookieSettingsLink from '@/components/consent/CookieSettingsLink'
import { PACKAGE_PRICE_THB, PACKAGE_IMAGE_LIMITS, pricePerMonth } from '@/lib/packages'

export type SampleCard = { title: string; meta: string; price: number; image: string }

/**
 * /list-your-property/fb — the owner landing page for Facebook and Instagram ads.
 *
 * Thai only (never reached from /en), built for the phone-sized in-app browser:
 * one call to action, repeated in a bar pinned to the bottom of the screen,
 * the three steps visible without scrolling, and nothing that links out of the
 * funnel (no search, blog, management or language links; see lib/funnel).
 *
 * Server-rendered with no client JavaScript of its own beyond the ad-source
 * capture: the FAQ is <details>, so it opens instantly on slow connections.
 *
 * Every claim is a current fact of the product:
 *   · the promo code comes from Settings › การชำระเงิน and the free-month copy
 *     shows only while that promo is switched on (promoCode null = off);
 *   · prices and photo limits come from lib/packages;
 *   · "no pay-to-rank" is Fair Rotation (lib/fair-rotation): no package boost;
 *   · owners are contacted directly by phone and LINE from the listing page.
 * No tenant "no agent fee" claim; owner "no commission" is true.
 */

const NEW = '/list-your-property/new'

export default function FbLandingBody({ promoCode, samples }: { promoCode: string | null; samples: SampleCard[] }) {
  const basic = PACKAGE_PRICE_THB.basic
  const fmt = (n: number) => n.toLocaleString('th-TH')
  const free = !!promoCode

  const steps: Array<[string, string]> = [
    ['กรอกข้อมูลห้อง', 'ประเภท ย่าน ค่าเช่า รูป'],
    ['บันทึกฉบับร่างฟรี', 'ยังไม่ต้องจ่าย'],
    free ? [`ใช้โค้ด ${promoCode} แล้วเผยแพร่`, 'เดือนแรกฟรี ขึ้นเว็บทันทีหลังชำระ'] : ['ชำระแล้วเผยแพร่', 'ขึ้นเว็บทันทีหลังชำระ'],
  ]

  const faqs: Array<[string, string]> = [
    free
      ? ['ฟรีจริงไหม', `จริง ใส่โค้ด ${promoCode} ตอนชำระแพ็กเกจ Basic (1 เดือน) ยอดจะลดลง ฿${fmt(basic)} เหลือ ฿0 ใช้ได้ตามเงื่อนไขของโค้ด ถ้าเลือกจ่ายครั้งเดียว ครบ 1 เดือนประกาศจะปิดเอง ไม่มีการตัดเงินต่อ`]
      : ['ราคาเท่าไหร่', `เริ่มต้น ฿${fmt(basic)} ต่อประกาศ 1 เดือน ไม่มีค่าคอมมิชชัน`],
    ['ใช้เวลานานไหม', 'ประมาณ 10 นาที กรอกไม่ครบก็บันทึกเป็นฉบับร่างไว้ก่อนได้ฟรี ข้อมูลที่กรอกถูกบันทึกในเครื่องอัตโนมัติ กลับมากรอกต่อได้'],
    ['ใครจะติดต่อมา', 'ผู้เช่าโทรหรือแอด LINE ของคุณโดยตรงจากหน้าประกาศ ไม่ผ่านคนกลาง'],
    ['มีหลายห้องทำยังไง', '1 การชำระ = 1 ประกาศ อพาร์ทเมนท์ที่มีหลายแบบห้องในตึกเดียวกัน ใส่ทุกแบบในประกาศเดียวได้ ถ้าเป็นคนละตึกหรือคนละห้องคอนโด ให้สร้างประกาศแยก'],
    ['จ่ายยังไง', 'พร้อมเพย์ (สแกน QR) หรือบัตรเครดิต/เดบิต ผ่าน Stripe จ่ายครั้งเดียว หรือเลือกตัดบัตรอัตโนมัติก็ได้'],
  ]

  const tiers: Array<[string, string, string, number]> = [
    ['basic', 'Basic', `1 เดือน · รูปสูงสุด ${PACKAGE_IMAGE_LIMITS.basic} รูป`, PACKAGE_PRICE_THB.basic],
    ['standard', 'Standard', `3 เดือน · รูปสูงสุด ${PACKAGE_IMAGE_LIMITS.standard} รูป`, PACKAGE_PRICE_THB.standard],
    ['premium', 'Premium', `12 เดือน · รูป ${PACKAGE_IMAGE_LIMITS.premium} รูป + วิดีโอ`, PACKAGE_PRICE_THB.premium],
  ]

  const ctaLabel = free ? 'เริ่มลงประกาศ · เดือนแรกฟรี' : 'เริ่มลงประกาศ'

  return (
    <div className="fbl">
      <FbAttribution />
      <style>{`
        .fbl { background: #f7f6f2; color: #231f20; font-family: Prompt, sans-serif; padding-bottom: 96px; }
        .fbl a { -webkit-tap-highlight-color: transparent; }
        .fbl-wrap { max-width: 600px; margin: 0 auto; padding: 0 20px; }
        .fbl-hero { background: #02402e; color: #fff; }
        .fbl-hero .fbl-wrap { padding-top: 26px; padding-bottom: 24px; }
        .fbl-eyebrow { margin: 0 0 8px; font-size: 13px; font-weight: 500; color: #9fd9c8; }
        .fbl-h1 { margin: 0; font-size: 33px; line-height: 1.22; font-weight: 700; letter-spacing: -0.01em; }
        .fbl-h1 span { color: #f2b25c; }
        .fbl-sub { margin: 12px 0 0; font-size: 15px; line-height: 1.65; color: #dcebe5; }
        .fbl-sub strong { color: #fff; }
        .fbl-cta { display: flex; align-items: center; justify-content: center; height: 52px; border-radius: 10px; font-size: 17px; font-weight: 600; text-decoration: none; transition: transform .12s ease, background .15s ease; }
        .fbl-cta:active { transform: scale(.98); }
        .fbl-cta-light { margin-top: 18px; background: #fff; color: #02402e; }
        .fbl-cta-solid { background: #037a64; color: #fff; }
        .fbl-cta-solid:hover { background: #02402e; }
        .fbl-trust { margin: 10px 0 0; font-size: 12.5px; line-height: 1.6; color: #b9d6cc; text-align: center; }
        .fbl-steps { list-style: none; margin: 0; padding: 16px 0 4px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; counter-reset: s; }
        .fbl-steps li { background: #fff; border: 1px solid #e5e2da; border-radius: 10px; padding: 10px 10px 12px; }
        .fbl-n { display: inline-flex; width: 24px; height: 24px; border-radius: 12px; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #fff; }
        .fbl-steps b { display: block; margin-top: 6px; font-size: 13.5px; line-height: 1.35; font-weight: 600; color: #02402e; }
        .fbl-steps small { display: block; margin-top: 3px; font-size: 11.5px; line-height: 1.45; color: #6b6660; }
        .fbl-h2 { margin: 0 0 14px; font-size: 21px; font-weight: 600; color: #02402e; }
        .fbl-sec { padding-top: 30px; }
        .fbl-why { display: grid; gap: 10px; }
        .fbl-card { background: #fff; border: 1px solid #e5e2da; border-radius: 12px; padding: 15px 16px; }
        .fbl-card b { display: block; font-size: 15.5px; font-weight: 600; color: #02402e; }
        .fbl-card p { margin: 4px 0 0; font-size: 14px; line-height: 1.6; color: #6b6660; }
        .fbl-samples { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .fbl-sample { background: #fff; border: 1px solid #e5e2da; border-radius: 12px; overflow: hidden; pointer-events: none; }
        .fbl-sample img, .fbl-ph { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; background: #dfe7e2; }
        .fbl-sample div { padding: 9px 10px 11px; }
        .fbl-sample b { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 13.5px; line-height: 1.4; font-weight: 600; }
        .fbl-sample small { display: block; margin-top: 3px; font-size: 12px; color: #6b6660; }
        .fbl-sample em { display: block; margin-top: 5px; font-style: normal; font-size: 15px; font-weight: 600; color: #a65f08; }
        .fbl-faq { background: #fff; border: 1px solid #e5e2da; border-radius: 6px; overflow: hidden; }
        /* Same look as the site FAQ (components/faq/FAQAccordion): green question, +/− at the right, hairline dividers. */
        .fbl-faq details + details { border-top: 1px solid #ece9e2; }
        .fbl-faq summary { list-style: none; cursor: pointer; padding: 16px 20px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; font-size: 15.5px; font-weight: 500; line-height: 1.5; color: #02402e; }
        .fbl-faq summary::-webkit-details-marker { display: none; }
        .fbl-faq summary::after { content: '+'; font-size: 20px; line-height: 1.1; color: #6b6660; flex-shrink: 0; }
        .fbl-faq details[open] summary::after { content: '−'; }
        .fbl-faq details p { margin: 0; padding: 0 48px 18px 20px; font-size: 15px; line-height: 1.75; color: #231f20; animation: fblOpen .2s ease-out; }
        @keyframes fblOpen { from { opacity: 0; transform: translateY(-4px) } to { opacity: 1; transform: none } }
        .fbl-tiers { background: #fff; border: 1px solid #e5e2da; border-radius: 12px; }
        .fbl-tier { padding: 13px 16px; display: flex; justify-content: space-between; align-items: baseline; gap: 12px; border-bottom: 1px solid #ece9e2; }
        .fbl-tier:last-child { border-bottom: 0; }
        .fbl-tier b { font-size: 15px; font-weight: 600; }
        .fbl-tier small { display: block; margin-top: 2px; font-size: 12.5px; color: #6b6660; }
        .fbl-tier strong { display: block; text-align: right; font-size: 16px; font-weight: 600; color: #a65f08; }
        .fbl-tier i { display: block; text-align: right; margin-top: 2px; font-style: normal; font-size: 12px; color: #6b6660; }
        .fbl-tier i.fbl-free { color: #037a64; font-weight: 500; }
        .fbl-last { margin-top: 30px; padding: 20px 18px; background: #eaf4f0; border-radius: 12px; }
        .fbl-last b { display: block; font-size: 18px; font-weight: 600; color: #02402e; }
        .fbl-last p { margin: 6px 0 16px; font-size: 14px; line-height: 1.6; color: #4a4541; }
        .fbl-legal { margin: 24px 0 0; font-size: 12px; color: #6b6660; text-align: center; line-height: 2; }
        .fbl-legal a, .fbl-legal button { color: #6b6660; }
        .fbl-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 50; background: #fff; border-top: 1px solid #e5e2da; padding: 10px 16px calc(12px + env(safe-area-inset-bottom, 0px)); }
        .fbl-bar .fbl-cta { max-width: 560px; margin: 0 auto; height: 50px; font-size: 16px; }
        @media (min-width: 720px) { .fbl-h1 { font-size: 40px; } .fbl-hero .fbl-wrap { padding-top: 48px; padding-bottom: 40px; } }
        @media (prefers-reduced-motion: reduce) { .fbl-faq details p { animation: none; } .fbl-cta { transition: none; } }
      `}</style>

      <section className="fbl-hero">
        <div className="fbl-wrap">
          <p className="fbl-eyebrow">สำหรับเจ้าของทรัพย์</p>
          {free
            ? <h1 className="fbl-h1">ลงประกาศให้เช่า<br /><span>เดือนแรกฟรี</span></h1>
            : <h1 className="fbl-h1">ลงประกาศให้เช่า<br /><span>เริ่มต้น ฿{fmt(basic)}</span></h1>}
          <p className="fbl-sub">
            {free
              ? <>กรอกข้อมูลห้องได้เลย ใช้โค้ด <strong>{promoCode}</strong> ตอนชำระ แล้วประกาศขึ้นเว็บทันที ไม่มีค่าคอมมิชชัน</>
              : <>กรอกข้อมูลห้องได้เลย ชำระแล้วประกาศขึ้นเว็บทันที ไม่มีค่าคอมมิชชัน</>}
          </p>
          <a href={NEW} className="fbl-cta fbl-cta-light">เริ่มลงประกาศ</a>
          <p className="fbl-trust">
            {free
              ? <>เดือนแรกฟรี ({promoCode}) · หลังจากนั้นเริ่มต้น ฿{fmt(basic)} · เผยแพร่ทันทีหลังชำระ</>
              : <>เริ่มต้น ฿{fmt(basic)} · เผยแพร่ทันทีหลังชำระ · ไม่มีค่าคอมมิชชัน</>}
          </p>
        </div>
      </section>

      <div className="fbl-wrap">
        <ol className="fbl-steps" aria-label="3 ขั้นตอน">
          {steps.map(([title, body], i) => (
            <li key={title}>
              <span className="fbl-n" style={{ background: ['#02402e', '#037a64', '#a65f08'][i] }}>{i + 1}</span>
              <b>{title}</b>
              <small>{body}</small>
            </li>
          ))}
        </ol>

        <section className="fbl-sec">
          <h2 className="fbl-h2">ทำไมต้อง SpacesMate</h2>
          <div className="fbl-why">
            <div className="fbl-card"><b>ผู้เช่ากำลังค้นหาอยู่ตอนนี้</b><p>ผู้เช่าค้นหาห้องตามสถานี BTS/MRT มหาวิทยาลัย และย่านในกรุงเทพฯ ทุกวัน</p></div>
            <div className="fbl-card"><b>ไม่มีค่าคอมมิชชัน · Fair Rotation</b><p>ทุกประกาศได้ขึ้นอันดับต้นสลับกันเท่า ๆ กัน ไม่มีการจ่ายเงินเพื่อดันอันดับ</p></div>
            <div className="fbl-card"><b>ผู้เช่าติดต่อคุณโดยตรง</b><p>โทรหรือแอด LINE ของคุณได้ทันทีจากหน้าประกาศ</p></div>
          </div>
        </section>

        <section className="fbl-sec">
          <h2 className="fbl-h2" style={{ marginBottom: 4 }}>ประกาศของคุณจะแสดงแบบนี้</h2>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6b6660' }}>ตัวอย่างจากประกาศบน SpacesMate</p>
          <div className="fbl-samples" aria-hidden="true">
            {(samples.length ? samples : [null, null]).map((c, i) => (
              <div className="fbl-sample" key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {c ? <img src={c.image} alt="" loading="lazy" decoding="async" /> : <span className="fbl-ph" />}
                <div>
                  <b>{c?.title ?? 'ชื่อประกาศของคุณ'}</b>
                  <small>{c?.meta ?? 'ประเภท · ย่าน'}</small>
                  <em>{c ? `฿${fmt(c.price)}` : 'ค่าเช่า'} <small style={{ display: 'inline', fontWeight: 400 }}>/เดือน</small></em>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="fbl-sec">
          <h2 className="fbl-h2">คำถามที่พบบ่อย</h2>
          <div className="fbl-faq">
            {faqs.map(([q, a], i) => (
              <details key={q} open={i === 0}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="fbl-sec">
          <h2 className="fbl-h2" style={{ marginBottom: 4 }}>ราคาแพ็กเกจ</h2>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6b6660' }}>เลือกตอนชำระ · 1 การชำระ = 1 ประกาศ</p>
          <div className="fbl-tiers">
            {tiers.map(([id, name, note, price]) => (
              <div className="fbl-tier" key={id}>
                <div><b>{name}</b><small>{note}</small></div>
                <div>
                  <strong>฿{fmt(price)}</strong>
                  {id === 'basic'
                    ? (free ? <i className="fbl-free">ใช้ {promoCode} = ฿0</i> : <i>ต่อเดือน</i>)
                    : <i>ตกเดือนละ ฿{fmt(pricePerMonth(id))}</i>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="fbl-last">
          <b>ลองกรอกดูก่อน ยังไม่ต้องจ่าย</b>
          <p>ข้อมูลที่กรอกถูกบันทึกในเครื่องไว้ให้ สมัครสมาชิกตอนกดบันทึกเท่านั้น</p>
          <a href={NEW} className="fbl-cta fbl-cta-solid">เริ่มลงประกาศ</a>
        </div>

        <p className="fbl-legal">
          <a href="/terms">ข้อกำหนด</a> · <a href="/privacy">ความเป็นส่วนตัว</a> · <CookieSettingsLink /> · LINE @spacesmate
          <br />© บริษัท เสปซเวิร์คส จำกัด
        </p>
      </div>

      <div className="fbl-bar">
        <a href={NEW} className="fbl-cta fbl-cta-solid">{ctaLabel}</a>
      </div>
    </div>
  )
}
