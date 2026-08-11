"use client";

import { useState } from "react";

export type ResponseSummaryRow = {
  id: string;
  createdAt: string;
  source: string;
  venueName: string | null;
  contactName: string | null;
  dayToDayOwner: string | null;
  callInterest: string | null;
  adminHoursPerWedding: string | null;
  full: Record<string, unknown>;
};

// ---------- Label maps ----------

const OWNER_LABEL: Record<string, string> = {
  owner: "Owner / Director of the venue",
  in_house_coordinator:
    "In-house Events / Bookings Coordinator (employed by us)",
  ops_manager: "In-house Operations / Venue Manager",
  external_planner_most:
    "The couple’s external wedding planner does most of it; we handle logistics",
  split_50_50: "It’s split roughly 50/50 between us and the couple’s planner",
  just_me: "Just me, doing everything",
  other: "Other",
};

const CALL_LABEL: Record<string, string> = {
  yes_pilot: "Yes — and I’d consider being one of the first pilot venues",
  yes_input: "Yes — happy to give input even if I don’t end up using it",
  maybe_depends_month: "Maybe — depends what month you’re asking",
  no: "No thanks",
};

const HOURS_LABEL: Record<string, string> = {
  under_5: "Under 5 hours",
  "5_10": "5–10 hours",
  "10_20": "10–20 hours",
  "20_40": "20–40 hours",
  "40_plus": "40+ hours",
  no_idea: "Honestly couldn’t say",
};

const PEAK_LABEL: Record<string, string> = {
  "0-1": "0–1",
  "2-3": "2–3",
  "4-6": "4–6",
  "7-10": "7–10",
  "10+": "10+",
};

const EVENT_MIX_LABEL: Record<string, string> = {
  mostly_weddings: "Mostly weddings (80%+)",
  mainly_weddings: "Mainly weddings, some other events",
  half_half: "About half and half",
  mainly_other: "Mainly other events, some weddings",
  almost_no_weddings: "Almost no weddings",
};

const BOOKING_SOURCE_LABEL: Record<string, string> = {
  couples_direct: "Couples directly (they find us and reach out themselves)",
  mostly_couples: "Mostly couples direct, occasionally a wedding planner",
  half_half: "About half couples, half wedding planners",
  mostly_planners: "Mostly wedding planners on behalf of couples",
  almost_planners:
    "Almost always through a wedding planner or coordinator",
  marketplaces:
    "Mostly through wedding venue marketplaces or aggregators",
  other: "Other",
};

const TOOLS_COMMUNICATION_LABEL: Record<string, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  phone: "Phone calls",
  instagram_dm: "Instagram DMs",
  other: "Other",
};

const TOOLS_CALENDAR_LABEL: Record<string, string> = {
  google_outlook_apple: "Google Calendar / Outlook / Apple Calendar",
  paper_diary: "Paper diary / printed calendar / wall planner",
  whiteboard: "A whiteboard",
  other: "Other",
};

const TOOLS_DOCUMENTS_LABEL: Record<string, string> = {
  word_pdf: "Word docs or PDFs",
  gdocs_sheets_excel: "Google Docs / Sheets or Excel",
  website: "On our website",
  other: "Other",
};

const TOOLS_INVOICING_LABEL: Record<string, string> = {
  eft_manual: "EFT with manual invoice",
  xero_sage_qb: "Xero / Sage / QuickBooks",
  yoco_snapscan_zapper_payfast:
    "Yoco / SnapScan / Zapper / PayFast",
  stripe_intl: "Stripe / international card processor",
  other: "Other",
};

const INFO_LOCATION_LABEL: Record<string, string> = {
  pdf_pack: "Our wedding info pack PDF",
  in_head: "In my head, I just know",
  website: "On our website",
  instagram: "Our Instagram highlights or posts",
  whatsapp_catalogue:
    "WhatsApp Business catalogue / past WhatsApp messages",
  gdoc: "A Google Doc / shared drive folder",
  spreadsheet: "A spreadsheet",
  paper_binder: "A paper file or printed binder",
  ask_colleague: "I ask a colleague or the owner",
  other: "Other",
};

const UPDATE_PROPAGATION_LABEL: Record<string, string> = {
  one_place: "We update one place and everyone sees it",
  multiple_places:
    "We have to update multiple documents / places (and sometimes forget some)",
  verbal:
    "We mostly tell people verbally / in conversation as it comes up",
  out_of_date:
    "Honestly, things get out of date and we just correct as needed",
  not_sure: "Not sure / haven’t thought about it",
};

const PCT_REPETITIVE_LABEL: Record<string, string> = {
  under_20: "Less than 20%",
  "20_40": "20–40%",
  "40_60": "40–60%",
  "60_80": "60–80%",
  over_80: "More than 80%",
};

const HOLD_POLICY_LABEL: Record<string, string> = {
  soft_hold: "We give them a “soft hold” for a few days while they decide",
  first_come_first_served:
    "We tell them the date is available but it’s first-come-first-served",
  deposit_immediately:
    "We require a deposit immediately to lock the date",
  waiting_list:
    "We keep a “waiting list” of other interested couples for the same date",
  no_formal_hold:
    "We don’t formally hold dates, we just see who pays first",
  other: "Other",
};

const SOFT_HOLD_DURATION_LABEL: Record<string, string> = {
  "24h": "24 hours",
  "48h": "48 hours",
  "3d": "3 days",
  "1w": "1 week",
  other: "Other",
};

const CONVERSION_RATE_LABEL: Record<string, string> = {
  "1_or_fewer": "1 or fewer",
  "2_3": "2–3",
  "4_5": "4–5",
  "6_7": "6–7",
  "8_plus": "8+",
  no_idea: "Honestly no idea",
};

const REALTIME_LABEL: Record<string, string> = {
  very_helpful_fully_public:
    "Very helpful (fewer “is this date free?” inquiries) and we’d want it fully public",
  helpful_gated:
    "Helpful, but we’d want couples to inquire before seeing pricing/availability",
  neutral: "Neutral",
  concern:
    "A concern. We prefer couples to inquire first so we can qualify them",
  no: "We wouldn’t want this at all",
};

const COUPLE_DIRECT_LABEL: Record<string, string> = {
  full_automation:
    "I’d love that. Let the platform handle it, I’ll just confirm",
  partial:
    "I’d like it for some bookings (e.g. straightforward ones) but want control over premium/complex ones",
  review_each:
    "I’d want to review every booking before it’s confirmed, even if the couple completes the steps on the platform",
  human_conversation_required:
    "I want every booking to involve a human conversation before any contract or payment",
  no_trust: "I don’t trust automated booking for weddings",
};

const WAITLIST_LABEL: Record<string, string> = {
  yes: "Yes. That’s exactly the kind of automation I want",
  maybe_with_control:
    "Maybe, only if I have full control over the timing and who’s on the waitlist",
  manual_decision:
    "I’d want to be notified and decide manually each time",
  no: "No. This needs human judgement, not automation",
  not_sure: "Not sure",
};

const VENUE_INFO_LABEL: Record<string, string> = {
  pricing_packages: "Pricing and packages",
  capacity_layout: "Capacity and layout",
  sleeps_accommodation: "Accommodation / sleeps",
  power_generator: "Power / generator info",
  vendor_rules: "Vendor rules and preferred suppliers",
  photos: "Photos of the venue in various setups",
  sample_contracts: "Sample contracts / T&Cs",
  reviews: "Reviews / testimonials from past couples",
  all_self_service: "All of it. The more self-service the better",
  none_inquire_first: "None of the above. I want couples to inquire first",
};

const SOFTWARE_LABEL: Record<string, string> = {
  accommodation_pms: "Accommodation / PMS (e.g. Nightsbridge)",
  events_crm: "Events / bookings CRM (e.g. Perfect Venue, HoneyBook)",
  accounting: "Accounting (Xero, Sage, QuickBooks)",
  email_marketing: "Email marketing (Mailchimp, ConvertKit, etc.)",
  scheduling: "Scheduling (Calendly, Acuity, etc.)",
  other: "Other",
  none: "No, we don’t pay for any software",
};

// ---------- Question schema ----------

type Q =
  | { kind: "text"; label: string; value: string | null | undefined }
  | { kind: "list"; label: string; items: string[] }
  | { kind: "para"; label: string; value: string | null | undefined };

function labelArray(
  values: unknown,
  map: Record<string, string>,
): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((v) => map[String(v)] || String(v));
}

// ---------- Component ----------

export function ResponsesTable({ rows }: { rows: ResponseSummaryRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openRow = openId ? rows.find((r) => r.id === openId) : null;

  if (rows.length === 0) {
    return (
      <p className="text-helper-text text-lk-ink-muted italic">
        No responses yet.
      </p>
    );
  }

  const shortHours: Record<string, string> = {
    under_5: "<5h",
    "5_10": "5–10h",
    "10_20": "10–20h",
    "20_40": "20–40h",
    "40_plus": "40h+",
    no_idea: "—",
  };
  const shortCall: Record<string, string> = {
    yes_pilot: "Pilot",
    yes_input: "Input",
    maybe_depends_month: "Maybe",
    no: "No",
  };
  const shortOwner: Record<string, string> = {
    owner: "Owner",
    in_house_coordinator: "Coordinator",
    ops_manager: "Ops manager",
    external_planner_most: "External planner",
    split_50_50: "Split 50/50",
    just_me: "Just me",
    other: "Other",
  };

  return (
    <>
      <div className="overflow-x-auto rounded-[12px] border border-lk-line bg-lk-surface">
        <table className="w-full border-collapse text-helper-text">
          <thead className="border-b border-lk-line bg-lk-surface-muted text-left">
            <tr>
              <Th>Received</Th>
              <Th>Venue</Th>
              <Th>Contact</Th>
              <Th>Owner</Th>
              <Th>Hours / wedding</Th>
              <Th>Call</Th>
              <Th>Source</Th>
              <Th>&nbsp;</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-lk-line last:border-0">
                <Td>{formatDate(r.createdAt)}</Td>
                <Td>{r.venueName || "—"}</Td>
                <Td>{r.contactName || "—"}</Td>
                <Td>
                  {r.dayToDayOwner
                    ? shortOwner[r.dayToDayOwner] || r.dayToDayOwner
                    : "—"}
                </Td>
                <Td>
                  {r.adminHoursPerWedding
                    ? shortHours[r.adminHoursPerWedding] ||
                      r.adminHoursPerWedding
                    : "—"}
                </Td>
                <Td>
                  {r.callInterest
                    ? shortCall[r.callInterest] || r.callInterest
                    : "—"}
                </Td>
                <Td>
                  <span className="text-lk-ink-muted">{r.source}</span>
                </Td>
                <Td>
                  <button
                    type="button"
                    onClick={() => setOpenId(r.id)}
                    className="text-lk-accent hover:underline"
                  >
                    View
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openRow && (
        <ResponseDrawer row={openRow} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}

function ResponseDrawer({
  row,
  onClose,
}: {
  row: ResponseSummaryRow;
  onClose: () => void;
}) {
  const f = row.full;
  const g = (key: string) => f[key];
  const gs = (key: string): string | null => {
    const v = f[key];
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s.length ? s : null;
  };

  const visionSkipped = f.vision_skipped === true;
  const dayOwner = gs("day_to_day_owner");
  const bookingSource = gs("booking_source");
  const hasSoftHold = Array.isArray(g("hold_policy"))
    ? (g("hold_policy") as string[]).includes("soft_hold")
    : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-[720px] overflow-y-auto rounded-t-[16px] bg-lk-bg sm:rounded-[16px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-lk-line bg-lk-bg px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-question-title text-lk-ink">
                {row.venueName || "Anonymous response"}
              </h3>
              <p className="text-helper-text text-lk-ink-muted mt-1">
                {row.contactName ? `${row.contactName} · ` : ""}
                {formatFullDate(row.createdAt)}
                {row.source !== "direct" ? ` · via ${row.source}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-helper-text text-lk-ink-muted hover:text-lk-ink"
            >
              Close
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          <Section title="Your venue">
            <QText n={1} title="Peak-season events per month">
              {PEAK_LABEL[String(gs("peak_weddings_per_month"))] || "—"}
            </QText>
            <QText n={2} title="Wedding vs other event mix">
              {EVENT_MIX_LABEL[String(gs("event_mix"))] || "—"}
            </QText>
            <QText n={3} title="Who handles inquiry to event-day coordination">
              {dayOwner ? OWNER_LABEL[dayOwner] || dayOwner : "—"}
              {dayOwner === "other" && gs("day_to_day_owner_other")
                ? ` — ${gs("day_to_day_owner_other")}`
                : ""}
            </QText>
            <QText n={4} title="Who typically books with you">
              {bookingSource
                ? BOOKING_SOURCE_LABEL[bookingSource] || bookingSource
                : "—"}
              {bookingSource === "other" && gs("booking_source_other")
                ? ` — ${gs("booking_source_other")}`
                : ""}
            </QText>
          </Section>

          <Section title="How you work">
            <QGroup n={5} title="Tools used for the most recent wedding">
              <SubList
                label="Communication"
                items={labelArray(
                  g("tools_communication"),
                  TOOLS_COMMUNICATION_LABEL,
                )}
                otherText={gs("tools_communication_other")}
                otherIfIncludes={
                  Array.isArray(g("tools_communication")) &&
                  (g("tools_communication") as string[]).includes("other")
                }
              />
              <SubList
                label="Calendars / scheduling"
                items={labelArray(g("tools_calendar"), TOOLS_CALENDAR_LABEL)}
                otherText={gs("tools_calendar_other")}
                otherIfIncludes={
                  Array.isArray(g("tools_calendar")) &&
                  (g("tools_calendar") as string[]).includes("other")
                }
              />
              <SubList
                label="Documents / info"
                items={labelArray(
                  g("tools_documents"),
                  TOOLS_DOCUMENTS_LABEL,
                )}
                otherText={gs("tools_documents_other")}
                otherIfIncludes={
                  Array.isArray(g("tools_documents")) &&
                  (g("tools_documents") as string[]).includes("other")
                }
              />
              <SubItem
                label="Booking / venue software"
                value={gs("tools_booking_software_name") || "—"}
              />
              <SubList
                label="Invoicing / payments"
                items={labelArray(
                  g("tools_invoicing"),
                  TOOLS_INVOICING_LABEL,
                )}
              />
              {gs("tools_other") && (
                <SubItem label="Other tools" value={gs("tools_other")!} />
              )}
            </QGroup>

            <QGroup n={6} title="Where they look for venue info">
              <SubList
                label="Locations"
                items={labelArray(g("info_location"), INFO_LOCATION_LABEL)}
                otherText={gs("info_location_other")}
                otherIfIncludes={
                  Array.isArray(g("info_location")) &&
                  (g("info_location") as string[]).includes("other")
                }
              />
            </QGroup>

            <QText n={7} title="How updates propagate">
              {UPDATE_PROPAGATION_LABEL[String(gs("update_propagation"))] ||
                "—"}
              {gs("update_propagation") === "one_place" &&
              gs("update_propagation_one_place_where")
                ? ` — ${gs("update_propagation_one_place_where")}`
                : ""}
            </QText>
          </Section>

          <Section title="Operational pain">
            <QText n={8} title="Admin hours per wedding">
              {HOURS_LABEL[String(gs("admin_hours_per_wedding"))] || "—"}
            </QText>
            <QText n={9} title="% of admin that's repeat work">
              {PCT_REPETITIVE_LABEL[String(gs("pct_repetitive"))] || "—"}
            </QText>
            <QGroup n={10} title="What happens when a couple inquires">
              <SubList
                label="Policy"
                items={labelArray(g("hold_policy"), HOLD_POLICY_LABEL)}
                otherText={gs("hold_policy_other")}
                otherIfIncludes={
                  Array.isArray(g("hold_policy")) &&
                  (g("hold_policy") as string[]).includes("other")
                }
              />
              {hasSoftHold && (
                <SubItem
                  label="Soft hold duration"
                  value={
                    (SOFT_HOLD_DURATION_LABEL[
                      String(gs("soft_hold_duration"))
                    ] || "—") +
                    (gs("soft_hold_duration") === "other" &&
                    gs("soft_hold_duration_other")
                      ? ` — ${gs("soft_hold_duration_other")}`
                      : "")
                  }
                />
              )}
            </QGroup>
            <QText n={11} title="Inquiries → bookings out of 10">
              {CONVERSION_RATE_LABEL[String(gs("conversion_rate"))] || "—"}
            </QText>
            <QPara
              n={12}
              title="What drives them mad about managing a wedding"
              value={gs("most_frustrating")}
            />
          </Section>

          <Section title="Vision check">
            {visionSkipped ? (
              <p className="text-helper-text text-lk-ink-muted italic">
                Respondent skipped this section.
              </p>
            ) : (
              <>
                <QText
                  n={13}
                  title="If couples could see real-time availability publicly"
                >
                  {REALTIME_LABEL[String(gs("realtime_availability"))] || "—"}
                </QText>
                <QText
                  n={14}
                  title="Feelings on couples booking end-to-end on a platform"
                >
                  {COUPLE_DIRECT_LABEL[String(gs("couple_direct_booking"))] ||
                    "—"}
                </QText>
                <QText
                  n={15}
                  title="Auto-releasing held dates to the next couple on a waitlist"
                >
                  {WAITLIST_LABEL[String(gs("hold_release_waitlist"))] || "—"}
                </QText>
                <QGroup
                  n={16}
                  title="What they'd share on a public venue profile"
                >
                  <SubList
                    label="Willing to share"
                    items={labelArray(
                      g("venue_info_willingness"),
                      VENUE_INFO_LABEL,
                    )}
                  />
                </QGroup>
              </>
            )}
          </Section>

          <Section title="Software &amp; money">
            <QGroup n={17} title="Software they currently pay for">
              <SubList
                label="Categories"
                items={labelArray(g("software_categories"), SOFTWARE_LABEL)}
                otherText={gs("software_other")}
                otherIfIncludes={
                  Array.isArray(g("software_categories")) &&
                  (g("software_categories") as string[]).includes("other")
                }
              />
              {gs("events_software_review") && (
                <SubItem
                  label="Events CRM review"
                  value={gs("events_software_review")!}
                />
              )}
            </QGroup>
            <QPara
              n={18}
              title="What would make a tool worth paying for"
              value={gs("willingness_to_pay")}
            />
          </Section>

          <Section title="Next steps">
            <QText n={19} title="Open to a 15-minute call">
              {CALL_LABEL[String(gs("call_interest"))] || "—"}
            </QText>
            <QPara
              n={20}
              title="Anything else they wanted to add"
              value={gs("additional_comments")}
            />
            <QGroup n={21} title="Contact details">
              <SubItem label="Venue" value={gs("venue_name") || "—"} />
              {gs("contact_name") && (
                <SubItem label="Name" value={gs("contact_name")!} />
              )}
              {gs("contact_role") && (
                <SubItem label="Role" value={gs("contact_role")!} />
              )}
              {gs("whatsapp") && (
                <SubItem label="WhatsApp" value={gs("whatsapp")!} />
              )}
              {gs("email") && (
                <SubItem label="Email" value={gs("email")!} />
              )}
            </QGroup>
          </Section>

          <div className="mt-8 text-caption text-lk-ink-muted">
            Response ID: <span className="font-mono">{row.id}</span>
            {typeof f.completion_time_seconds === "number" ? (
              <>
                {" "}
                · Completed in {f.completion_time_seconds}s
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Drawer sub-components ----------

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h4
        className="text-caption text-lk-ink-muted mb-4"
        style={{
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
        }}
      >
        {title}
      </h4>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function QText({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-helper-text font-semibold text-lk-accent">
          {n}.
        </span>
        <p className="text-helper-text text-lk-ink-muted">{title}</p>
      </div>
      <p className="text-body text-lk-ink mt-1 ml-5">{children}</p>
    </div>
  );
}

function QPara({
  n,
  title,
  value,
}: {
  n: number;
  title: string;
  value: string | null;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-helper-text font-semibold text-lk-accent">
          {n}.
        </span>
        <p className="text-helper-text text-lk-ink-muted">{title}</p>
      </div>
      {value ? (
        <blockquote className="ml-5 mt-2 rounded-[8px] border-l-2 border-lk-line bg-lk-surface-muted px-4 py-3 text-body text-lk-ink whitespace-pre-wrap">
          {value}
        </blockquote>
      ) : (
        <p className="text-body text-lk-ink-muted italic mt-1 ml-5">
          (not answered)
        </p>
      )}
    </div>
  );
}

function QGroup({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-helper-text font-semibold text-lk-accent">
          {n}.
        </span>
        <p className="text-helper-text text-lk-ink-muted">{title}</p>
      </div>
      <div className="ml-5 mt-2 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function SubList({
  label,
  items,
  otherText,
  otherIfIncludes,
}: {
  label: string;
  items: string[];
  otherText?: string | null;
  otherIfIncludes?: boolean;
}) {
  const shown = items.filter((s) => s !== "Other");
  const hasOther = otherIfIncludes ?? false;
  return (
    <div>
      <p className="text-caption text-lk-ink-muted mb-1">{label}</p>
      {shown.length === 0 && !hasOther ? (
        <p className="text-body text-lk-ink-muted italic">—</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {shown.map((s, i) => (
            <li
              key={i}
              className="text-body text-lk-ink flex items-start gap-2"
            >
              <span
                aria-hidden
                className="mt-[9px] block h-[5px] w-[5px] shrink-0 rounded-full bg-lk-accent"
              />
              <span>{s}</span>
            </li>
          ))}
          {hasOther && (
            <li className="text-body text-lk-ink flex items-start gap-2">
              <span
                aria-hidden
                className="mt-[9px] block h-[5px] w-[5px] shrink-0 rounded-full bg-lk-accent"
              />
              <span>
                Other{otherText ? <> — <em>{otherText}</em></> : null}
              </span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function SubItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-caption text-lk-ink-muted mb-1">{label}</p>
      <p className="text-body text-lk-ink">{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-medium text-lk-ink-muted">{children}</th>
  );
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top text-lk-ink">{children}</td>;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });
}
function formatFullDate(s: string) {
  return new Date(s).toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
