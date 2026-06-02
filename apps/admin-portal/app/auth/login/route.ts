import { NextRequest, NextResponse } from "next/server";
import { createKeycloakAuthorizeUrl } from "../../lib/keycloak";

export function GET(request: NextRequest) {
  const state = crypto.randomUUID();
  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/admin/dashboard";
  const prompt = request.nextUrl.searchParams.get("prompt") || undefined;
  const response = NextResponse.redirect(createKeycloakAuthorizeUrl(state, prompt));

  response.cookies.set("sacco_admin_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 300
  });

  response.cookies.set("sacco_admin_return_to", returnTo, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 300
  });

  return response;
}
