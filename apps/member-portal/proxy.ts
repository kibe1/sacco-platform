import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/member"];

type JwtClaims = {
  realm_access?: {
    roles?: string[];
  };
};

function decodeJwtPayload(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(atob(padded)) as JwtClaims;
  } catch {
    return null;
  }
}

function hasMemberAccess(token: string) {
  const roles = decodeJwtPayload(token)?.realm_access?.roles ?? [];
  return roles.includes("member");
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("sacco_member_access_token")?.value;

  if (accessToken && hasMemberAccess(accessToken)) {
    return NextResponse.next();
  }

  if (accessToken) {
    const logoutUrl = request.nextUrl.clone();
    logoutUrl.pathname = "/auth/logout";
    logoutUrl.search = "";
    return NextResponse.redirect(logoutUrl);
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/auth/login";
  loginUrl.searchParams.set("returnTo", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/member/:path*"]
};
