import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const responses = pgTable(
  "responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Source tracking
    source: text("source").notNull().default("direct"),
    venueSlug: text("venue_slug"),

    // Q1 Peak weddings per month (in busiest month)
    peakWeddingsPerMonth: text("peak_weddings_per_month").notNull(),

    // Q2 Event mix
    eventMix: text("event_mix").notNull(),

    // Q3 Day-to-day owner
    dayToDayOwner: text("day_to_day_owner").notNull(),
    dayToDayOwnerOther: text("day_to_day_owner_other"),

    // Q4 Who books
    bookingSource: text("booking_source").notNull(),
    bookingSourceOther: text("booking_source_other"),

    // Q5 Tools (grouped)
    toolsCommunication: text("tools_communication")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    toolsCalendar: text("tools_calendar")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    toolsDocuments: text("tools_documents")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    toolsBookingSoftwareName: text("tools_booking_software_name"),
    toolsInvoicing: text("tools_invoicing")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    toolsOther: text("tools_other"),

    // Q6 Where the info lives
    infoLocation: text("info_location")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    infoLocationOther: text("info_location_other"),

    // Q7 Update propagation
    updatePropagation: text("update_propagation").notNull(),
    updatePropagationOnePlaceWhere: text("update_propagation_one_place_where"),

    // Q8 Admin hours per wedding
    adminHoursPerWedding: text("admin_hours_per_wedding").notNull(),

    // Q9 % repetitive
    pctRepetitive: text("pct_repetitive").notNull(),

    // Q10 Hold policy
    holdPolicy: text("hold_policy")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    holdPolicyOther: text("hold_policy_other"),

    // Q11 Conversion rate
    conversionRate: text("conversion_rate").notNull(),

    // Q12 was Double-booking history — column kept for legacy rows, no longer asked.
    doubleBooking: text("double_booking"),

    // Q13 Open frustration
    mostFrustrating: text("most_frustrating").notNull(),

    // Section 4 marker (Vision Check)
    visionSkipped: boolean("vision_skipped").notNull().default(false),

    // Q14 Real-time availability + public access (optional)
    realtimeAvailability: text("realtime_availability"),
    // Q15 Couple-direct booking (optional)
    coupleDirectBooking: text("couple_direct_booking"),
    // Q16 Hold-release waitlist (optional)
    holdReleaseWaitlist: text("hold_release_waitlist"),
    // Q17 Venue info willingness (optional)
    venueInfoWillingness: text("venue_info_willingness")
      .array()
      .default(sql`'{}'::text[]`),
    // Q18 Vision killer feature (optional)
    visionKillerFeature: text("vision_killer_feature"),

    // Q19 Software categories
    softwareCategories: text("software_categories")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    softwareOther: text("software_other"),
    eventsSoftwareReview: text("events_software_review"),

    // Q20 Willingness to pay (qualitative)
    willingnessToPay: text("willingness_to_pay").notNull(),

    // Q21 Open to a call
    callInterest: text("call_interest").notNull(),

    // Q22 Contact (all optional)
    venueName: text("venue_name"),
    contactName: text("contact_name"),
    contactRole: text("contact_role"),
    whatsapp: text("whatsapp"),
    email: text("email"),

    // Meta
    userAgent: text("user_agent"),
    completionTimeSeconds: integer("completion_time_seconds"),

    followedUp: boolean("followed_up").notNull().default(false),
  },
  (t) => [
    index("idx_responses_source").on(t.source),
    index("idx_responses_created_at").on(t.createdAt),
    index("idx_responses_call_interest").on(t.callInterest),
    index("idx_responses_day_to_day_owner").on(t.dayToDayOwner),
    index("idx_responses_booking_source").on(t.bookingSource),
  ],
);

// Unchanged — leave alone
export const outreachLog = pgTable(
  "outreach_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    venueName: text("venue_name").notNull(),
    venueSlug: text("venue_slug").notNull().unique(),

    contactEmail: text("contact_email"),
    contactInstagram: text("contact_instagram"),
    region: text("region"),
    venueType: text("venue_type"),

    emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
    emailBatch: text("email_batch"),
    igDmSentAt: timestamp("ig_dm_sent_at", { withTimezone: true }),
    followupSentAt: timestamp("followup_sent_at", { withTimezone: true }),

    responseId: uuid("response_id").references(() => responses.id, {
      onDelete: "set null",
    }),
    responded: boolean("responded")
      .notNull()
      .generatedAlwaysAs(sql`(response_id IS NOT NULL)`),

    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_outreach_log_email_batch").on(t.emailBatch),
    index("idx_outreach_log_responded").on(t.responded),
  ],
);

export type Response = typeof responses.$inferSelect;
export type NewResponse = typeof responses.$inferInsert;
export type OutreachLog = typeof outreachLog.$inferSelect;
export type NewOutreachLog = typeof outreachLog.$inferInsert;
