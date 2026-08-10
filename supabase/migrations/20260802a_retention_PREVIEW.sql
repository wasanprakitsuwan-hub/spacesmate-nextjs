-- ═════════════════════════════════════════════════════════════════════════════
-- RETENTION PREVIEW — WEBSITE database (jrykbzdzcplhrhauvlvk)
-- ═════════════════════════════════════════════════════════════════════════════
--
-- READ ONLY. Nothing is deleted, dropped or updated by this script.
--
-- Every predicate below is copied verbatim from 20260802a_retention.sql. If a
-- count here is wrong, the migration is wrong — that is the point of running it.
--
-- Run this FIRST. Read the numbers. Only then run the migration.
--
-- Do NOT run against the intranet project (ecjsdvylsuchsjxnhgxf).


-- ═════════════════════════════════════════════════════════════════════════════
-- STEP 0 — RUN THIS ALONE FIRST. Are you in the right database?
-- ═════════════════════════════════════════════════════════════════════════════
-- Highlight just this statement and run it before anything else.

SELECT CASE
  WHEN to_regclass('public.properties') IS NOT NULL
    THEN '✅ WEBSITE — correct database for this script, continue'
  WHEN to_regclass('public.attendance_records') IS NOT NULL
    THEN '🛑 INTRANET — STOP. This is the website script. Switch projects.'
  ELSE '❓ Neither table found — check the project selector'
END AS database_check;


-- ═════════════════════════════════════════════════════════════════════════════
-- STEP 1 — What exists? Run this second.
-- ═════════════════════════════════════════════════════════════════════════════
-- location_requests is expected to be present-but-empty. If it returns NULL it
-- has already gone, and the DROP in the migration is a no-op — fine either way.

SELECT 'properties'        AS object, to_regclass('public.properties')::text        AS found
UNION ALL SELECT 'submissions',       to_regclass('public.submissions')::text
UNION ALL SELECT 'subscriptions',     to_regclass('public.subscriptions')::text
UNION ALL SELECT 'listing_slots',     to_regclass('public.listing_slots')::text
UNION ALL SELECT 'location_requests', to_regclass('public.location_requests')::text;


-- ═════════════════════════════════════════════════════════════════════════════
-- STEP 2 — The counts
-- ═════════════════════════════════════════════════════════════════════════════
-- NOTE: if Step 1 showed location_requests as NULL, delete the first block below
-- before running — selecting from a table that does not exist raises 42P01 and
-- kills the whole UNION.

-- ── A5 · location_requests — the migration DROPs this table ──────────────────
-- Expected: 0. Anything above 0 means the table is in use and the DROP must be
-- reconsidered rather than run.
SELECT 'A5 · location_requests (table will be DROPPED)' AS job,
       COUNT(*)                                        AS rows_affected,
       'DROP TABLE'                                    AS action
FROM public.location_requests

UNION ALL

-- ── A1 · Listings — inactive/expired, untouched 24 months, nothing paid ──────
SELECT 'A1 · listings deleted',
       COUNT(*),
       'DELETE'
FROM public.properties p
WHERE p.listing_status IN ('inactive', 'expired')
  AND p.updated_at < (now() - INTERVAL '24 months')
  AND NOT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.property_id = p.id AND s.expires_at > now())
  AND NOT EXISTS (
    SELECT 1 FROM public.listing_slots l
    WHERE l.property_id = p.id
      AND l.status = 'active'
      AND (l.expires_at IS NULL OR l.expires_at > now()))

UNION ALL

-- ── A2 · Submissions, approved — 12 months ───────────────────────────────────
SELECT 'A2 · submissions approved deleted',
       COUNT(*),
       'DELETE'
FROM public.submissions
WHERE status = 'approved'
  AND updated_at < (now() - INTERVAL '12 months')

UNION ALL

-- ── A2b · Submissions, rejected / expired / abandoned — 6 months ─────────────
SELECT 'A2b · submissions rejected+expired+pending_payment deleted',
       COUNT(*),
       'DELETE'
FROM public.submissions
WHERE status IN ('rejected', 'expired', 'pending_payment')
  AND updated_at < (now() - INTERVAL '6 months');


-- ═════════════════════════════════════════════════════════════════════════════
-- SAFETY CHECKS — run these too, and read them before deciding
-- ═════════════════════════════════════════════════════════════════════════════

-- 1. What listing_status values actually exist, and how old is each group?
--    If a status the migration does not name holds most of the data, the rule
--    may be aimed at the wrong rows.
SELECT listing_status,
       COUNT(*)                                              AS total,
       MIN(updated_at)::date                                 AS oldest,
       COUNT(*) FILTER (WHERE updated_at < now() - INTERVAL '24 months') AS over_24_months
FROM public.properties
GROUP BY listing_status
ORDER BY total DESC;

-- 2. Same for submissions.
SELECT status,
       COUNT(*)                                             AS total,
       MIN(updated_at)::date                                AS oldest,
       COUNT(*) FILTER (WHERE updated_at < now() - INTERVAL '6 months')  AS over_6_months,
       COUNT(*) FILTER (WHERE updated_at < now() - INTERVAL '12 months') AS over_12_months
FROM public.submissions
GROUP BY status
ORDER BY total DESC;

-- 3. The one that would hurt: any listing about to be deleted that still has a
--    subscription row of ANY kind, expired or not. Expect zero rows. If this
--    returns anything, stop — billing history and the listing are entangled and
--    the rule needs another condition.
SELECT p.id, p.title, p.listing_status, p.updated_at::date,
       s.id AS subscription_id, s.expires_at::date AS sub_expires
FROM public.properties p
JOIN public.subscriptions s ON s.property_id = p.id
WHERE p.listing_status IN ('inactive', 'expired')
  AND p.updated_at < (now() - INTERVAL '24 months')
  AND NOT EXISTS (
    SELECT 1 FROM public.subscriptions s2
    WHERE s2.property_id = p.id AND s2.expires_at > now())
  AND NOT EXISTS (
    SELECT 1 FROM public.listing_slots l
    WHERE l.property_id = p.id AND l.status = 'active'
      AND (l.expires_at IS NULL OR l.expires_at > now()));

-- 4. Sample 10 rows that would actually be deleted, so the numbers have faces.
SELECT p.id, p.title, p.listing_status, p.updated_at::date AS last_touched
FROM public.properties p
WHERE p.listing_status IN ('inactive', 'expired')
  AND p.updated_at < (now() - INTERVAL '24 months')
  AND NOT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.property_id = p.id AND s.expires_at > now())
  AND NOT EXISTS (
    SELECT 1 FROM public.listing_slots l
    WHERE l.property_id = p.id AND l.status = 'active'
      AND (l.expires_at IS NULL OR l.expires_at > now()))
ORDER BY p.updated_at
LIMIT 10;
