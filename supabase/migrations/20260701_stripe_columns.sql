-- Add Stripe tracking columns to submissions table
-- Run this in Supabase SQL Editor

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Allow expired as a submission status (alongside approved, pending, rejected)
-- (No ENUM change needed if status is TEXT — just document valid values here)
-- Valid statuses: 'pending_payment' | 'approved' | 'pending' | 'rejected' | 'expired'

-- Index for fast webhook lookups by subscription ID
CREATE INDEX IF NOT EXISTS idx_submissions_stripe_sub
  ON submissions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
