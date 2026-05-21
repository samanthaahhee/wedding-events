import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { responses } from "@/lib/schema";
import {
  BOOKING_SOURCE,
  CALL_INTEREST,
  COUPLE_DIRECT_BOOKING,
  DAY_TO_DAY_OWNER,
  EVENT_MIX,
  HOLD_POLICY,
  HOLD_RELEASE_WAITLIST,
  INFO_LOCATION,
  PEAK_WEDDINGS_PER_MONTH,
  REALTIME_AVAILABILITY,
  SOFTWARE_CATEGORIES,
  TOOLS_CALENDAR,
  TOOLS_COMMUNICATION,
  TOOLS_DOCUMENTS,
  TOOLS_INVOICING,
  UPDATE_PROPAGATION,
  VENUE_INFO_WILLINGNESS,
  ADMIN_HOURS_PER_WEDDING,
  PCT_REPETITIVE,
  CONVERSION_RATE,
} from "@/lib/validation";
import { BarChart } from "./_components/bar";
import {
  InterviewReadyList,
  type WarmLead,
} from "./_components/interview-ready";
import { LogoutButton } from "./_components/logout-button";
import {
  ResponsesTable,
  type ResponseSummaryRow,
} from "./_components/responses-table";

export const dynamic = "force-dynamic";

// -------- Label maps --------

const PEAK_LABEL: Record<(typeof PEAK_WEDDINGS_PER_MONTH)[number], string> = {
  "0-1": "0–1",
  "2-3": "2–3",
  "4-6": "4–6",
  "7-10": "7–10",
  "10+": "10+",
};

const EVENT_MIX_LABEL: Record<(typeof EVENT_MIX)[number], string> = {
  mostly_weddings: "Mostly weddings (80%+)",
  mainly_weddings: "Mainly weddings",
  half_half: "Half and half",
  mainly_other: "Mainly other events",
  almost_no_weddings: "Almost no weddings",
};

const OWNER_LABEL: Record<(typeof DAY_TO_DAY_OWNER)[number], string> = {
  owner: "Owner / Director",
  in_house_coordinator: "In-house Coordinator",
  ops_manager: "Ops / Venue Manager",
  external_planner_most: "External planner",
  split_50_50: "Split 50/50",
  just_me: "Just me",
  other: "Other",
};

const BOOKING_LABEL: Record<(typeof BOOKING_SOURCE)[number], string> = {
  couples_direct: "Couples direct",
  mostly_couples: "Mostly couples",
  half_half: "Half/half",
  mostly_planners: "Mostly planners",
  almost_planners: "Almost always planners",
  marketplaces: "Marketplaces",
  other: "Other",
};

const UPDATE_LABEL: Record<(typeof UPDATE_PROPAGATION)[number], string> = {
  one_place: "One place, everyone sees",
  multiple_places: "Multiple places",
  verbal: "Verbally",
  out_of_date: "Out of date",
  not_sure: "Not sure",
};

const HOURS_LABEL: Record<(typeof ADMIN_HOURS_PER_WEDDING)[number], string> = {
  under_5: "Under 5 hours",
  "5_10": "5–10 hours",
  "10_20": "10–20 hours",
  "20_40": "20–40 hours",
  "40_plus": "40+ hours",
  no_idea: "Couldn’t say",
};

const PCT_LABEL: Record<(typeof PCT_REPETITIVE)[number], string> = {
  under_20: "<20%",
  "20_40": "20–40%",
  "40_60": "40–60%",
  "60_80": "60–80%",
  over_80: ">80%",
};

const CONVERSION_LABEL: Record<(typeof CONVERSION_RATE)[number], string> = {
  "1_or_fewer": "1 or fewer",
  "2_3": "2–3",
  "4_5": "4–5",
  "6_7": "6–7",
  "8_plus": "8+",
  no_idea: "No idea",
};

const REALTIME_LABEL: Record<(typeof REALTIME_AVAILABILITY)[number], string> = {
  very_helpful_fully_public: "Very helpful, fully public",
  helpful_gated: "Helpful, gated",
  neutral: "Neutral",
  concern: "A concern",
  no: "Wouldn’t want it",
};

const COUPLE_DIRECT_LABEL: Record<(typeof COUPLE_DIRECT_BOOKING)[number], string> = {
  full_automation: "Full automation",
  partial: "Partial / straightforward only",
  review_each: "Review each",
  human_conversation_required: "Human conversation required",
  no_trust: "No trust",
};

const WAITLIST_LABEL: Record<(typeof HOLD_RELEASE_WAITLIST)[number], string> = {
  yes: "Yes",
  maybe_with_control: "Maybe, with control",
  manual_decision: "Manual decision",
  no: "No",
  not_sure: "Not sure",
};

const CALL_LABEL: Record<(typeof CALL_INTEREST)[number], string> = {
  yes_pilot: "Yes — pilot",
  yes_input: "Yes — input",
  maybe_depends_month: "Maybe",
  no: "No",
};

// -------- Helpers --------

function countBy<T extends string>(
  list: T[],
  values: readonly T[],
  labelMap: Record<T, string>,
): { label: string; count: number; value: T }[] {
  return values.map((v) => ({
    value: v,
    label: labelMap[v],
    count: list.filter((x) => x === v).length,
  }));
}

function countByArray(
  rows: { value: string | null }[],
  values: readonly { value: string; label: string }[],
): { label: string; count: number; value: string }[] {
  return values.map((opt) => ({
    value: opt.value,
    label: opt.label,
    count: rows.filter((r) => r.value === opt.value).length,
  }));
}

function countTags(
  rows: Array<string[] | null>,
  values: readonly { value: string; label: string }[],
): { label: string; count: number }[] {
  return values.map((opt) => ({
    label: opt.label,
    count: rows.filter((r) => r?.includes(opt.value) ?? false).length,
  }));
}

// -------- Page --------

export default async function AdminDashboard() {
  const all = await db
    .select()
    .from(responses)
    .orderBy(desc(responses.createdAt));

  const total = all.length;

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = all.filter((r) => r.createdAt >= oneWeekAgo).length;

  const warmLeads: WarmLead[] = all
    .filter(
      (r) =>
        (r.callInterest === "yes_pilot" || r.callInterest === "yes_input") &&
        ((r.email && r.email.trim().length > 0) ||
          (r.whatsapp && r.whatsapp.trim().length > 0)),
    )
    .map((r) => ({
      id: r.id,
      venueName: r.venueName,
      contactName: r.contactName,
      contactRole: r.contactRole,
      email: r.email,
      whatsapp: r.whatsapp,
      callInterest: r.callInterest,
      createdAt: r.createdAt.toISOString(),
      followedUp: r.followedUp,
    }));

  const interviewReadyCount = warmLeads.length;

  const tableRows: ResponseSummaryRow[] = all.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    source: r.source,
    venueName: r.venueName,
    contactName: r.contactName,
    dayToDayOwner: r.dayToDayOwner,
    callInterest: r.callInterest,
    adminHoursPerWedding: r.adminHoursPerWedding,
    full: {
      id: r.id,
      created_at: r.createdAt.toISOString(),
      source: r.source,
      venue_slug: r.venueSlug,
      peak_weddings_per_month: r.peakWeddingsPerMonth,
      event_mix: r.eventMix,
      day_to_day_owner: r.dayToDayOwner,
      day_to_day_owner_other: r.dayToDayOwnerOther,
      booking_source: r.bookingSource,
      booking_source_other: r.bookingSourceOther,
      tools_communication: r.toolsCommunication,
      tools_calendar: r.toolsCalendar,
      tools_documents: r.toolsDocuments,
      tools_booking_software_name: r.toolsBookingSoftwareName,
      tools_invoicing: r.toolsInvoicing,
      tools_other: r.toolsOther,
      info_location: r.infoLocation,
      info_location_other: r.infoLocationOther,
      update_propagation: r.updatePropagation,
      update_propagation_one_place_where: r.updatePropagationOnePlaceWhere,
      admin_hours_per_wedding: r.adminHoursPerWedding,
      pct_repetitive: r.pctRepetitive,
      hold_policy: r.holdPolicy,
      hold_policy_other: r.holdPolicyOther,
      conversion_rate: r.conversionRate,
      most_frustrating: r.mostFrustrating,
      vision_skipped: r.visionSkipped,
      realtime_availability: r.realtimeAvailability,
      couple_direct_booking: r.coupleDirectBooking,
      hold_release_waitlist: r.holdReleaseWaitlist,
      venue_info_willingness: r.venueInfoWillingness,
      software_categories: r.softwareCategories,
      software_other: r.softwareOther,
      events_software_review: r.eventsSoftwareReview,
      willingness_to_pay: r.willingnessToPay,
      call_interest: r.callInterest,
      venue_name: r.venueName,
      contact_name: r.contactName,
      contact_role: r.contactRole,
      whatsapp: r.whatsapp,
      email: r.email,
      completion_time_seconds: r.completionTimeSeconds,
      followed_up: r.followedUp,
    },
  }));

  // Question aggregates
  const peak = countBy(
    all.map((r) => r.peakWeddingsPerMonth as (typeof PEAK_WEDDINGS_PER_MONTH)[number]),
    PEAK_WEDDINGS_PER_MONTH,
    PEAK_LABEL,
  );
  const mix = countBy(
    all.map((r) => r.eventMix as (typeof EVENT_MIX)[number]),
    EVENT_MIX,
    EVENT_MIX_LABEL,
  );
  const owner = countBy(
    all.map((r) => r.dayToDayOwner as (typeof DAY_TO_DAY_OWNER)[number]),
    DAY_TO_DAY_OWNER,
    OWNER_LABEL,
  );
  const booking = countBy(
    all.map((r) => r.bookingSource as (typeof BOOKING_SOURCE)[number]),
    BOOKING_SOURCE,
    BOOKING_LABEL,
  );
  const update = countBy(
    all.map((r) => r.updatePropagation as (typeof UPDATE_PROPAGATION)[number]),
    UPDATE_PROPAGATION,
    UPDATE_LABEL,
  );
  const hours = countBy(
    all.map((r) => r.adminHoursPerWedding as (typeof ADMIN_HOURS_PER_WEDDING)[number]),
    ADMIN_HOURS_PER_WEDDING,
    HOURS_LABEL,
  );
  const repetitive = countBy(
    all.map((r) => r.pctRepetitive as (typeof PCT_REPETITIVE)[number]),
    PCT_REPETITIVE,
    PCT_LABEL,
  );
  const conversion = countBy(
    all.map((r) => r.conversionRate as (typeof CONVERSION_RATE)[number]),
    CONVERSION_RATE,
    CONVERSION_LABEL,
  );
  const call = countBy(
    all.map((r) => r.callInterest as (typeof CALL_INTEREST)[number]),
    CALL_INTEREST,
    CALL_LABEL,
  );

  // Multi-select tags
  const toolsComm = countTags(
    all.map((r) => r.toolsCommunication),
    TOOLS_COMMUNICATION,
  );
  const toolsCal = countTags(
    all.map((r) => r.toolsCalendar),
    TOOLS_CALENDAR,
  );
  const toolsDoc = countTags(
    all.map((r) => r.toolsDocuments),
    TOOLS_DOCUMENTS,
  );
  const toolsInv = countTags(
    all.map((r) => r.toolsInvoicing),
    TOOLS_INVOICING,
  );
  const infoLoc = countTags(
    all.map((r) => r.infoLocation),
    INFO_LOCATION,
  );
  const holdPol = countTags(all.map((r) => r.holdPolicy), HOLD_POLICY);
  const software = countTags(
    all.map((r) => r.softwareCategories),
    SOFTWARE_CATEGORIES,
  );

  // Section 4 only counts completers
  const visionCompleters = all.filter((r) => !r.visionSkipped);
  const realtime = visionCompleters
    .filter((r) => r.realtimeAvailability !== null)
    .map((r) => ({ value: r.realtimeAvailability }));
  const realtimeRows = countByArray(
    realtime,
    REALTIME_AVAILABILITY.map((v) => ({ value: v, label: REALTIME_LABEL[v] })),
  );
  const coupleDirect = visionCompleters
    .filter((r) => r.coupleDirectBooking !== null)
    .map((r) => ({ value: r.coupleDirectBooking }));
  const coupleDirectRows = countByArray(
    coupleDirect,
    COUPLE_DIRECT_BOOKING.map((v) => ({
      value: v,
      label: COUPLE_DIRECT_LABEL[v],
    })),
  );
  const waitlist = visionCompleters
    .filter((r) => r.holdReleaseWaitlist !== null)
    .map((r) => ({ value: r.holdReleaseWaitlist }));
  const waitlistRows = countByArray(
    waitlist,
    HOLD_RELEASE_WAITLIST.map((v) => ({ value: v, label: WAITLIST_LABEL[v] })),
  );
  const venueInfo = countTags(
    visionCompleters.map((r) => r.venueInfoWillingness),
    VENUE_INFO_WILLINGNESS,
  );

  // Free-text feeds — both columns are now nullable, narrow before passing on.
  const frustrations = all
    .filter(
      (r): r is typeof r & { mostFrustrating: string } =>
        !!r.mostFrustrating && r.mostFrustrating.trim().length > 0,
    )
    .map((r) => ({
      id: r.id,
      text: r.mostFrustrating,
      venue: r.venueName,
      createdAt: r.createdAt.toISOString(),
    }));

  const willingness = all
    .filter(
      (r): r is typeof r & { willingnessToPay: string } =>
        !!r.willingnessToPay && r.willingnessToPay.trim().length > 0,
    )
    .map((r) => ({
      id: r.id,
      text: r.willingnessToPay,
      venue: r.venueName,
      createdAt: r.createdAt.toISOString(),
    }));

  const visionCompletionPct =
    total > 0 ? Math.round((visionCompleters.length / total) * 100) : 0;

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-8 sm:py-12">
      {/* Header */}
      <header className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-section-title text-lk-ink">Survey responses</h1>
          <p className="text-section-subtitle text-lk-ink-muted mt-1">
            {total} response{total === 1 ? "" : "s"}
            {total > 0 ? ` · ${interviewReadyCount} interview-ready` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/export"
            className="inline-flex items-center rounded-[10px] border border-lk-line bg-lk-surface px-3.5 py-2 text-helper-text text-lk-ink transition-colors duration-150 hover:border-lk-ink"
          >
            Export CSV
          </a>
          <LogoutButton />
        </div>
      </header>

      {total === 0 ? (
        <div className="rounded-[16px] border border-lk-line bg-lk-surface p-8 text-center">
          <p className="text-question-title text-lk-ink">No responses yet.</p>
          <p className="text-helper-text text-lk-ink-muted mt-2">
            Share{" "}
            <code className="rounded bg-lk-surface-muted px-1.5 py-0.5">
              /survey
            </code>{" "}
            with venues. As they submit, results show up here.
          </p>
        </div>
      ) : (
        <>
          {/* Top stats */}
          <section className="mb-12 grid gap-3 sm:grid-cols-3">
            <StatCard label="Total responses" value={total} />
            <StatCard label="New this week" value={thisWeek} />
            <StatCard
              label="Interview-ready"
              value={interviewReadyCount}
              hint={
                interviewReadyCount > 0
                  ? "Pilot or Input + contact details"
                  : undefined
              }
            />
          </section>

          {/* Interview-ready */}
          <Section title="Interview-ready" subtitle="Warm leads to follow up with">
            <InterviewReadyList leads={warmLeads} />
          </Section>

          {/* Q1–Q4: Your venue */}
          <Section title="Your venue (Q1–Q4)" subtitle="Section 1 aggregates">
            <Card2>
              <Mini title="Q1 — Peak weddings per month">
                <BarChart rows={peak} total={total} sort={false} />
              </Mini>
              <Mini title="Q2 — Event mix">
                <BarChart rows={mix} total={total} sort={false} />
              </Mini>
              <Mini title="Q3 — Day-to-day owner">
                <BarChart rows={owner} total={total} />
              </Mini>
              <Mini title="Q4 — Booking source">
                <BarChart rows={booking} total={total} />
              </Mini>
            </Card2>
          </Section>

          {/* Q5–Q7: How you work */}
          <Section title="How you work (Q5–Q7)" subtitle="Section 2 aggregates">
            <Card2>
              <Mini title="Q5 — Tools: Communication">
                <BarChart rows={toolsComm} total={total} />
              </Mini>
              <Mini title="Q5 — Tools: Calendar">
                <BarChart rows={toolsCal} total={total} />
              </Mini>
              <Mini title="Q5 — Tools: Documents">
                <BarChart rows={toolsDoc} total={total} />
              </Mini>
              <Mini title="Q5 — Tools: Invoicing">
                <BarChart rows={toolsInv} total={total} />
              </Mini>
              <Mini title="Q6 — Where the info lives">
                <BarChart rows={infoLoc} total={total} />
              </Mini>
              <Mini title="Q7 — Update propagation">
                <BarChart rows={update} total={total} sort={false} />
              </Mini>
            </Card2>
          </Section>

          {/* Section 3 */}
          <Section
            title="Operational pain (Q8–Q12)"
            subtitle="Section 3 aggregates"
          >
            <Card2>
              <Mini title="Q8 — Admin hours / wedding">
                <BarChart rows={hours} total={total} sort={false} />
              </Mini>
              <Mini title="Q9 — % repeat work">
                <BarChart rows={repetitive} total={total} sort={false} />
              </Mini>
              <Mini title="Q10 — Hold policy">
                <BarChart rows={holdPol} total={total} />
              </Mini>
              <Mini title="Q11 — Conversion rate">
                <BarChart rows={conversion} total={total} sort={false} />
              </Mini>
            </Card2>
            <Mini title="Q12 — What drives you mad (open text)">
              <TextFeed items={frustrations} />
            </Mini>
          </Section>

          {/* Section 4 — only completers */}
          <Section
            title="Vision check (Q13–Q16)"
            subtitle={`${visionCompleters.length} of ${total} completed this section (${visionCompletionPct}%)`}
          >
            {visionCompleters.length === 0 ? (
              <p className="text-helper-text text-lk-ink-muted italic">
                Nobody has answered the vision questions yet.
              </p>
            ) : (
              <Card2>
                <Mini title="Q13 — Real-time availability">
                  <BarChart
                    rows={realtimeRows}
                    total={visionCompleters.length}
                    sort={false}
                  />
                </Mini>
                <Mini title="Q14 — Couple-direct booking">
                  <BarChart
                    rows={coupleDirectRows}
                    total={visionCompleters.length}
                    sort={false}
                  />
                </Mini>
                <Mini title="Q15 — Auto-released waitlist">
                  <BarChart
                    rows={waitlistRows}
                    total={visionCompleters.length}
                    sort={false}
                  />
                </Mini>
                <Mini title="Q16 — Venue info willingness">
                  <BarChart rows={venueInfo} total={visionCompleters.length} />
                </Mini>
              </Card2>
            )}
          </Section>

          {/* Section 5 */}
          <Section title="Software & money (Q17–Q18)" subtitle="Section 5 aggregates">
            <Mini title="Q17 — Software currently paid for">
              <BarChart rows={software} total={total} />
            </Mini>
            <Mini title="Q18 — What would make you pay (open text)">
              <TextFeed items={willingness} />
            </Mini>
          </Section>

          {/* Section 6 */}
          <Section title="Next steps (Q19)" subtitle="Section 6 aggregates">
            <Mini title="Q19 — Open to a call?">
              <BarChart
                rows={call.map((c) => ({
                  ...c,
                  highlight: c.value === "yes_pilot" || c.value === "yes_input",
                }))}
                total={total}
                sort={false}
              />
            </Mini>
          </Section>

          {/* All responses table */}
          <Section title="All responses" subtitle="Click View for the full row">
            <ResponsesTable rows={tableRows} />
          </Section>
        </>
      )}
    </main>
  );
}

// -------- Layout primitives --------

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-[16px] border border-lk-line bg-lk-surface p-5">
      <p className="text-helper-text text-lk-ink-muted">{label}</p>
      <p className="mt-1 text-section-title text-lk-ink">{value}</p>
      {hint && (
        <p className="text-helper-text text-lk-ink-muted mt-1">{hint}</p>
      )}
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <header className="mb-4">
        <h2 className="text-question-title text-lk-ink">{title}</h2>
        {subtitle && (
          <p className="text-helper-text text-lk-ink-muted mt-1">{subtitle}</p>
        )}
      </header>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Card2({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2">{children}</div>;
}

function Mini({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-lk-line bg-lk-surface p-5">
      <p className="text-helper-text text-lk-ink-muted mb-3">{title}</p>
      {children}
    </div>
  );
}

function TextFeed({
  items,
}: {
  items: { id: string; text: string; venue: string | null; createdAt: string }[];
}) {
  if (items.length === 0) {
    return (
      <p className="text-helper-text text-lk-ink-muted italic">No answers yet.</p>
    );
  }
  return (
    <ul className="max-h-[420px] overflow-y-auto pr-2">
      {items.map((it) => (
        <li
          key={it.id}
          className="border-b border-lk-line py-3 last:border-0 last:pb-0 first:pt-0"
        >
          <p className="text-body text-lk-ink whitespace-pre-wrap">{it.text}</p>
          <p className="text-caption text-lk-ink-muted mt-1">
            {it.venue || "Anonymous"} ·{" "}
            {new Date(it.createdAt).toLocaleDateString("en-ZA", {
              day: "numeric",
              month: "short",
            })}
          </p>
        </li>
      ))}
    </ul>
  );
}
