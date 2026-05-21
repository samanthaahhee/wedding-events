-- New text columns: per-group "Other" inputs on Q5 + soft-hold duration on Q10.
ALTER TABLE responses ADD COLUMN IF NOT EXISTS tools_communication_other text;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS tools_calendar_other text;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS tools_documents_other text;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS soft_hold_duration text;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS soft_hold_duration_other text;

-- Relax NOT NULL on non-critical fields so respondents can skip without bouncing.
-- Only peak_weddings_per_month and call_interest remain required.
ALTER TABLE responses ALTER COLUMN event_mix DROP NOT NULL;
ALTER TABLE responses ALTER COLUMN day_to_day_owner DROP NOT NULL;
ALTER TABLE responses ALTER COLUMN booking_source DROP NOT NULL;
ALTER TABLE responses ALTER COLUMN update_propagation DROP NOT NULL;
ALTER TABLE responses ALTER COLUMN admin_hours_per_wedding DROP NOT NULL;
ALTER TABLE responses ALTER COLUMN pct_repetitive DROP NOT NULL;
ALTER TABLE responses ALTER COLUMN conversion_rate DROP NOT NULL;
ALTER TABLE responses ALTER COLUMN most_frustrating DROP NOT NULL;
ALTER TABLE responses ALTER COLUMN willingness_to_pay DROP NOT NULL;
