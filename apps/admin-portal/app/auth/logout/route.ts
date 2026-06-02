import { NextRequest, NextResponse } from "next/server";
import { appBaseUrl, clientId, keycloakLogoutUrl, keycloakServerLogoutUrl } from "../../lib/keycloak";

const cookieNames = [
  "sacco_admin_access_token",
  "sacco_admin_refresh_token",
  "sacco_admin_id_token",
  "sacco_admin_oauth_state",
  "sacco_admin_return_to"
];

function createLogoutUrl(request: NextRequest) {
  const idToken = request.cookies.get("sacco_admin_id_token")?.value;
  const postLogoutRedirectUri = `${appBaseUrl}/auth/login`;
  const params = new URLSearchParams({
    post_logout_redirect_uri: postLogoutRedirectUri
  });

  if (idToken) {
    params.set("id_token_hint", idToken);
  } else {
    params.set("client_id", clientId);
  }

  return `${keycloakLogoutUrl}?${params.toString()}`;
}

async function logoutWithRefreshToken(request: NextRequest) {
  const refreshToken = request.cookies.get("sacco_admin_refresh_token")?.value;

  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(keycloakServerLogoutUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: clientId,
        refresh_token: refreshToken
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(3000)
    });

    return response.ok;
  } catch {
    return false;
  }
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

export async function GET(request: NextRequest) {
  const idToken = request.cookies.get("sacco_admin_id_token")?.value;
  const redirectUrl = idToken
    ? createLogoutUrl(request)
    : (await logoutWithRefreshToken(request))
      ? new URL("/auth/login", appBaseUrl)
      : new URL("/auth/login?prompt=login", appBaseUrl);
  const response = NextResponse.redirect(redirectUrl);

  clearAuthCookies(response);

  return response;
}
