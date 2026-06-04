import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/admin"];

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

function hasAdminAccess(token: string) {
  const roles = decodeJwtPayload(token)?.realm_access?.roles ?? [];
  return roles.includes("admin") || roles.includes("super-admin") || roles.includes("realm-admin");
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("sacco_admin_access_token")?.value;

  if (accessToken && hasAdminAccess(accessToken)) {
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
  matcher: ["/admin/:path*"]
};
