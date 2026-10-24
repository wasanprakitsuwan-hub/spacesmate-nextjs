import { redirect } from 'next/navigation'

/** The SEO Tracker now lives inside สถานที่ค้นหา: pages sit beside the place they are about. */
export default function SeoTrackerMoved() {
  redirect('/dashboard/places?tab=seo')
}
