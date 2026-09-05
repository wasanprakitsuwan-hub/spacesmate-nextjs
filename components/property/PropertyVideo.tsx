/**
 * Property video — the Premium entitlement, finally rendered.
 *
 * The uploader has gated video to Premium since July and the pricing page sells
 * it, but nothing on the public property page ever displayed it: `video_url`
 * appeared only in dashboard code. Premium buyers were uploading videos that no
 * tenant could see. This is the missing output.
 *
 * Whether a video reaches this component at all is decided upstream, by
 * showsVideo() on the property page. This component only renders.
 */

type Props = {
  /** Already gated by package upstream — empty string means render nothing. */
  url: string
  title?: string
}

/**
 * Turn a YouTube or Vimeo link into its embed form.
 *
 * Owners paste whatever the address bar gave them — watch links, youtu.be
 * shorts, links with a timestamp — and an <iframe> pointed at a watch URL
 * silently shows nothing rather than failing loudly. Returning null for
 * anything unrecognised lets the caller fall back to a real <video> element.
 */
function toEmbedUrl(raw: string): string | null {
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return null
  }

  const host = u.hostname.replace(/^www\./, '')

  if (host === 'youtu.be') {
    const id = u.pathname.slice(1)
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
  }

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    // /watch?v=ID  ·  /embed/ID  ·  /shorts/ID  ·  /live/ID
    const v = u.searchParams.get('v')
    if (v) return `https://www.youtube-nocookie.com/embed/${v}`
    const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)
    if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`
    return null
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = u.pathname.match(/(\d+)/)
    return m ? `https://player.vimeo.com/video/${m[1]}` : null
  }

  return null
}

export default function PropertyVideo({ url, title }: Props) {
  if (!url) return null

  const embed = toEmbedUrl(url)

  return (
    <section style={{ marginTop: 28 }} aria-label="วิดีโอทรัพย์สิน">
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#02402e',
          margin: '0 0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
        }}
      >
        <span
          className="msym"
          style={{ fontSize: 20, fontVariationSettings: "'wght' 300, 'FILL' 0" }}
        >
          videocam
        </span>
        วิดีโอ
      </h2>

      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 14,
          overflow: 'hidden',
          background: '#02402e',
          border: '1px solid #e7eceb',
        }}
      >
        {embed ? (
          <iframe
            src={embed}
            title={title ? `วิดีโอ — ${title}` : 'วิดีโอทรัพย์สิน'}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        ) : (
          // Not a recognised host — treat it as a direct file. Uploaded videos
          // land in Supabase storage and are exactly this case.
          <video
            src={url}
            controls
            preload="metadata"
            playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#02402e' }}
          />
        )}
      </div>
    </section>
  )
}
