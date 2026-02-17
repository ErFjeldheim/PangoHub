import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server-auth";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user: profile });
}
