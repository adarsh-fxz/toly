import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

// Optimistic check only: the API authorizes every request on its own.
export function proxy(request: NextRequest) {
  // The venue introduction is public; every management route still requires a session.
  if (request.nextUrl.pathname === "/merchant") return NextResponse.next();
  const hasSession = getSessionCookie(request, { cookiePrefix: "toly" });
  if (hasSession) return NextResponse.next();

  const url = new URL("/sign-in", request.url);
  url.searchParams.set(
    "next",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/account/:path*",
    "/me/:path*",
    "/merchant/:path*",
    "/admin/:path*",
  ],
};
