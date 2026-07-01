-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: site_settings + location_requests
-- Run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. site_settings — key/value store for all dashboard settings
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT        PRIMARY KEY,
  value      JSONB       NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (API routes use service role which bypasses RLS — no public policies needed)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;


-- 2. location_requests — user-submitted location / project name suggestions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.location_requests (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  text         TEXT        NOT NULL,
  type         TEXT        NOT NULL CHECK (type IN ('location', 'project')),
  submitted_by TEXT,                                     -- email or identifier
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'approved', 'rejected')),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.location_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit a new request (public form on the website)
CREATE POLICY "public_submit_location_request"
  ON public.location_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Reads and updates are handled by service-role API routes (RLS bypass)
