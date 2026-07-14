-- Migration: Add contact_email to properties + fix ST Apartment for oraya.n
-- Date: 2026-07-14
-- Run in: Supabase Dashboard → SQL Editor

-- ── 1. Add contact_email column to properties (contact_name/phone/line already exist) ──
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- ── 2. Also add contact fields to submissions so public form can store them ──
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS contact_name  TEXT,
  ADD COLUMN IF NOT EXISTS contact_line  TEXT;
-- (contact_email and contact_phone already exist in submissions)

-- ── 3. Fix ST Apartment — link to oraya.n's account ──────────────────────────
-- Step A: Find the ST Apartment submission ID (run this first, verify the id)
SELECT id, title, status, user_id, contact_email, created_at
FROM submissions
WHERE title ILIKE '%เอสที%' OR title ILIKE '%ST Apartment%' OR title ILIKE '%st%apart%'
ORDER BY created_at DESC;

-- Step B: Once you confirm the submission ID above, run this block
-- (Replace 'SUBMISSION_ID_HERE' with the actual id from Step A)
/*
UPDATE submissions
SET
  user_id       = (SELECT id FROM user_profiles WHERE email = 'oraya.n@spacesmate.com'),
  contact_email = 'oraya.n@spacesmate.com'
WHERE id = 'SUBMISSION_ID_HERE';

-- Step C: Create the property row from the submission
INSERT INTO properties (
  slug, landlord_id, title_th, property_type, status,
  price_from, address_th, district, province,
  package_type, expires_at, listing_status, verified,
  source_submission_id
)
SELECT
  LOWER(REPLACE(title, ' ', '-')) || '-' || EXTRACT(EPOCH FROM NOW())::bigint,
  (SELECT id FROM user_profiles WHERE email = 'oraya.n@spacesmate.com'),
  title,
  property_type,
  'for_rent',
  COALESCE(price_from, 0),
  address_th,
  district,
  COALESCE(province, 'กรุงเทพมหานคร'),
  package_type,
  expires_at,
  'active',
  false,
  id
FROM submissions
WHERE id = 'SUBMISSION_ID_HERE';
*/

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
