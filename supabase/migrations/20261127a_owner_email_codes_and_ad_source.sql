-- ═══════════════════════════════════════════════════════════════════════════
-- Facebook ad funnel: email codes before first payment, and the ad source of
-- each listing.
--
-- WEBSITE database (spacesmate.com — jrykbzdzcplhrhauvlvk).
--
-- Run this BEFORE switching off "Confirm email" in Supabase
-- (Authentication › Sign In / Providers › Email). Until that switch is off,
-- Supabase still confirms every email signup by link, and this table is only
-- used by owners who arrive after it.
--
-- Safe to run more than once.
-- ═══════════════════════════════════════════════════════════════════════════

-- One row per owner who asked for a code. verified_at set = email proven.
-- The code is stored only as a SHA-256 hash and lives 15 minutes.
CREATE TABLE IF NOT EXISTS public.owner_email_verification (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  code_hash       TEXT,
  code_expires_at TIMESTAMPTZ,
  attempts        INT NOT NULL DEFAULT 0,
  sent_at         TIMESTAMPTZ,
  verified_at     TIMESTAMPTZ
);

-- Server only. No policy: anon and authenticated users cannot read hashes.
ALTER TABLE public.owner_email_verification ENABLE ROW LEVEL SECURITY;
GRANT ALL PRIVILEGES ON TABLE public.owner_email_verification TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.owner_email_verification TO postgres;

-- Campaign that brought the owner, saved when the listing is first written:
-- { utm_source, utm_medium, utm_campaign, utm_content, utm_term, landing,
--   landed_at, fbclid (only with marketing consent) }. NULL = not from a
-- tagged link.
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS attribution JSONB;

-- Example: listings per campaign this month
--   SELECT attribution->>'utm_campaign' AS campaign, count(*)
--   FROM properties
--   WHERE created_at >= date_trunc('month', now()) AND attribution IS NOT NULL
--   GROUP BY 1 ORDER BY 2 DESC;
