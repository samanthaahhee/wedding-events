-- Pin search_path on the legacy set_updated_at() trigger function (used by
-- the pre-existing countries/cities tables, unrelated to our survey schema).
-- Clears Supabase's "Function Search Path Mutable" advisor warning.
ALTER FUNCTION public.set_updated_at() SET search_path = public, pg_catalog;
