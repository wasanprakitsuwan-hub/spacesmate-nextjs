/**
 * Listing packages — shared by the admin screen and the listing form.
 *
 * Previously defined only inside app/dashboard/listings/page.tsx, which is one of
 * the reasons that screen could not use the shared form component.
 */

export type AdminPackage = {
  id: string
  label: string
  /** 0 means never expires — used by the admin package only. */
  days: number
}

export const ADMIN_PACKAGES: AdminPackage[] = [
  { id: 'admin',    label: 'Admin — ไม่มีวันหมดอายุ',    days: 0   },
  { id: 'basic',    label: 'Basic — 1 เดือน (฿299)',      days: 30  },
  { id: 'standard', label: 'Standard — 3 เดือน (฿699)',   days: 90  },
  { id: 'premium',  label: 'Premium — 12 เดือน (฿2,499)', days: 365 },
]

/**
 * Expiry for a NEW listing, or for one whose package has just changed.
 *
 * Do not call this on every save. It returns now + package days, so running it
 * on an unchanged listing silently pushes the expiry out by a full term — which
 * is exactly the bug fixed on 26 Jul 2026.
 */
export function computeExpiry(packageId: string): string | null {
  const pkg = ADMIN_PACKAGES.find(p => p.id === packageId)
  if (!pkg || pkg.days === 0) return null
  const d = new Date()
  d.setDate(d.getDate() + pkg.days)
  return d.toISOString()
}

export const PACKAGE_LABEL: Record<string, string> = Object.fromEntries(
  ADMIN_PACKAGES.map(p => [p.id, p.label]),
)

/**
 * List price in THB per slot. Used only to give GA4 a purchase value — the
 * amount actually charged is whatever Stripe says, after any promo code.
 */
export const PACKAGE_PRICE_THB: Record<string, number> = {
  basic:    299,
  standard: 699,
  premium:  2499,
  admin:    0,
}
