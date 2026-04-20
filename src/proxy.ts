import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth API routes through (NextAuth needs these)
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  // Protect API routes — return 401 instead of redirect
  if (pathname.startsWith("/api/")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protect app routes — redirect to login
  if (!token) {
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
