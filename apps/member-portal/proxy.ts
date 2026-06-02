import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/member"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("sacco_member_access_token")?.value;

  if (accessToken) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/auth/login";
  loginUrl.searchParams.set("returnTo", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/member/:path*"]
};
