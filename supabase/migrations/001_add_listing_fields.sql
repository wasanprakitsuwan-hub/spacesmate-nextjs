-- ============================================================
-- Migration 001 — Add rental_term, package_type, expires_at
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── submissions table ─────────────────────────────────────────
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS rental_term   TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS package_type  TEXT DEFAULT 'free_trial',
  ADD COLUMN IF NOT EXISTS expires_at    TIMESTAMPTZ;

-- ── properties table ──────────────────────────────────────────
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS rental_term   TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS package_type  TEXT DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS expires_at    TIMESTAMPTZ;

-- ── Index for fast expiry queries ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_submissions_status_expires
  ON public.submissions (status, expires_at);

CREATE INDEX IF NOT EXISTS idx_properties_expires
  ON public.properties (expires_at);

-- ── rental_term values reference ──────────────────────────────
-- 'daily'     → รายวัน
-- 'weekly'    → รายสัปดาห์
-- 'monthly'   → รายเดือน
-- '3_months'  → 3 เดือน
-- '6_months'  → 6 เดือน
-- 'yearly'    → รายปี

-- ── package_type values reference ─────────────────────────────
-- 'free_trial' → ฟรี 30 วัน  (requires admin approval)
-- 'basic'      → Basic ฿299   30 วัน  (auto-approved)
-- 'standard'   → Standard ฿799  90 วัน  (auto-approved)
-- 'premium'    → Premium ฿2,499  365 วัน (auto-approved)
