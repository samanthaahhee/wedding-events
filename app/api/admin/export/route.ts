import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_KEY, verifySessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { responses } from "@/lib/schema";

export const runtime = "nodejs";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s: string;
  if (Array.isArray(value)) s = value.join("; ");
  else if (value instanceof Date) s = value.toISOString();
  else if (typeof value === "boolean") s = value ? "true" : "false";
  else s = String(value);
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

const COLUMNS: { key: keyof typeof responses.$inferSelect; header: string }[] = [
  { key: "id", header: "id" },
  { key: "createdAt", header: "created_at" },
  { key: "source", header: "source" },
  { key: "venueSlug", header: "venue_slug" },
  { key: "peakWeddingsPerMonth", header: "peak_weddings_per_month" },
  { key: "eventMix", header: "event_mix" },
  { key: "dayToDayOwner", header: "day_to_day_owner" },
  { key: "dayToDayOwnerOther", header: "day_to_day_owner_other" },
  { key: "bookingSource", header: "booking_source" },
  { key: "bookingSourceOther", header: "booking_source_other" },
  { key: "toolsCommunication", header: "tools_communication" },
  { key: "toolsCalendar", header: "tools_calendar" },
  { key: "toolsDocuments", header: "tools_documents" },
  { key: "toolsBookingSoftwareName", header: "tools_booking_software_name" },
  { key: "toolsInvoicing", header: "tools_invoicing" },
  { key: "toolsOther", header: "tools_other" },
  { key: "infoLocation", header: "info_location" },
  { key: "infoLocationOther", header: "info_location_other" },
  { key: "updatePropagation", header: "update_propagation" },
  { key: "updatePropagationOnePlaceWhere", header: "update_propagation_one_place_where" },
  { key: "adminHoursPerWedding", header: "admin_hours_per_wedding" },
  { key: "pctRepetitive", header: "pct_repetitive" },
  { key: "holdPolicy", header: "hold_policy" },
  { key: "holdPolicyOther", header: "hold_policy_other" },
  { key: "conversionRate", header: "conversion_rate" },
  { key: "mostFrustrating", header: "most_frustrating" },
  { key: "visionSkipped", header: "vision_skipped" },
  { key: "realtimeAvailability", header: "realtime_availability" },
  { key: "coupleDirectBooking", header: "couple_direct_booking" },
  { key: "holdReleaseWaitlist", header: "hold_release_waitlist" },
  { key: "venueInfoWillingness", header: "venue_info_willingness" },
  { key: "softwareCategories", header: "software_categories" },
  { key: "softwareOther", header: "software_other" },
  { key: "eventsSoftwareReview", header: "events_software_review" },
  { key: "willingnessToPay", header: "willingness_to_pay" },
  { key: "callInterest", header: "call_interest" },
  { key: "additionalComments", header: "additional_comments" },
  { key: "venueName", header: "venue_name" },
  { key: "contactName", header: "contact_name" },
  { key: "contactRole", header: "contact_role" },
  { key: "email", header: "email" },
  { key: "whatsapp", header: "whatsapp" },
  { key: "userAgent", header: "user_agent" },
  { key: "completionTimeSeconds", header: "completion_time_seconds" },
  { key: "followedUp", header: "followed_up" },
];

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_KEY)?.value;
  const ok = await verifySessionCookie(cookie);
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = await db
    .select()
    .from(responses)
    .orderBy(desc(responses.createdAt));

  const header = COLUMNS.map((c) => c.header).join(",");
  const rows = all.map((r) =>
    COLUMNS.map((c) => csvEscape(r[c.key])).join(","),
  );
  const csv = [header, ...rows].join("\n") + "\n";

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="venue-survey-${date}.csv"`,
    },
  });
}
