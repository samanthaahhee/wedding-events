import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const submitted = (body.password ?? "").trim();
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error("ADMIN_PASSWORD env var is not set");
    return NextResponse.json(
      { error: "Server is not configured for admin login" },
      { status: 500 },
    );
  }
  if (submitted.length === 0 || submitted !== expected) {
    // Sleep briefly to slow brute-force guesses.
    await new Promise((r) => setTimeout(r, 300));
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const cookie = await createSessionCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: cookie.maxAge,
  });
  return res;
}
