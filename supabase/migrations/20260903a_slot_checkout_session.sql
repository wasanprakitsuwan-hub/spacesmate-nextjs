-- ═══════════════════════════════════════════════════════════════════════════
-- listing_slots.stripe_checkout_session_id
--
-- WEBSITE database (spacesmate.com — jrykbzdzcplhrhauvlvk).
--
-- Why this exists
-- ───────────────
-- The Stripe webhook's duplicate-grant guard reads:
--
--     if (subscriptionId) { ...look for a slot with this subscription id... }
--
-- One-time payments have no subscription, so `subscriptionId` is null and the
-- guard is skipped entirely. That was harmless while every purchase was a card
-- subscription. It stops being harmless the moment PromptPay is offered, which
-- is one-time only.
--
-- It is not a theoretical risk. The slot route deliberately returns 500 on a
-- grant shortfall so that Stripe retries — and Stripe also redelivers on
-- timeouts and cold-start kills. A PromptPay purchase that fails once and
-- succeeds on retry would grant the slots twice, and slots are money.
--
-- Every checkout session has an id, subscription or not. Recording it gives the
-- guard something to key on in both cases, and makes every granted slot
-- traceable back to the checkout that paid for it.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.listing_slots
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

-- The guard reads this on every slot_purchase webhook delivery, so it needs to
-- be indexed. Not UNIQUE: one checkout legitimately grants many slots when the
-- buyer sets quantity above one.
CREATE INDEX IF NOT EXISTS listing_slots_checkout_session_idx
  ON public.listing_slots (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

COMMENT ON COLUMN public.listing_slots.stripe_checkout_session_id IS
  'Checkout session that paid for this slot. Used as the idempotency key when '
  'there is no subscription id — i.e. one-time payments such as PromptPay. '
  'Backfilled as NULL for slots granted before 3 Sep 2026.';
