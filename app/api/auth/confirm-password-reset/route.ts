import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

export async function POST(request: NextRequest) {
  try {
    const { token, password, passwordConfirm } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing reset token" }, { status: 400 });
    }
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Missing password" }, { status: 400 });
    }

    const pb = new PocketBase(
      process.env.POCKETBASE_URL || "https://db.pangohub.fjelldata.com"
    );
    await pb.collection("users").confirmPasswordReset(token, password, passwordConfirm);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json(
      { error: e.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
