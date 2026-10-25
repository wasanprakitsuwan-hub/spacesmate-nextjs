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
  source?: string | null
}

const SLOT_COLUMNS = 'id, user_id, package_type, status, expires_at, property_id, stripe_subscription_id, source'

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
    .select(SLOT_COLUMNS)
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
  // Only an ACTIVE slot counts as already holding this listing. Filtering on
  // status also keeps this to one row: a listing that has lapsed and been
  // republished several times leaves an expired slot behind each time, and an
  // unfiltered .maybeSingle() would error on the second one.
  const { data: existing } = await supabase
    .from('listing_slots')
    .select(SLOT_COLUMNS)
    .eq('property_id', propertyId)
    .eq('status', 'active')
    .maybeSingle()
  if (existing && isLive(existing as Slot)) return existing as Slot

  await ensureWelcomeSlot(supabase, userId)
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
  const claimed = (data as Slot) ?? null

  // The welcome slot's 30 days start on first publish, not on sign-up: an
  // owner who registers and takes a week to write the listing keeps the full
  // term. After that it behaves like any paid slot — unpublishing keeps the
  // remaining days, it does not restart them.
  if (claimed && claimed.source === 'welcome' && claimed.expires_at === null) {
    const expires = new Date()
    expires.setDate(expires.getDate() + (PACKAGE_DAYS.basic ?? 30))
    const { data: dated } = await supabase
      .from('listing_slots')
      .update({ expires_at: expires.toISOString(), updated_at: new Date().toISOString() })
      .eq('id', claimed.id)
      .is('expires_at', null)
      .select(SLOT_COLUMNS)
      .maybeSingle()
    return (dated as Slot) ?? { ...claimed, expires_at: expires.toISOString() }
  }
  return claimed
}

/**
 * Accounts created on or after this date get one free Basic slot. Older
 * accounts do not — the Founder's decision was new accounts only.
 */
export const WELCOME_SLOT_SINCE = '2026-10-24T00:00:00+07:00'

/**
 * Off since 25 Oct 2026 (Founder: "switch to sm299 code for now"). The first
 * month free is now the typed promo code at /checkout (lib/promo), and both at
 * once would give a new owner two free months. Slots already granted are kept.
 * Set back to true to restore the automatic free slot.
 */
export const WELCOME_SLOT_ENABLED = false

/**
 * Give a new owner their one free Basic slot, if they have not had it yet.
 *
 * Granted lazily — the first time their slots are counted or a listing is
 * published — rather than in the sign-up trigger, so email and Google sign-ups
 * are covered by the same code and nothing in auth has to change.
 *
 * The slot is created undated (expires_at NULL) and dated on first publish;
 * see claimSlot. Once used, expired or cancelled it is never granted again:
 * the check is "ever had one", not "has one now". The partial unique index in
 * the 20261024b migration makes that hold under concurrent requests too.
 */
export async function ensureWelcomeSlot(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  if (!WELCOME_SLOT_ENABLED) return
  const { data: had } = await supabase
    .from('listing_slots')
    .select('id')
    .eq('user_id', userId)
    .eq('source', 'welcome')
    .limit(1)
  if (had?.length) return

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('created_at, role')
    .eq('id', userId)
    .maybeSingle()
  if (!profile || profile.role !== 'landlord') return
  if (new Date(profile.created_at as string) < new Date(WELCOME_SLOT_SINCE)) return

  const { error } = await supabase.from('listing_slots').insert({
    user_id: userId,
    package_type: 'basic',
    status: 'active',
    expires_at: null,
    source: 'welcome',
  })
  // 23505: a concurrent request granted it first. That is the outcome we wanted.
  if (error && error.code !== '23505') console.error('[slots] ensureWelcomeSlot failed —', error.message)
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

/**
 * Add a paid term to the slot a listing already holds — the dashboard's Extend.
 *
 * The purchase still inserts its own slot row first (grantSlots), because that
 * row, keyed on the checkout session, is what the webhook's duplicate guard
 * looks for. This then moves the term onto the listing's slot and retires the
 * new row, so a retried webhook neither extends twice nor leaves a stray free
 * slot behind.
 *
 * Extends from the later of now and the current expiry, so extending early
 * adds to the term rather than resetting it. Returns the extended slot, or
 * null when the listing holds no live slot — the caller then publishes it into
 * the new slot instead, which is what a lapsed listing needs.
 */
export async function extendListingSlot(
  supabase: SupabaseClient,
  propertyId: string,
  days: number,
  newSlotSessionId: string,
): Promise<Slot | null> {
  const { data: held } = await supabase
    .from('listing_slots')
    .select(SLOT_COLUMNS)
    .eq('property_id', propertyId)
    .eq('status', 'active')
    .maybeSingle()
  if (!held || !isLive(held as Slot) || held.expires_at === null) return null

  const from = new Date(held.expires_at) > new Date() ? new Date(held.expires_at) : new Date()
  from.setDate(from.getDate() + days)

  const { data: extended, error } = await supabase
    .from('listing_slots')
    .update({ expires_at: from.toISOString(), updated_at: new Date().toISOString() })
    .eq('id', held.id)
    .select(SLOT_COLUMNS)
    .maybeSingle()
  if (error || !extended) {
    console.error('[slots] extendListingSlot failed —', error?.message)
    return null
  }

  // The purchase's own row has done its job as the idempotency record.
  await supabase
    .from('listing_slots')
    .update({ status: 'expired', expires_at: new Date().toISOString(), source: 'extend', updated_at: new Date().toISOString() })
    .eq('stripe_checkout_session_id', newSlotSessionId)
    .is('property_id', null)

  return extended as Slot
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
    /**
     * The checkout session that paid for these slots.
     *
     * Always pass it. For subscriptions it is useful provenance; for one-time
     * payments it is the ONLY thing the webhook's duplicate guard can key on,
     * because there is no subscription id.
     */
    stripeCheckoutSessionId?: string | null
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
    stripe_checkout_session_id: opts.stripeCheckoutSessionId ?? null,
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
