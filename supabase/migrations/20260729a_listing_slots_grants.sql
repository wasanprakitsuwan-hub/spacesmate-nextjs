-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: grant table privileges on listing_slots
--
-- THE BUG
--   20260727b created the table, enabled RLS, and added a SELECT policy — but
--   never issued a single GRANT. Every read and write from the application has
--   been failing since with "permission denied for table listing_slots".
--
-- WHY THE SERVICE ROLE DID NOT SAVE US
--   The service role bypasses RLS. It does NOT bypass table-level GRANTs.
--   Postgres checks privileges FIRST and row-level policies SECOND, so with no
--   GRANT the request never got as far as the policy. "Service role can do
--   anything" is true of RLS only.
--
--   Tables created through the Supabase dashboard inherit grants automatically.
--   A table created by raw DDL in the SQL editor does not reliably do so, which
--   is exactly how this table was made.
--
-- WHY IT WAS INVISIBLE
--   listSlots() and grantSlots() both catch their error, log it, and return an
--   empty array / 0. So the dashboard showed "สล็อตว่าง 0" — which is what it
--   would show if you genuinely had no slots — and the webhook returned 200 OK
--   to Stripe after granting nothing. A customer paid and received nothing,
--   and every system involved reported success.
-- ─────────────────────────────────────────────────────────────────────────────

-- The application does all slot reads and writes through the service role.
GRANT ALL PRIVILEGES ON TABLE public.listing_slots TO service_role;

-- Owners read their own slots directly in a few places; the existing
-- "own slots readable" RLS policy still constrains this to their own rows.
GRANT SELECT ON TABLE public.listing_slots TO authenticated;

-- postgres owns the table already, but be explicit so a future owner change
-- cannot quietly reintroduce this.
GRANT ALL PRIVILEGES ON TABLE public.listing_slots TO postgres;

-- No sequence grants needed: id is a UUID with a gen_random_uuid() default,
-- not an identity column.


-- ── Verify ───────────────────────────────────────────────────────────────────
-- Expect: service_role with INSERT/SELECT/UPDATE/DELETE, authenticated with
-- SELECT. If service_role returns no rows, the grant above did not apply and
-- the application is still broken.
SELECT grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name   = 'listing_slots'
  AND grantee IN ('service_role', 'authenticated', 'anon', 'postgres')
GROUP BY grantee
ORDER BY grantee;
