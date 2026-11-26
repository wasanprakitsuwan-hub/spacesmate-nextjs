/**
 * Tracking IDs and the switch that decides whether a page tracks at all.
 *
 * WHERE THE TAGS RUN
 *   Only on spacesmate.com and www.spacesmate.com. Vercel preview URLs
 *   (spacesmate-nextjs-*.vercel.app) used to send hits into the live GA4
 *   property, which polluted the numbers with our own testing.
 *
 *   The check is on the hostname at runtime, not on NEXT_PUBLIC_VERCEL_ENV,
 *   because that variable is only exposed when Vercel's "expose system
 *   environment variables" setting is on. A hostname check cannot silently
 *   switch production tracking off.
 *
 *   NEXT_PUBLIC_TRACKING_DEBUG=1 on a preview deployment turns tracking on
 *   there too, for the acceptance tests. Use it for that preview only.
 */

export const GA_ID = 'G-QBQV320QXT'
export const META_PIXEL_ID = '26085822227748725'

export const TRACKING_HOSTS = ['spacesmate.com', 'www.spacesmate.com']
export const TRACKING_DEBUG = process.env.NEXT_PUBLIC_TRACKING_DEBUG === '1'

declare global {
  interface Window {
    /** Set by the consent-default script: true when this page may track. */
    __smTrack?: boolean
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean }
    _fbq?: unknown
  }
}
