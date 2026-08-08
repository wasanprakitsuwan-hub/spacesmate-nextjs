-- ═════════════════════════════════════════════════════════════════════════════
-- Consent records — WEBSITE database (jrykbzdzcplhrhauvlvk)
-- ═════════════════════════════════════════════════════════════════════════════
--
-- Do NOT run against the intranet project (ecjsdvylsuchsjxnhgxf); staff consent
-- lives there in its own tables.
--
-- WHY
--   Section 19 of the PDPA requires a controller to be able to DEMONSTRATE that
--   consent was given. Two places currently fail that test:
--
--     · the cookie banner stores its decision in localStorage — on the
--       visitor's own device, which they can clear and we cannot produce;
--     · the listing submission form's consent tick is checked in the browser
--       and never sent to the server at all. Nothing is stored anywhere.
--
--   A tick nobody recorded is not evidence of anything.
--
-- WHAT IS DELIBERATELY NOT COLLECTED
--   No IP address, no user agent, no fingerprint. The temptation with a consent
--   log is to capture everything "to prove it was really them" — which means
--   building a tracking database in order to comply with a privacy law. The
--   record needs to show WHAT was consented to, to WHICH version of the notice,
--   and WHEN. It does not need to identify a stranger who declined cookies.
--
--   For anonymous visitors the subject is a random id held alongside their own
--   consent state. It links their record to nothing else.

CREATE TABLE IF NOT EXISTS public.consent_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which consent this is. 'cookies' from the banner, 'listing_submission'
  -- from the public form. Extend deliberately, not casually.
  kind          TEXT NOT NULL CHECK (kind IN ('cookies', 'listing_submission')),

  -- Who, as far as we legitimately know.
  --   subject_ref — the random id the browser holds, or the submission id.
  --   user_id     — set only when the person was signed in.
  subject_ref   TEXT,
  user_id       UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  -- What they agreed to. Version matters: consent to one set of purposes is not
  -- consent to a later, different set.
  notice_version INTEGER NOT NULL,
  granted        JSONB   NOT NULL,

  -- 'granted' | 'withdrawn'. Withdrawal is recorded as a new row rather than by
  -- editing the old one — the history is the evidence, and overwriting it
  -- destroys the very thing the table exists to prove.
  action        TEXT NOT NULL DEFAULT 'granted' CHECK (action IN ('granted', 'withdrawn')),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.consent_records IS
  'Append-only evidence of consent under PDPA s.19. Never UPDATE a row: a withdrawal is a new row. Deliberately holds no IP address or user agent.';

CREATE INDEX IF NOT EXISTS consent_records_subject_idx
  ON public.consent_records (kind, subject_ref, created_at DESC);

CREATE INDEX IF NOT EXISTS consent_records_user_idx
  ON public.consent_records (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;


-- ── Access ───────────────────────────────────────────────────────────────────
-- The table is written by the server only. Nothing client-side may read it:
-- a consent log readable from the browser is a list of who visited the site.

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- RLS with no policy denies everyone; the service role bypasses policies but
-- NOT table grants, which is the trap that broke listing_slots in July.
GRANT ALL PRIVILEGES ON TABLE public.consent_records TO service_role;
REVOKE ALL ON TABLE public.consent_records FROM anon, authenticated;


-- ── Retention ────────────────────────────────────────────────────────────────
-- Consent evidence must outlive the processing it authorised, but not forever.
-- Three years matches the staff consent rule in the approved schedule.

CREATE OR REPLACE FUNCTION public.retention_purge_consent_records()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n INTEGER;
BEGIN
  DELETE FROM public.consent_records
  WHERE created_at < (now() - INTERVAL '3 years');
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;


-- ── Verify ───────────────────────────────────────────────────────────────────
--   SELECT kind, action, count(*) FROM public.consent_records GROUP BY 1,2;
--
-- Expect zero rows until the banner and the submission form start writing.
