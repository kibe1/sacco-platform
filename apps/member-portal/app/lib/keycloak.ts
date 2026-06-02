export const keycloakBaseUrl = process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL ?? "http://localhost:8180";
export const keycloakServerBaseUrl = process.env.KEYCLOAK_INTERNAL_BASE_URL ?? keycloakBaseUrl;
export const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "sacco-platform";
export const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "member-portal";
export const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:3101";

export function createKeycloakLoginUrl() {
  return createKeycloakAuthorizeUrl("member-portal-local");
}

export function createKeycloakAuthorizeUrl(state: string, prompt?: string) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appBaseUrl}/auth/callback`,
    response_type: "code",
    scope: "openid profile email",
    state
  });

  if (prompt) {
    params.set("prompt", prompt);
  }

  return `${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/auth?${params.toString()}`;
}

export const keycloakTokenUrl = `${keycloakServerBaseUrl}/realms/${realm}/protocol/openid-connect/token`;
export const keycloakLogoutUrl = `${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/logout`;
export const keycloakServerLogoutUrl = `${keycloakServerBaseUrl}/realms/${realm}/protocol/openid-connect/logout`;
