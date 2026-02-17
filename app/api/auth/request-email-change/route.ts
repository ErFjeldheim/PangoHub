import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/pocketbase-server";

export async function POST(request: NextRequest) {
  const pb = await createServerClient();

  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { newEmail } = await request.json();
    if (!newEmail || typeof newEmail !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    await pb.collection("users").requestEmailChange(newEmail.trim());
    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ error: e.message || "Failed to request email change" }, { status: 500 });
  }
}
