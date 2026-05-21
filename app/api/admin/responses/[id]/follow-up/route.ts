import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_KEY, verifySessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { responses } from "@/lib/schema";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  // Belt-and-braces: middleware already guards /admin/*, but the API routes
  // sit under /api so we check the cookie here directly.
  const cookie = req.cookies.get(COOKIE_KEY)?.value;
  const ok = await verifySessionCookie(cookie);
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  let body: { followedUp?: boolean };
  try {
    body = (await req.json()) as { followedUp?: boolean };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.followedUp !== "boolean") {
    return NextResponse.json(
      { error: "followedUp must be boolean" },
      { status: 400 },
    );
  }

  const updated = await db
    .update(responses)
    .set({ followedUp: body.followedUp })
    .where(eq(responses.id, id))
    .returning({ id: responses.id });

  if (updated.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
