-- Q12 (double-booking history) cut from the survey UI. Allow NULL so new
-- inserts don't have to supply a value. Existing rows are untouched.
ALTER TABLE responses ALTER COLUMN double_booking DROP NOT NULL;
