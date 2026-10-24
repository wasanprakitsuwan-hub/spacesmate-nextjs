import { redirect } from 'next/navigation'

/** Property names are now the first tab of สถานที่ค้นหา. */
export default function PropertyNamesMoved() {
  redirect('/dashboard/places?tab=names')
}
