import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // refresh session + set cookies, then continue
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Protect everything except static assets and images; tweak as needed
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
