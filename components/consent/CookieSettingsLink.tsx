'use client'

import { resetConsent } from '@/lib/consent'

/**
 * "ตั้งค่าคุกกี้" — the way back to the consent banner.
 *
 * WHY THIS EXISTS
 *   The banner only renders when no decision is stored. Once someone accepted or
 *   rejected, it never appeared again — and nothing else called resetConsent().
 *   A visitor who changed their mind had no route back short of clearing site
 *   data by hand.
 *
 *   Section 19 paragraph 5 of the PDPA requires withdrawing consent to be as
 *   easy as giving it. Clicking "Accept" took one click; undoing it took
 *   developer tools. That is not the same thing.
 *
 *   Clearing the stored decision makes the banner reappear, which is both the
 *   withdrawal and the opportunity to choose again. The Analytics component
 *   listens for the same event and unloads tags immediately — withdrawal that
 *   only takes effect on the next page load is not withdrawal.
 */
export default function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => resetConsent()}
      className={className}
      // A button, not a link: it performs an action rather than navigating.
      // Screen readers should not announce it as a destination.
    >
      ตั้งค่าคุกกี้
    </button>
  )
}
