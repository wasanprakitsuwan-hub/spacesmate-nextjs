-- ─────────────────────────────────────────────────────────────────────────────
-- Listing slots
--
-- WHY
--   A package is an entitlement, not a purchase of a particular listing. Today
--   a "slot" is inferred: checkout writes a submissions row, the webhook builds
--   a property from it, and the subscription is bound to that listing forever.
--   So a payment could never exist on its own, and /pricing had nothing to sell
--   to someone who had not yet written a listing.
--
--   The model the business actually has:
--     A LISTING is a listing — an object the owner writes and keeps, always.
--     A SLOT is the time-boxed right to display one listing publicly.
--   They are bought, expire, and are counted separately.
--
--   Consequences that fall out of the split:
--     · buy a package without touching the listing form
--     · buy several at once (quantity)
--     · take a listing down when the unit rents out, put another one up in the
--       same slot, and keep the remaining days
--
-- SOURCE OF TRUTH
--   The slot owns the expiry. properties.expires_at is kept as a MIRROR of the
--   occupying slot so existing reads (dashboard, admin, the expiry cron) keep
--   working unchanged. When the two disagree, the slot is right.
--
-- SAFE TO RE-RUN.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.listing_slots (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  package_type           TEXT NOT NULL DEFAULT 'basic',

  -- 'active'    — usable now (subject to expires_at)
  -- 'expired'   — term ran out
  -- 'cancelled' — subscription cancelled; kept for history, never reusable
  status                 TEXT NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'expired', 'cancelled')),

  -- NULL means never expires. Used by admin-granted slots.
  -- Note for every query written against this column: in Postgres
  -- `NULL > now()` is NULL, not true, so a plain `expires_at > now()` filter
  -- silently drops non-expiring slots. Always write:
  --   (expires_at IS NULL OR expires_at > now())
  expires_at             TIMESTAMPTZ,

  -- Which listing currently occupies this slot. NULL = free.
  -- ON DELETE SET NULL is the whole point of the "term continues" decision:
  -- deleting a listing frees the slot with its remaining days intact.
  property_id            UUID REFERENCES public.properties(id) ON DELETE SET NULL,

  stripe_subscription_id TEXT,
  stripe_customer_id     TEXT,

  -- 'purchase' | 'backfill' | 'admin'
  source                 TEXT NOT NULL DEFAULT 'purchase',

  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A listing can occupy at most one slot. This is the constraint that makes
-- double-claiming impossible at the database level rather than in application
-- code — two concurrent publish requests cannot both succeed.
CREATE UNIQUE INDEX IF NOT EXISTS listing_slots_property_unique
  ON public.listing_slots (property_id)
  WHERE property_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS listing_slots_user_status
  ON public.listing_slots (user_id, status);

CREATE INDEX IF NOT EXISTS listing_slots_subscription
  ON public.listing_slots (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;


-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Owners may read their own slots. Nobody writes through RLS: every write goes
-- through the service-role API, because granting a slot is the same as granting
-- money's worth of publishing.
ALTER TABLE public.listing_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own slots readable" ON public.listing_slots;
CREATE POLICY "own slots readable" ON public.listing_slots
  FOR SELECT USING (auth.uid() = user_id);


-- ── Backfill ─────────────────────────────────────────────────────────────────
-- Every listing that is live today already represents a slot someone paid for.
-- Create it, occupied, carrying the listing's current expiry so no live listing
-- changes its behaviour or its end date.
--
-- Idempotent: the WHERE NOT EXISTS clause means re-running adds nothing.
INSERT INTO public.listing_slots
  (user_id, package_type, status, expires_at, property_id, source)
SELECT
  p.landlord_id,
  COALESCE(p.package_type, 'basic'),
  'active',
  p.expires_at,                       -- NULL for admin listings = never expires
  p.id,
  'backfill'
FROM public.properties p
WHERE p.landlord_id IS NOT NULL
  AND p.listing_status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM public.listing_slots s WHERE s.property_id = p.id
  );

-- Carry the Stripe reference across where we can find it, so renewals landing on
-- invoice.payment_succeeded can extend the right slot.
UPDATE public.listing_slots s
SET stripe_subscription_id = sub.stripe_subscription_id,
    stripe_customer_id     = sub.stripe_customer_id
FROM public.properties p
JOIN public.submissions sub ON sub.id = p.source_submission_id
WHERE s.property_id = p.id
  AND s.stripe_subscription_id IS NULL
  AND sub.stripe_subscription_id IS NOT NULL;


-- ── Check ────────────────────────────────────────────────────────────────────
--   SELECT status, (property_id IS NOT NULL) AS occupied, count(*)
--   FROM public.listing_slots GROUP BY 1,2 ORDER BY 1,2;
--
-- Expect: every currently-active listing shows as one occupied active slot, and
-- zero free slots (nobody has bought ahead yet).
--
--   SELECT count(*) FROM public.properties WHERE listing_status = 'active';
-- should equal the occupied count above.
