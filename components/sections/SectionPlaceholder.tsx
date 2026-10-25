/**
 * What a home page section shows while its data is still on the way.
 *
 * The home page is cached, so most visitors never see this: the cached HTML
 * already holds every section. It matters on the render that refills the
 * cache, where the hero and search bar can now go out first instead of the
 * whole page waiting on the slowest query.
 */
export default function SectionPlaceholder() {
  return (
    <section aria-hidden="true" style={{ maxWidth: 1240, margin: '0 auto', padding: '56px 24px' }}>
      <div style={{ width: 240, height: 26, borderRadius: 6, background: '#ece9e2', marginBottom: 28 }} />
      <div className="sm-ph-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ height: 300, borderRadius: 6, background: '#ece9e2' }} />
        ))}
      </div>
      <style>{`@media (max-width: 600px) { .sm-ph-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  )
}
