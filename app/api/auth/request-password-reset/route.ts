import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    // Password reset is a public endpoint — no auth needed
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://db.pangohub.fjelldata.com');
    await pb.collection("users").requestPasswordReset(email.trim());
    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ error: e.message || "Failed to request password reset" }, { status: 500 });
  }
}
