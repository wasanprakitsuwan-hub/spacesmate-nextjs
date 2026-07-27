import type { SupabaseClient } from '@supabase/supabase-js'
import { PACKAGE_DAYS } from '@/lib/stripe'

/**
 * Listing slots — the right to display one listing publicly, for a period.
 *
 * A LISTING is a listing: the owner writes it once and keeps it, forever, in
 * whatever state. A SLOT is what makes one of them visible. They are bought,
 * counted and expire separately, and this module is the only place that moves a
 * listing between the two states.
 *
 * Every function here takes a service-role client. Slots are money; nothing
 * about them is writable through RLS.
 */

export type Slot = {
  id: string
  user_id: string
  package_type: string
  status: string
  expires_at: string | null
  property_id: string | null
  stripe_subscription_id: string | null
}

/** `expires_at IS NULL` means never expires — see the migration for why this
 *  cannot be written as a plain `.gt()` filter. */
function isLive(slot: { status: string; expires_at: string | null }): boolean {
  if (slot.status !== 'active') return false
  return slot.expires_at === null || new Date(slot.expires_at) > new Date()
}

export async function listSlots(
  supabase: SupabaseClient,
  userId: string,
): Promise<Slot[]> {
  const { data, error } = await supabase
    .from('listing_slots')
    .select('id, user_id, package_type, status, expires_at, property_id, stripe_subscription_id')
    .eq('user_id', userId)
    .order('expires_at', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('[slots] listSlots failed —', error.message)
    return []
  }
  return (data ?? []) as Slot[]
}

/**
 * A free slot is live and unoccupied.
 *
 * Returns the one expiring soonest, so the term closest to being wasted is the
 * one that gets used. A never-expiring admin slot is therefore only handed out
 * when nothing paid-for is available.
 */
export async function findFreeSlot(
  supabase: SupabaseClient,
  userId: string,
): Promise<Slot | null> {
  const live = (await listSlots(supabase, userId)).filter(s => isLive(s) && !s.property_id)
  if (live.length === 0) return null

  const dated = live.filter(s => s.expires_at !== null)
  return (dated[0] ?? live[0]) as Slot
}

export async function countFreeSlots(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  return (await listSlots(supabase, userId)).filter(s => isLive(s) && !s.property_id).length
}

/**
 * Put a listing into a free slot.
 *
 * The unique index on property_id is what actually prevents a listing occupying
 * two slots — two concurrent publishes cannot both win. We check `is('property_id', null)`
 * in the update so a slot claimed a millisecond earlier by another request
 * matches zero rows rather than being stolen.
 *
 * Returns the slot on success, null if nothing was free.
 */
export async function claimSlot(
  supabase: SupabaseClient,
  userId: string,
  propertyId: string,
): Promise<Slot | null> {
  // Already in a slot? Publishing twice should be harmless, not double-charged.
  const { data: existing } = await supabase
    .from('listing_slots')
    .select('id, user_id, package_type, status, expires_at, property_id, stripe_subscription_id')
    .eq('property_id', propertyId)
    .maybeSingle()
  if (existing && isLive(existing as Slot)) return existing as Slot

  const free = await findFreeSlot(supabase, userId)
  if (!free) return null

  const { data, error } = await supabase
    .from('listing_slots')
    .update({ property_id: propertyId, updated_at: new Date().toISOString() })
    .eq('id', free.id)
    .is('property_id', null)          // lost the race → 0 rows, not a theft
    .select()
    .maybeSingle()

  if (error) {
    console.error('[slots] claimSlot failed —', error.message)
    return null
  }
  return (data as Slot) ?? null
}

/**
 * Take a listing out of its slot, leaving the slot free with its term intact.
 *
 * This is the Founder's decision made concrete: an owner whose unit rents out
 * takes the listing down and puts another one up on the days they already paid
 * for. Forfeiting the term would punish exactly the moment the product worked.
 */
export async function releaseSlot(
  supabase: SupabaseClient,
  propertyId: string,
): Promise<void> {
  const { error } = await supabase
    .from('listing_slots')
    .update({ property_id: null, updated_at: new Date().toISOString() })
    .eq('property_id', propertyId)

  if (error) console.error('[slots] releaseSlot failed —', error.message)
}

/** Create slots for a completed purchase. Returns how many were made. */
export async function grantSlots(
  supabase: SupabaseClient,
  opts: {
    userId: string
    packageType: string
    quantity: number
    stripeSubscriptionId?: string | null
    stripeCustomerId?: string | null
    source?: string
  },
): Promise<number> {
  const days = PACKAGE_DAYS[opts.packageType] ?? 30
  const expires = new Date()
  expires.setDate(expires.getDate() + days)

  const qty = Math.max(1, Math.min(opts.quantity || 1, 100))  // sanity bound
  const rows = Array.from({ length: qty }, () => ({
    user_id:                opts.userId,
    package_type:           opts.packageType,
    status:                 'active',
    expires_at:             expires.toISOString(),
    stripe_subscription_id: opts.stripeSubscriptionId ?? null,
    stripe_customer_id:     opts.stripeCustomerId ?? null,
    source:                 opts.source ?? 'purchase',
  }))

  const { error } = await supabase.from('listing_slots').insert(rows)
  if (error) {
    console.error('[slots] grantSlots failed —', error.message)
    return 0
  }
  return qty
}

/**
 * Push out every slot on a subscription — the monthly renewal.
 *
 * Extends from the later of now and the current expiry, so paying early adds to
 * the term instead of resetting it.
 */
export async function extendSlotsForSubscription(
  supabase: SupabaseClient,
  subscriptionId: string,
  packageType: string,
): Promise<number> {
  const { data: slots } = await supabase
    .from('listing_slots')
    .select('id, expires_at')
    .eq('stripe_subscription_id', subscriptionId)
    .neq('status', 'cancelled')

  if (!slots?.length) return 0

  const days = PACKAGE_DAYS[packageType] ?? 30
  let updated = 0

  for (const slot of slots) {
    const from = slot.expires_at && new Date(slot.expires_at) > new Date()
      ? new Date(slot.expires_at)
      : new Date()
    from.setDate(from.getDate() + days)

    const { error } = await supabase
      .from('listing_slots')
      .update({ status: 'active', expires_at: from.toISOString(), updated_at: new Date().toISOString() })
      .eq('id', slot.id)
    if (!error) updated++
  }
  return updated
}

/**
 * Mirror a slot's expiry onto the listing it holds.
 *
 * properties.expires_at is denormalised: the dashboard, the admin screen and the
 * expiry cron all read it. Keeping it in step means none of them had to change
 * when slots arrived. The slot remains the source of truth.
 */
export async function syncListingFromSlot(
  supabase: SupabaseClient,
  slot: Slot,
): Promise<void> {
  if (!slot.property_id) return
  const { error } = await supabase
    .from('properties')
    .update({
      listing_status: 'active',
      package_type:   slot.package_type,
      expires_at:     slot.expires_at,
      updated_at:     new Date().toISOString(),
    })
    .eq('id', slot.property_id)

  if (error) console.error('[slots] syncListingFromSlot failed —', error.message)
}
