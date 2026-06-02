import { NextRequest, NextResponse } from "next/server";
import { appBaseUrl, clientId, keycloakTokenUrl } from "../../lib/keycloak";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const expectedState = request.cookies.get("sacco_admin_oauth_state")?.value;
  const returnTo = request.cookies.get("sacco_admin_return_to")?.value || "/admin/dashboard";

  if (error) {
    return NextResponse.redirect(new URL(`/?authError=${encodeURIComponent(error)}`, appBaseUrl));
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/?authError=invalid_oauth_state", appBaseUrl));
  }

  const tokenResponse = await fetch(keycloakTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      redirect_uri: `${appBaseUrl}/auth/callback`
    }),
    cache: "no-store"
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL("/?authError=token_exchange_failed", appBaseUrl));
  }

  const tokens = (await tokenResponse.json()) as TokenResponse;
  const response = NextResponse.redirect(new URL(returnTo, appBaseUrl));

  response.cookies.set("sacco_admin_access_token", tokens.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: tokens.expires_in ?? 300
  });

  if (tokens.refresh_token) {
    response.cookies.set("sacco_admin_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 8
    });
  }

  if (tokens.id_token) {
    response.cookies.set("sacco_admin_id_token", tokens.id_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 8
    });
  }

  response.cookies.delete("sacco_admin_oauth_state");
  response.cookies.delete("sacco_admin_return_to");

  return response;
}
