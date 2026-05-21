-- Make every survey question truly optional. Q1 (peak weddings) and Q19
-- (call interest) were the last NOT NULL holdouts.
ALTER TABLE responses ALTER COLUMN peak_weddings_per_month DROP NOT NULL;
ALTER TABLE responses ALTER COLUMN call_interest DROP NOT NULL;
