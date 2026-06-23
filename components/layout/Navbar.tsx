'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [ownerOpen, setOwnerOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-spacemate-borderLight sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo.png" alt="SpacesMate" width={160} height={48} className="h-10 w-auto" priority />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/search" className="text-spacemate-textCharcoal hover:text-spacemate-brandDark font-medium text-sm transition-colors">
              ค้นหาที่พัก
            </Link>

            {/* สำหรับเจ้าของ dropdown */}
            <div className="relative" onMouseEnter={() => setOwnerOpen(true)} onMouseLeave={() => setOwnerOpen(false)}>
              <button className="flex items-center gap-1 text-spacemate-textCharcoal hover:text-spacemate-brandDark font-medium text-sm transition-colors">
                สำหรับเจ้าของ
                <svg className="w-3.5 h-3.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {ownerOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-premium-hover border border-spacemate-borderLight py-2 z-50">
                  <Link href="/submit" className="block px-4 py-2.5 text-sm text-spacemate-textCharcoal hover:bg-spacemate-bgLight hover:text-spacemate-brandDark transition-colors">
                    ลงประกาศที่พัก
                  </Link>
                  <Link href="/services" className="block px-4 py-2.5 text-sm text-spacemate-textCharcoal hover:bg-spacemate-bgLight hover:text-spacemate-brandDark transition-colors">
                    บริการจัดการอสังหา
                  </Link>
                  <Link href="/pricing" className="block px-4 py-2.5 text-sm text-spacemate-textCharcoal hover:bg-spacemate-bgLight hover:text-spacemate-brandDark transition-colors">
                    แพ็กเกจและราคา
                  </Link>
                </div>
              )}
            </div>

            <Link href="/blog" className="text-spacemate-textCharcoal hover:text-spacemate-brandDark font-medium text-sm transition-colors">
              บทความ
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="text-spacemate-textCharcoal hover:text-spacemate-brandDark font-medium text-sm transition-colors">
              แดชบอร์ด
            </Link>
            <Link href="/login" className="w-9 h-9 rounded-full border border-spacemate-borderLight flex items-center justify-center text-spacemate-textCharcoal hover:border-spacemate-brandTeal hover:text-spacemate-brandTeal transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </Link>
            <Link href="/submit" className="bg-spacemate-brandGold hover:brightness-105 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
              ลงประกาศฟรี
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-spacemate-brandDark p-2 rounded-lg hover:bg-spacemate-bgLight transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-0.5 bg-spacemate-brandDark mb-1.5" />
            <div className="w-5 h-0.5 bg-spacemate-brandDark mb-1.5" />
            <div className="w-5 h-0.5 bg-spacemate-brandDark" />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-spacemate-borderLight space-y-1">
            {[
              { href: '/search',   label: 'ค้นหาที่พัก' },
              { href: '/submit',   label: 'ลงประกาศที่พัก' },
              { href: '/services', label: 'บริการจัดการอสังหา' },
              { href: '/pricing',  label: 'แพ็กเกจและราคา' },
              { href: '/blog',     label: 'บทความ' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-spacemate-textCharcoal hover:text-spacemate-brandDark hover:bg-spacemate-bgLight rounded-lg transition-colors font-medium text-sm"
              >
                {item.label}
              </Link>
            ))}
            <div className="px-4 pt-2">
              <Link href="/submit" className="bg-spacemate-brandGold text-white font-semibold text-sm px-5 py-3 rounded-lg block text-center">
                ลงประกาศฟรี
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
