CREATE TABLE "outreach_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_name" text NOT NULL,
	"venue_slug" text NOT NULL,
	"contact_email" text,
	"contact_instagram" text,
	"region" text,
	"venue_type" text,
	"email_sent_at" timestamp with time zone,
	"email_batch" text,
	"ig_dm_sent_at" timestamp with time zone,
	"followup_sent_at" timestamp with time zone,
	"response_id" uuid,
	"responded" boolean GENERATED ALWAYS AS ((response_id IS NOT NULL)) STORED NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "outreach_log_venue_slug_unique" UNIQUE("venue_slug")
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text DEFAULT 'direct' NOT NULL,
	"venue_slug" text,
	"events_last_12mo" text NOT NULL,
	"pct_weddings" integer,
	"day_to_day_owner" text NOT NULL,
	"tools_used" text[] DEFAULT '{}'::text[] NOT NULL,
	"tools_used_other_software" text,
	"tools_used_other" text,
	"repetitive_questions" text NOT NULL,
	"most_frustrating" text NOT NULL,
	"paid_for_software" text NOT NULL,
	"paid_for_software_name" text,
	"paid_for_software_stopped_reason" text,
	"marketplace_sentiment" text NOT NULL,
	"call_interest" text NOT NULL,
	"venue_name" text,
	"contact_name" text,
	"contact_role" text,
	"email" text,
	"whatsapp" text,
	"user_agent" text,
	"completion_time_seconds" integer,
	"followed_up" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "outreach_log" ADD CONSTRAINT "outreach_log_response_id_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."responses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_outreach_log_email_batch" ON "outreach_log" USING btree ("email_batch");--> statement-breakpoint
CREATE INDEX "idx_outreach_log_responded" ON "outreach_log" USING btree ("responded");--> statement-breakpoint
CREATE INDEX "idx_responses_source" ON "responses" USING btree ("source");--> statement-breakpoint
CREATE INDEX "idx_responses_created_at" ON "responses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_responses_call_interest" ON "responses" USING btree ("call_interest");