import { NextRequest, NextResponse } from "next/server";
import { appBaseUrl, clientId, keycloakTokenUrl } from "../../lib/keycloak";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
};

type JwtClaims = {
  realm_access?: {
    roles?: string[];
  };
};

const cookieNames = [
  "sacco_member_access_token",
  "sacco_member_refresh_token",
  "sacco_member_id_token",
  "sacco_member_oauth_state",
  "sacco_member_return_to"
];

function decodeJwtPayload(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(normalized, "base64").toString("utf8")) as JwtClaims;
  } catch {
    return null;
  }
}

function hasMemberAccess(accessToken: string) {
  const roles = decodeJwtPayload(accessToken)?.realm_access?.roles ?? [];
  return roles.includes("member");
}

function clearAuthCookies(response: NextResponse) {
  for (const name of cookieNames) {
    response.cookies.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 0
    });
  }
}

function createKeycloakLogoutUrl(idToken?: string) {
  const params = new URLSearchParams({
    post_logout_redirect_uri: `${appBaseUrl}/auth/login`
  });

  if (idToken) {
    params.set("id_token_hint", idToken);
  } else {
    params.set("client_id", clientId);
  }

  return `${process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL ?? "http://localhost:8180"}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "sacco-platform"}/protocol/openid-connect/logout?${params.toString()}`;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const expectedState = request.cookies.get("sacco_member_oauth_state")?.value;
  const returnTo = request.cookies.get("sacco_member_return_to")?.value || "/member/dashboard";

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

  if (!hasMemberAccess(tokens.access_token)) {
    const response = NextResponse.redirect(createKeycloakLogoutUrl(tokens.id_token));
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.redirect(new URL(returnTo, appBaseUrl));

  response.cookies.set("sacco_member_access_token", tokens.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: tokens.expires_in ?? 300
  });

  if (tokens.refresh_token) {
    response.cookies.set("sacco_member_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 8
    });
  }

  if (tokens.id_token) {
    response.cookies.set("sacco_member_id_token", tokens.id_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 8
    });
  }

  response.cookies.delete("sacco_member_oauth_state");
  response.cookies.delete("sacco_member_return_to");

  return response;
}
