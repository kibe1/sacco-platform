const keycloakBaseUrl = process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL ?? "http://localhost:8180";
const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "sacco-platform";
const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "admin-portal";
const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:3100";

export function createKeycloakLoginUrl() {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appBaseUrl}/auth/callback`,
    response_type: "code",
    scope: "openid profile email",
    state: "admin-portal-local"
  });

  return `${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/auth?${params.toString()}`;
}
