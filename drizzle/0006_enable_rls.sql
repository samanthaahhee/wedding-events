-- Lock down PostgREST / anon-key access by enabling RLS with no permissive
-- policies. Our Next.js app talks to Postgres directly via DATABASE_URL using
-- the `postgres` role, which bypasses RLS — so app reads/writes are unaffected.
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_log ENABLE ROW LEVEL SECURITY;
