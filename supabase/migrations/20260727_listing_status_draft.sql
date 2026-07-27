-- ─────────────────────────────────────────────────────────────────────────────
-- Add 'draft' to listing_status
--
-- WHY
--   Today the flow is form → pay → published in one step. If someone abandons it
--   you learn nothing: you cannot tell whether the form was too heavy or the
--   price was wrong, and those need different fixes.
--
--   A draft is a listing that has been written but not yet paid for. It belongs
--   to its owner, is visible only to them, and becomes active when a package is
--   applied.
--
-- EXISTING VALUES: active · inactive · pending · expired
--   'pending'  means awaiting admin review — a different thing from 'draft',
--              which means awaiting payment. Both are kept.
--
-- SAFE TO RE-RUN. Nothing is written; only the constraint changes.
-- ─────────────────────────────────────────────────────────────────────────────

-- The constraint name varies depending on how the table was created, so find it
-- rather than assuming properties_listing_status_check.
DO $$
DECLARE
  con_name TEXT;
BEGIN
  SELECT conname INTO con_name
  FROM pg_constraint
  WHERE conrelid = 'public.properties'::regclass
    AND contype  = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%listing_status%';

  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.properties DROP CONSTRAINT %I', con_name);
  END IF;
END $$;

ALTER TABLE public.properties
  ADD CONSTRAINT properties_listing_status_check
  CHECK (listing_status IN ('active', 'inactive', 'pending', 'expired', 'draft'));


-- ── Public visibility ────────────────────────────────────────────────────────
-- The existing RLS policy already reads `USING (listing_status = 'active')`, so
-- a draft is invisible to anonymous readers without any further change. This is
-- worth stating explicitly: the database is the backstop, not the application.
-- Application-level filters are defence in depth, not the guarantee.
--
-- Confirm with:
--   SELECT polname, pg_get_expr(polqual, polrelid)
--   FROM pg_policy WHERE polrelid = 'public.properties'::regclass;


-- ── Owners must still see their own drafts ───────────────────────────────────
-- /api/owner/listings uses the service-role client and filters by landlord_id,
-- so it bypasses RLS and is unaffected. No policy change needed.


-- ── Check ────────────────────────────────────────────────────────────────────
--   SELECT listing_status, count(*) FROM public.properties GROUP BY 1 ORDER BY 2 DESC;
