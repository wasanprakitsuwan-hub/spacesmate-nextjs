-- ============================================================================
-- Fix: grant table privileges on the tables created on 24 Oct 2026
-- ============================================================================
-- search_places and listing_stats_daily were created without GRANTs, so the
-- service role is refused before RLS is even checked ("permission denied for
-- table search_places"). Same cause and fix as listing_slots
-- (20260729a_listing_slots_grants.sql).
-- ============================================================================

GRANT ALL PRIVILEGES ON TABLE public.search_places TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.search_places TO postgres;
-- Public search reads the admin-edited list through the select-all policy.
GRANT SELECT ON TABLE public.search_places TO anon, authenticated;

GRANT ALL PRIVILEGES ON TABLE public.listing_stats_daily TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.listing_stats_daily TO postgres;
