-- Migration 006 — Add expiry_warning_sent to submissions
-- Run this in Supabase SQL Editor before deploying the cron job.
-- Tracks whether the 7-day expiry warning email has already been sent
-- so the daily cron doesn't send it multiple times.

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS expiry_warning_sent BOOLEAN DEFAULT FALSE;

-- Back-fill: existing approved submissions get FALSE (will send warning on next cron run if within window)
UPDATE public.submissions
  SET expiry_warning_sent = FALSE
  WHERE expiry_warning_sent IS NULL;
