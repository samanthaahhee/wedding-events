import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { outreachLog, responses } from "@/lib/schema";
import { submitSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    // Honeypot — pretend success so bots get nothing useful
    const honeypotIssue = parsed.error.issues.find(
      (i) => i.path[0] === "website",
    );
    if (honeypotIssue) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    return NextResponse.json(
      {
        error: "Some answers look incomplete or invalid.",
        issues: parsed.error.issues.map((i) => ({
          path: i.path,
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const userAgent = req.headers.get("user-agent") ?? null;

  const visionSkipped = data.visionSkipped === true;

  try {
    const inserted = await db
      .insert(responses)
      .values({
        source: data.source,
        venueSlug: data.venueSlug ?? null,

        peakWeddingsPerMonth: data.peakWeddingsPerMonth,
        eventMix: data.eventMix ?? null,

        dayToDayOwner: data.dayToDayOwner ?? null,
        dayToDayOwnerOther:
          data.dayToDayOwner === "other"
            ? (data.dayToDayOwnerOther ?? null)
            : null,

        bookingSource: data.bookingSource ?? null,
        bookingSourceOther:
          data.bookingSource === "other"
            ? (data.bookingSourceOther ?? null)
            : null,

        toolsCommunication: data.toolsCommunication,
        toolsCalendar: data.toolsCalendar,
        toolsDocuments: data.toolsDocuments,
        toolsBookingSoftwareName: data.toolsBookingSoftwareName?.trim() || null,
        toolsInvoicing: data.toolsInvoicing,
        toolsOther: data.toolsOther?.trim() || null,
        toolsCommunicationOther: data.toolsCommunication.includes("other")
          ? data.toolsCommunicationOther?.trim() || null
          : null,
        toolsCalendarOther: data.toolsCalendar.includes("other")
          ? data.toolsCalendarOther?.trim() || null
          : null,
        toolsDocumentsOther: data.toolsDocuments.includes("other")
          ? data.toolsDocumentsOther?.trim() || null
          : null,

        infoLocation: data.infoLocation,
        infoLocationOther: data.infoLocation.includes("other")
          ? (data.infoLocationOther ?? null)
          : null,

        updatePropagation: data.updatePropagation ?? null,
        updatePropagationOnePlaceWhere:
          data.updatePropagation === "one_place"
            ? (data.updatePropagationOnePlaceWhere ?? null)
            : null,

        adminHoursPerWedding: data.adminHoursPerWedding ?? null,
        pctRepetitive: data.pctRepetitive ?? null,

        holdPolicy: data.holdPolicy,
        holdPolicyOther: data.holdPolicy.includes("other")
          ? (data.holdPolicyOther ?? null)
          : null,
        softHoldDuration: data.holdPolicy.includes("soft_hold")
          ? (data.softHoldDuration ?? null)
          : null,
        softHoldDurationOther:
          data.holdPolicy.includes("soft_hold") &&
          data.softHoldDuration === "other"
            ? data.softHoldDurationOther?.trim() || null
            : null,

        conversionRate: data.conversionRate ?? null,

        mostFrustrating: data.mostFrustrating?.trim() || null,

        visionSkipped,
        realtimeAvailability: visionSkipped
          ? null
          : (data.realtimeAvailability ?? null),
        coupleDirectBooking: visionSkipped
          ? null
          : (data.coupleDirectBooking ?? null),
        holdReleaseWaitlist: visionSkipped
          ? null
          : (data.holdReleaseWaitlist ?? null),
        venueInfoWillingness: visionSkipped ? [] : data.venueInfoWillingness,

        softwareCategories: data.softwareCategories,
        softwareOther: data.softwareCategories.includes("other")
          ? (data.softwareOther ?? null)
          : null,
        eventsSoftwareReview: data.softwareCategories.includes("events_crm")
          ? (data.eventsSoftwareReview ?? null)
          : null,

        willingnessToPay: data.willingnessToPay?.trim() || null,
        callInterest: data.callInterest,

        venueName: data.venueName?.trim() || null,
        contactName: data.contactName?.trim() || null,
        contactRole: data.contactRole?.trim() || null,
        whatsapp: data.whatsapp?.trim() || null,
        email: data.email?.trim() || null,

        userAgent,
        completionTimeSeconds: data.completionTimeSeconds,
      })
      .returning({ id: responses.id });

    const responseId = inserted[0]?.id;

    if (responseId && data.venueSlug) {
      await db
        .update(outreachLog)
        .set({ responseId, updatedAt: new Date() })
        .where(eq(outreachLog.venueSlug, data.venueSlug));
    }

    return NextResponse.json({ ok: true, id: responseId }, { status: 200 });
  } catch (err) {
    console.error("submit failed", err);
    return NextResponse.json(
      { error: "Couldn't save your response. Please try again shortly." },
      { status: 500 },
    );
  }
}
