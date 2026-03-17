import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/login"]);

const isBypassPath = (pathname: string) => {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/oauth2") ||
    pathname.startsWith("/login/oauth2") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  );
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/staff/notices") {
    return NextResponse.redirect(new URL("/board/notices", request.url));
  }
  if (pathname === "/staff/schedule") {
    return NextResponse.redirect(new URL("/board/schedule", request.url));
  }
  if (pathname === "/staff/events") {
    return NextResponse.redirect(new URL("/board/events", request.url));
  }
  if (pathname === "/staff") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (pathname === "/staff/approval") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (pathname === "/board/requests" || pathname === "/board/approvals") {
    return NextResponse.redirect(new URL("/board/docs", request.url));
  }
  if (pathname === "/nurse/register") {
    return NextResponse.redirect(new URL("/nurse", request.url));
  }
  if (pathname === "/doctor/encounters/inactive") {
    return NextResponse.redirect(new URL("/doctor/encounters", request.url));
  }
  if (pathname === "/patients/new") {
    return NextResponse.redirect(new URL("/patients", request.url));
  }

  if (isBypassPath(pathname)) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
