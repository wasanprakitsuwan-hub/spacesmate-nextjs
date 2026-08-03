-- ═════════════════════════════════════════════════════════════════════════════
-- PDPA retention — WEBSITE database (jrykbzdzcplhrhauvlvk)
-- ═════════════════════════════════════════════════════════════════════════════
--
-- Do NOT run this against the intranet project (ecjsdvylsuchsjxnhgxf). That one
-- has its own retention migration covering staff, attendance and leave.
--
-- Implements the A-items from PDPA_Retention_Schedule.md v0.1 (approved
-- 2 August 2026). Section 37(3) requires personal data to be erased once its
-- purpose is served.
--
-- WHAT IS AND IS NOT HERE
--
--   A1  Listings, 24 months after inactive          ✓ below
--   A2  Submissions, 12 months / 6 months rejected  ✗ pending — see note at end
--   A3  Accounts, 12 months after closure           ✗ not implementable — see below
--   A4  Billing, 7 years                            — a floor, not a job. A1 honours it.
--   A5  location_requests                           ✓ dropped below
--   A6  Property images                             ✗ pending manual review

-- ── 0. Prerequisites ─────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_cron;


-- ── 1. Audit trail ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.retention_runs (
  id       BIGSERIAL PRIMARY KEY,
  job      TEXT NOT NULL,
  ran_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  rows_hit INTEGER,
  ok       BOOLEAN NOT NULL,
  detail   TEXT
);

COMMENT ON TABLE public.retention_runs IS
  'One row per retention job execution. The first place to look when deletion has quietly stopped happening.';

CREATE INDEX IF NOT EXISTS retention_runs_job_idx
  ON public.retention_runs (job, ran_at DESC);

GRANT ALL PRIVILEGES ON TABLE public.retention_runs TO service_role;
GRANT ALL PRIVILEGES ON SEQUENCE public.retention_runs_id_seq TO service_role;


-- ── 2. A5 · location_requests ────────────────────────────────────────────────
--
-- Confirmed empty on 2 August 2026. The table backs an unfinished feature: the
-- POST handler had no caller anywhere in the application, and was one of the
-- endpoints found unauthenticated during the July audit. Deleting it is simpler
-- and safer than documenting it in the privacy notice.

DROP TABLE IF EXISTS public.location_requests;


-- ── 3. A1 · Listings — 24 months after going inactive ────────────────────────
--
-- The condition that matters is NOT simply "old". A listing is deleted only when
-- all three hold:
--
--   1. its status is inactive or expired,
--   2. it has not been touched for 24 months,
--   3. it has no live subscription AND no live listing slot.
--
-- Conditions 3 is what stops this deleting a paying client's property. Billing
-- records under A4 are retained for seven years regardless — they live in
-- `subscriptions`, which this job never touches.
--
-- Note `listing_slots.expires_at IS NULL` means "never expires" (admin-granted),
-- so a plain `expires_at > now()` test would silently treat those as dead.

CREATE OR REPLACE FUNCTION public.retention_purge_listings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n INTEGER;
BEGIN
  DELETE FROM public.properties p
  WHERE p.listing_status IN ('inactive', 'expired')
    AND p.updated_at < (now() - INTERVAL '24 months')
    AND NOT EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.property_id = p.id AND s.expires_at > now())
    AND NOT EXISTS (
      SELECT 1 FROM public.listing_slots l
      WHERE l.property_id = p.id
        AND l.status = 'active'
        AND (l.expires_at IS NULL OR l.expires_at > now()));
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;


-- ── 4. Runner ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.retention_run_all()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jobs TEXT[] := ARRAY['retention_purge_listings'];
  j TEXT;
  n INTEGER;
BEGIN
  FOREACH j IN ARRAY jobs LOOP
    BEGIN
      EXECUTE format('SELECT public.%I()', j) INTO n;
      INSERT INTO public.retention_runs (job, rows_hit, ok) VALUES (j, n, TRUE);
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO public.retention_runs (job, rows_hit, ok, detail)
      VALUES (j, NULL, FALSE, SQLERRM);
    END;
  END LOOP;
END $$;


-- ── 5. Schedule ──────────────────────────────────────────────────────────────
-- 02:45 Bangkok = 19:45 UTC. Staggered fifteen minutes after the intranet job so
-- the two are distinguishable in logs.

SELECT cron.unschedule('pdpa-retention')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'pdpa-retention');

SELECT cron.schedule(
  'pdpa-retention',
  '45 19 * * *',
  $$SELECT public.retention_run_all()$$
);


-- ═════════════════════════════════════════════════════════════════════════════
-- STILL OUTSTANDING
-- ═════════════════════════════════════════════════════════════════════════════
--
-- A2 · SUBMISSIONS
--   The approved rule is 12 months after the resulting listing exists, 6 months
--   for rejected or unactioned. Not written yet because `submissions` is not
--   created by any migration in this repository — it was made by hand — so its
--   columns have not been verified. Writing a DELETE against a table whose
--   shape is assumed is how retention jobs quietly destroy the wrong rows.
--
--   Once its columns are confirmed, this becomes two short functions.
--
--   Separately: the table should be brought under migration control, or a
--   rebuild of this database from the repo would produce a site whose listing
--   form fails on first use.
--
-- A3 · ACCOUNTS
--   "12 months after closure" cannot be implemented: nothing records that an
--   account was closed, or when. `user_profiles.status` distinguishes active
--   from suspended but carries no timestamp — the same gap `terminated_at`
--   solved on the intranet, and it needs the same fix here.
--
--   Deliberately omitted rather than approximated. A guessed rule here deletes
--   live customers.
--
-- A6 · PROPERTY IMAGES
--   Retention follows A1, but the images need a look first: any photograph
--   showing an identifiable person is personal data in its own right.


-- ── Verify ───────────────────────────────────────────────────────────────────
--
-- ALWAYS preview before the first real run — this one deletes rows rather than
-- clearing columns, and there is no undo:
--
--   SELECT p.id, p.title_th, p.listing_status, p.contact_name, p.updated_at
--   FROM public.properties p
--   WHERE p.listing_status IN ('inactive','expired')
--     AND p.updated_at < (now() - INTERVAL '24 months')
--     AND NOT EXISTS (SELECT 1 FROM public.subscriptions s
--                     WHERE s.property_id = p.id AND s.expires_at > now())
--     AND NOT EXISTS (SELECT 1 FROM public.listing_slots l
--                     WHERE l.property_id = p.id AND l.status = 'active'
--                       AND (l.expires_at IS NULL OR l.expires_at > now()));
--
-- Then:
--   SELECT public.retention_run_all();
--   SELECT * FROM public.retention_runs ORDER BY id DESC LIMIT 5;
--   SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'pdpa-retention';
