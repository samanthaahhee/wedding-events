-- Final open-ended "anything else?" prompt.
ALTER TABLE responses ADD COLUMN IF NOT EXISTS additional_comments text;
