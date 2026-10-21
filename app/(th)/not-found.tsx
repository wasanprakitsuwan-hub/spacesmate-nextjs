// Rendered when a Thai route calls notFound() — /area, /blog/[slug], /building.
// Markup lives in NotFoundBody so the three 404 entry points cannot drift.
import NotFoundBody from '@/components/layout/NotFoundBody'

export default function NotFound() {
  return <NotFoundBody />
}
