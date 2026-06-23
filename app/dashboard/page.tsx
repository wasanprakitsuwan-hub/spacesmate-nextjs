import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'แดชบอร์ด | SpacesMate',
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-spacemate-bgLight flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-white mx-auto mb-6"
          style={{ background: 'linear-gradient(140deg, #06a487, #02402e)' }}
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-spacemate-brandDark mb-3 tracking-tight">แดชบอร์ด</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          ระบบแดชบอร์ดสำหรับเจ้าของที่พักกำลังอยู่ระหว่างพัฒนา คุณจะสามารถจัดการประกาศ ดูสถิติการเข้าชม และติดตามผู้สนใจได้จากที่นี่
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/submit" className="btn-primary">
            ลงประกาศทรัพย์สิน →
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-xl border border-spacemate-brandDark text-spacemate-brandDark text-sm font-semibold hover:bg-spacemate-brandDark hover:text-white transition-all"
          >
            ติดต่อทีมงาน
          </Link>
        </div>

        <p className="text-xs text-gray-300 mt-8">
          <Link href="/" className="hover:underline text-gray-400">← กลับหน้าหลัก</Link>
        </p>
      </div>
    </div>
  )
}
