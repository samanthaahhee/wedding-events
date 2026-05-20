-- v2 — drop and rebuild responses. outreach_log is untouched, but its
-- response_id FK constraint gets dropped by CASCADE and is recreated below.

DROP TABLE IF EXISTS responses CASCADE;
--> statement-breakpoint

CREATE TABLE responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  source text NOT NULL DEFAULT 'direct',
  venue_slug text,

  peak_weddings_per_month text NOT NULL,
  event_mix text NOT NULL,

  day_to_day_owner text NOT NULL,
  day_to_day_owner_other text,

  booking_source text NOT NULL,
  booking_source_other text,

  tools_communication text[] NOT NULL DEFAULT '{}',
  tools_calendar text[] NOT NULL DEFAULT '{}',
  tools_documents text[] NOT NULL DEFAULT '{}',
  tools_booking_software_name text,
  tools_invoicing text[] NOT NULL DEFAULT '{}',
  tools_other text,

  info_location text[] NOT NULL DEFAULT '{}',
  info_location_other text,

  update_propagation text NOT NULL,
  update_propagation_one_place_where text,

  admin_hours_per_wedding text NOT NULL,
  pct_repetitive text NOT NULL,

  hold_policy text[] NOT NULL DEFAULT '{}',
  hold_policy_other text,

  conversion_rate text NOT NULL,
  double_booking text NOT NULL,

  most_frustrating text NOT NULL,

  vision_skipped boolean NOT NULL DEFAULT false,

  realtime_availability text,
  couple_direct_booking text,
  hold_release_waitlist text,
  venue_info_willingness text[] DEFAULT '{}',
  vision_killer_feature text,

  software_categories text[] NOT NULL DEFAULT '{}',
  software_other text,
  events_software_review text,

  willingness_to_pay text NOT NULL,

  call_interest text NOT NULL,

  venue_name text,
  contact_name text,
  contact_role text,
  whatsapp text,
  email text,

  user_agent text,
  completion_time_seconds integer,

  followed_up boolean NOT NULL DEFAULT false
);
--> statement-breakpoint

CREATE INDEX idx_responses_source ON responses(source);
--> statement-breakpoint
CREATE INDEX idx_responses_created_at ON responses(created_at);
--> statement-breakpoint
CREATE INDEX idx_responses_call_interest ON responses(call_interest);
--> statement-breakpoint
CREATE INDEX idx_responses_day_to_day_owner ON responses(day_to_day_owner);
--> statement-breakpoint
CREATE INDEX idx_responses_booking_source ON responses(booking_source);
--> statement-breakpoint

-- Re-establish FK constraint that CASCADE dropped
ALTER TABLE outreach_log
  ADD CONSTRAINT outreach_log_response_id_responses_id_fk
  FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE SET NULL;
