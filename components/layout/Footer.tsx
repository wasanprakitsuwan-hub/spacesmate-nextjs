import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-spacemate-brandDark text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">

        {/* Main columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Image src="/logo-white.png" alt="SpacesMate" width={148} height={46} style={{ height: 46, width: 'auto' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Smarter spaces. Better returns.<br />
              แพลตฟอร์มเช่าอสังหาฯ ที่โปร่งใสและเป็นธรรม
            </p>
          </div>

          {/* สำรวจ */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white">สำรวจ</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'ค้นหาที่พัก', href: '/search' },
                { label: 'ทำเลยอดนิยม', href: '/search' },
                { label: 'บทความ', href: '/blog' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white/60 hover:text-white text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* สำหรับเจ้าของ */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white">สำหรับเจ้าของ</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'ลงประกาศปล่อยเช่า', href: '/submit' },
                { label: 'รับฝากบริหาร', href: '/manage' },
                { label: 'แพ็กเกจราคา', href: '/pricing' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white/60 hover:text-white text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* บริษัท & ช่วยเหลือ */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white">บริษัท & ช่วยเหลือ</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'เกี่ยวกับเรา', href: '/about' },
                { label: 'ติดต่อเรา', href: '/contact' },
                { label: 'คำถามที่พบบ่อย', href: '/faq' },
                { label: 'นโยบายความเป็นส่วนตัว', href: '/privacy' },
                { label: 'เงื่อนไขการใช้งาน', href: '/terms' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white/60 hover:text-white text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider + bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            © 2026 Space Works Co., Ltd. สงวนลิขสิทธิ์
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {/* Facebook */}
            <a href="https://www.facebook.com/spacesmateTH" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors" aria-label="Facebook">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a href="https://www.instagram.com/spacesmate/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            {/* TikTok */}
            <a href="https://www.tiktok.com/@spacesmate" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors" aria-label="TikTok">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </a>
            {/* LINE */}
            <a href="https://line.me/R/ti/p/@spacesmate" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors" aria-label="LINE">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
