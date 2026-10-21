// Rendered when an English route calls notFound() — /en/area/[slug].
// Markup lives in NotFoundBody so the three 404 entry points cannot drift.
import NotFoundBody from '@/components/layout/NotFoundBody'

export default function NotFound() {
  return <NotFoundBody />
}
