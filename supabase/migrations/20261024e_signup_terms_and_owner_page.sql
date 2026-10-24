-- ═════════════════════════════════════════════════════════════════════════════
-- Sign-up acceptance of the Terms of Use and Privacy Policy
-- WEBSITE database ONLY (spacesmate.com, Supabase project jrykbzdzcplhrhauvlvk)
-- ═════════════════════════════════════════════════════════════════════════════
--
-- Adds a third consent kind, 'signup_terms', written by /api/consent/signup.
-- granted holds { terms, privacy, marketing, source }. Marketing is its own
-- optional tick; it never rides on acceptance of the terms.
-- Safe to run more than once.

ALTER TABLE public.consent_records DROP CONSTRAINT IF EXISTS consent_records_kind_check;
ALTER TABLE public.consent_records
  ADD CONSTRAINT consent_records_kind_check
  CHECK (kind IN ('cookies', 'listing_submission', 'signup_terms'));


-- ═════════════════════════════════════════════════════════════════════════════
-- /submit renamed to /list-your-property; /pricing merged into it
-- ═════════════════════════════════════════════════════════════════════════════
-- Keeps the page titles and descriptions edited in /dashboard/pages attached to
-- the new addresses. Old addresses redirect (next.config.js).

UPDATE public.site_pages SET path = '/list-your-property' || substr(path, length('/submit') + 1),
       label_th = CASE WHEN path = '/submit' THEN 'ลงประกาศให้เช่า' ELSE label_th END,
       label_en = CASE WHEN path = '/submit' THEN 'List your property' ELSE label_en END
 WHERE (path = '/submit' OR path LIKE '/submit/%')
   AND NOT EXISTS (
     SELECT 1 FROM public.site_pages p2
      WHERE p2.path = '/list-your-property' || substr(public.site_pages.path, length('/submit') + 1)
   );

UPDATE public.site_pages SET status = 'unpublished', page_type = 'redirect', is_indexable = false WHERE path = '/pricing';
