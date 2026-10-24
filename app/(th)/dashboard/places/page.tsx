import { Suspense } from 'react'
import SearchPlacesAdmin from '@/components/dashboard/SearchPlacesAdmin'

export default function PlacesPage() {
  return (
    <Suspense fallback={null}>
      <SearchPlacesAdmin />
    </Suspense>
  )
}
