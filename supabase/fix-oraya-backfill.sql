-- ── Fix: oraya.n@spacesmate.com — missing second subscription + listing ────────
-- Run in Supabase SQL Editor (spacesmate project)
-- This backfills submissions.user_id and properties.landlord_id for all of her listings

-- STEP 1: Diagnose — see current state
SELECT id, email, stripe_subscription_id, stripe_customer_id, package_type, package_expires_at
FROM user_profiles
WHERE email = 'oraya.n@spacesmate.com';

SELECT id, title, status, user_id, contact_email, stripe_subscription_id, package_type, expires_at
FROM submissions
WHERE contact_email = 'oraya.n@spacesmate.com'
ORDER BY created_at DESC;

SELECT id, title_th, slug, landlord_id, source_submission_id, listing_status, package_type, expires_at
FROM properties
WHERE landlord_id = (SELECT id FROM user_profiles WHERE email = 'oraya.n@spacesmate.com')
   OR source_submission_id IN (
     SELECT id FROM submissions WHERE contact_email = 'oraya.n@spacesmate.com'
   )
ORDER BY created_at DESC;

-- STEP 2: Backfill submissions.user_id (fixes subscription route path 1)
UPDATE submissions
SET user_id = (SELECT id FROM user_profiles WHERE email = 'oraya.n@spacesmate.com')
WHERE contact_email = 'oraya.n@spacesmate.com'
  AND status = 'approved'
  AND (user_id IS NULL OR user_id != (SELECT id FROM user_profiles WHERE email = 'oraya.n@spacesmate.com'));

-- STEP 3: Backfill properties.landlord_id (fixes owner dashboard listings table)
UPDATE properties
SET landlord_id = (SELECT id FROM user_profiles WHERE email = 'oraya.n@spacesmate.com')
WHERE source_submission_id IN (
  SELECT id FROM submissions WHERE contact_email = 'oraya.n@spacesmate.com' AND status = 'approved'
)
AND (landlord_id IS NULL OR landlord_id != (SELECT id FROM user_profiles WHERE email = 'oraya.n@spacesmate.com'));

-- STEP 4: Verify — both listings should now show landlord_id
SELECT id, title_th, slug, landlord_id, listing_status, package_type, expires_at
FROM properties
WHERE landlord_id = (SELECT id FROM user_profiles WHERE email = 'oraya.n@spacesmate.com')
ORDER BY created_at DESC;
