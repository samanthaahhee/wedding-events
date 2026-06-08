import { z } from "zod";

// ---------- Enums ----------
export const PEAK_WEDDINGS_PER_MONTH = [
  "0-1",
  "2-3",
  "4-6",
  "7-10",
  "10+",
] as const;

export const EVENT_MIX = [
  "mostly_weddings",
  "mainly_weddings",
  "half_half",
  "mainly_other",
  "almost_no_weddings",
] as const;

export const DAY_TO_DAY_OWNER = [
  "owner",
  "in_house_coordinator",
  "ops_manager",
  "external_planner_most",
  "split_50_50",
  "just_me",
  "other",
] as const;

export const BOOKING_SOURCE = [
  "couples_direct",
  "mostly_couples",
  "half_half",
  "mostly_planners",
  "almost_planners",
  "marketplaces",
  "other",
] as const;

export const UPDATE_PROPAGATION = [
  "one_place",
  "multiple_places",
  "verbal",
  "out_of_date",
  "not_sure",
] as const;

export const ADMIN_HOURS_PER_WEDDING = [
  "under_5",
  "5_10",
  "10_20",
  "20_40",
  "40_plus",
  "no_idea",
] as const;

export const PCT_REPETITIVE = [
  "under_20",
  "20_40",
  "40_60",
  "60_80",
  "over_80",
] as const;

export const CONVERSION_RATE = [
  "1_or_fewer",
  "2_3",
  "4_5",
  "6_7",
  "8_plus",
  "no_idea",
] as const;

export const DOUBLE_BOOKING = [
  "more_than_once",
  "once",
  "almost",
  "never",
  "not_sure",
] as const;

export const REALTIME_AVAILABILITY = [
  "very_helpful_fully_public",
  "helpful_gated",
  "neutral",
  "concern",
  "no",
] as const;

export const COUPLE_DIRECT_BOOKING = [
  "full_automation",
  "partial",
  "review_each",
  "human_conversation_required",
  "no_trust",
] as const;

export const HOLD_RELEASE_WAITLIST = [
  "yes",
  "maybe_with_control",
  "manual_decision",
  "no",
  "not_sure",
] as const;

export const CALL_INTEREST = [
  "yes_pilot",
  "yes_input",
  "maybe_depends_month",
  "no",
] as const;

// ---------- Option lists for UI (canonical) ----------
export const TOOLS_COMMUNICATION = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone calls" },
  { value: "instagram_dm", label: "Instagram DMs" },
  { value: "other", label: "Other" },
] as const;

export const TOOLS_CALENDAR = [
  {
    value: "google_outlook_apple",
    label: "Google Calendar / Outlook / Apple Calendar",
  },
  { value: "paper_diary", label: "Paper diary / printed calendar / wall planner" },
  { value: "whiteboard", label: "A whiteboard" },
  { value: "other", label: "Other" },
] as const;

export const TOOLS_DOCUMENTS = [
  { value: "word_pdf", label: "Word docs or PDFs" },
  { value: "gdocs_sheets_excel", label: "Google Docs / Sheets or Excel" },
  { value: "website", label: "On our website" },
  { value: "other", label: "Other" },
] as const;

export const SOFT_HOLD_DURATION = [
  { value: "24h", label: "24 hours" },
  { value: "48h", label: "48 hours" },
  { value: "3d", label: "3 days" },
  { value: "1w", label: "1 week" },
  { value: "other", label: "Other" },
] as const;

export const TOOLS_INVOICING = [
  { value: "eft_manual", label: "EFT with manual invoice" },
  { value: "xero_sage_qb", label: "Xero / Sage / QuickBooks" },
  {
    value: "yoco_snapscan_zapper_payfast",
    label: "Yoco / SnapScan / Zapper / PayFast",
  },
  { value: "stripe_intl", label: "Stripe / international card processor" },
] as const;

export const INFO_LOCATION = [
  {
    value: "pdf_pack",
    label: "Our wedding info pack PDF (the document we email to inquiries)",
  },
  { value: "in_head", label: "In my head, I just know" },
  { value: "website", label: "On our website" },
  { value: "instagram", label: "Our Instagram highlights or posts" },
  {
    value: "whatsapp_catalogue",
    label: "WhatsApp Business catalogue / past WhatsApp messages",
  },
  { value: "gdoc", label: "A Google Doc / shared drive folder" },
  { value: "spreadsheet", label: "A spreadsheet" },
  { value: "paper_file", label: "A paper file or printed binder" },
  { value: "ask_colleague", label: "I ask a colleague or the owner" },
  { value: "other", label: "Other" },
] as const;

export const HOLD_POLICY = [
  {
    value: "soft_hold",
    label: "We give them a “soft hold” for a few days while they decide",
  },
  {
    value: "first_come_first_served",
    label: "We tell them the date is available but it’s first-come-first-served",
  },
  {
    value: "deposit_immediately",
    label: "We require a deposit immediately to lock the date",
  },
  {
    value: "waiting_list",
    label:
      "We keep a “waiting list” of other interested couples for the same date",
  },
  {
    value: "no_formal_hold",
    label: "We don’t formally hold dates, we just see who pays first",
  },
  { value: "other", label: "Other" },
] as const;

export const VENUE_INFO_WILLINGNESS = [
  { value: "pricing_packages", label: "Pricing and packages" },
  { value: "capacity_layout", label: "Capacity, layout, and floor plans" },
  {
    value: "sleeps_accommodation",
    label: "Sleeps in each cottage / accommodation specifics",
  },
  { value: "power_generator", label: "Power and generator specs" },
  {
    value: "vendor_rules",
    label: "Vendor rules (BYO, preferred suppliers, restrictions)",
  },
  { value: "photos", label: "High-res photos of every space" },
  { value: "sample_contracts", label: "Sample contracts / T&Cs" },
  { value: "reviews", label: "Past reviews / testimonials" },
  { value: "all_self_service", label: "All of it. The more self-service the better" },
  {
    value: "none_inquire_first",
    label: "None of the above. I want couples to inquire first",
  },
] as const;

export const SOFTWARE_CATEGORIES = [
  {
    value: "accommodation_pms",
    label:
      "Accommodation / PMS software (Nightsbridge, Cloudbeds, ResRequest, etc.)",
  },
  { value: "accounting", label: "Accounting (Xero, Sage, QuickBooks)" },
  {
    value: "calendar_paid",
    label: "Calendar / scheduling tool beyond Google Calendar",
  },
  {
    value: "events_crm",
    label: "A booking / CRM tool specifically for events or weddings",
  },
  { value: "email_marketing", label: "Email marketing (Mailchimp, etc.)" },
  { value: "other", label: "Other" },
  { value: "none", label: "No, we don’t pay for any software" },
] as const;

// ---------- Zod schema ----------

const optStr = z.string().max(2000).nullable().optional();
const optShortStr = z.string().max(500).nullable().optional();
const requiredText = z.string().min(1).max(5000);

const whatsappRegex = /^(\+27|0)[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{4}$/;

// All fields are optional except the two we need to make a response actionable
// (peakWeddingsPerMonth, callInterest). Server still validates formats for
// email / WhatsApp when provided. Conditional "Other → fill the text"
// nag rules removed: respondents can skip any question.
export const submitSchema = z
  .object({
    source: z.string().min(1).max(64).default("direct"),
    venueSlug: z.string().max(128).nullable().optional(),

    // Q1 (now optional, any of the buckets or null)
    peakWeddingsPerMonth: z
      .enum(["0-1", "2-3", "4-6", "7-10", "10+"])
      .nullable()
      .optional(),
    // Q2
    eventMix: z.enum(EVENT_MIX).nullable().optional(),
    // Q3
    dayToDayOwner: z.enum(DAY_TO_DAY_OWNER).nullable().optional(),
    dayToDayOwnerOther: optShortStr,
    // Q4
    bookingSource: z.enum(BOOKING_SOURCE).nullable().optional(),
    bookingSourceOther: optShortStr,
    // Q5
    toolsCommunication: z.array(z.string()).default([]),
    toolsCalendar: z.array(z.string()).default([]),
    toolsDocuments: z.array(z.string()).default([]),
    toolsBookingSoftwareName: optShortStr,
    toolsInvoicing: z.array(z.string()).default([]),
    toolsOther: optShortStr,
    toolsCommunicationOther: optShortStr,
    toolsCalendarOther: optShortStr,
    toolsDocumentsOther: optShortStr,
    // Q6
    infoLocation: z.array(z.string()).default([]),
    infoLocationOther: optShortStr,
    // Q7
    updatePropagation: z.enum(UPDATE_PROPAGATION).nullable().optional(),
    updatePropagationOnePlaceWhere: optShortStr,
    // Q8
    adminHoursPerWedding: z.enum(ADMIN_HOURS_PER_WEDDING).nullable().optional(),
    // Q9
    pctRepetitive: z.enum(PCT_REPETITIVE).nullable().optional(),
    // Q10
    holdPolicy: z.array(z.string()).default([]),
    holdPolicyOther: optShortStr,
    softHoldDuration: z
      .enum(["24h", "48h", "3d", "1w", "other"])
      .nullable()
      .optional(),
    softHoldDurationOther: optShortStr,
    // Q11
    conversionRate: z.enum(CONVERSION_RATE).nullable().optional(),
    // Q12 — open frustration (was required, now optional)
    mostFrustrating: optStr,
    // Section 4 (all optional)
    visionSkipped: z.boolean().default(false),
    realtimeAvailability: z.enum(REALTIME_AVAILABILITY).nullable().optional(),
    coupleDirectBooking: z.enum(COUPLE_DIRECT_BOOKING).nullable().optional(),
    holdReleaseWaitlist: z.enum(HOLD_RELEASE_WAITLIST).nullable().optional(),
    venueInfoWillingness: z.array(z.string()).default([]),
    // Q17 — software currently paid for
    softwareCategories: z.array(z.string()).default([]),
    softwareOther: optShortStr,
    eventsSoftwareReview: optStr,
    // Q18 — willingness to pay (was required, now optional)
    willingnessToPay: optStr,
    // Q19 (now optional)
    callInterest: z.enum(CALL_INTEREST).nullable().optional(),
    // Q20 — open-text "anything else?"
    additionalComments: optStr,
    // Q21 — contact. Venue name is required so we can attribute the response
    // to a specific wine farm during outreach follow-up.
    venueName: z
      .string()
      .trim()
      .min(1, "Please add your venue name")
      .max(200),
    contactName: optShortStr,
    contactRole: optShortStr,
    whatsapp: optShortStr,
    email: optShortStr,

    completionTimeSeconds: z.number().int().min(0).max(86_400),
    website: z.string().max(0, "spam"),
  })
  .superRefine((v, ctx) => {
    // Data integrity: "None" software can't coexist with other picks
    if (
      v.softwareCategories.includes("none") &&
      v.softwareCategories.length > 1
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["softwareCategories"],
        message: "“None” can’t be combined with other answers",
      });
    }
    // No email/WhatsApp format checks: accept whatever respondents type so
    // the UX doesn't bounce them on edge cases (international numbers,
    // unusual TLDs, etc.).
  });

export type SubmitPayload = z.infer<typeof submitSchema>;
export { whatsappRegex };
