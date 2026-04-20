import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth API routes through (NextAuth needs these)
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check for session cookie (database strategy, not JWT)
  const sessionToken =
    request.cookies.get("__Secure-next-auth.session-token")?.value ??
    request.cookies.get("next-auth.session-token")?.value;

  // Protect API routes — return 401 instead of redirect
  if (pathname.startsWith("/api/")) {
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protect app routes — redirect to login
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/settings/:path*",
    "/api/((?!auth).*)",
  ],
};
