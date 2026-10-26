import { createServerClient } from '@/lib/supabase'
import { DEFAULT_PROMO, normalisePromo, type CheckoutPromo } from '@/lib/promo'

/**
 * The checkout promo, read on the server for pages that advertise it
 * (/list-your-property). Kept out of lib/promo so the client checkout bundle
 * does not pull in the Supabase server client.
 *
 * Any failure reads as the default, which is disabled: a page that cannot
 * confirm the code is live should not advertise it.
 */
export async function getCheckoutPromo(): Promise<CheckoutPromo> {
  try {
    const { data, error } = await createServerClient()
      .from('site_settings')
      .select('value')
      .eq('key', 'checkout_promo')
      .maybeSingle()
    if (error || !data) return DEFAULT_PROMO
    return normalisePromo(data.value)
  } catch {
    return DEFAULT_PROMO
  }
}
