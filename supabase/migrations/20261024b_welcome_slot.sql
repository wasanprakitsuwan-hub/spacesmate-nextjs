-- ═══════════════════════════════════════════════════════════════════════════
-- One free Basic slot per new account
--
-- WEBSITE database (spacesmate.com — jrykbzdzcplhrhauvlvk).
--
-- lib/slots.ts ensureWelcomeSlot() grants it, with source = 'welcome', to
-- accounts created on or after WELCOME_SLOT_SINCE. It checks "ever had one"
-- before inserting; this index makes that hold when two requests race, so an
-- account can never hold two welcome slots, now or after the first expires.
--
-- Safe to run more than once.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE UNIQUE INDEX IF NOT EXISTS listing_slots_one_welcome_per_user
  ON public.listing_slots (user_id)
  WHERE source = 'welcome';
