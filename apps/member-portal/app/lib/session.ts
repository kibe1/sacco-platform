import { cookies } from "next/headers";

export type AccessProfile = {
  userId: string;
  tenantId: string;
  displayName: string;
  email?: string;
  roles: string[];
  permissions: string[];
  branchIds?: string[];
};

export type CurrentUser = {
  profile: AccessProfile;
};

type ApiEnvelope<T> = {
  data: T;
};

const gatewayBaseUrl = process.env.API_GATEWAY_URL ?? "http://localhost:8088";
const tenantId = process.env.SACCO_TENANT_ID ?? "local-sacco";

type JwtClaims = {
  sub?: string;
  tenant_id?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  email?: string;
  realm_access?: {
    roles?: string[];
  };
  azp?: string;
};

function decodeJwtPayload(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(normalized, "base64").toString("utf8");
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

function currentUserFromToken(accessToken: string): CurrentUser | null {
  const claims = decodeJwtPayload(accessToken);

  if (!claims) {
    return null;
  }

  const displayName = claims.name
    || [claims.given_name, claims.family_name].filter(Boolean).join(" ")
    || claims.preferred_username
    || "Authenticated User";
  const roles = new Set<string>(claims.realm_access?.roles ?? []);

  if (claims.azp) {
    roles.add(claims.azp.replace("-portal", ""));
  }

  return {
    profile: {
      userId: claims.sub ?? "",
      tenantId: claims.tenant_id ?? tenantId,
      displayName,
      email: claims.email ?? "",
      roles: Array.from(roles),
      permissions: [],
      branchIds: []
    }
  };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sacco_member_access_token")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${gatewayBaseUrl}/api/v1/auth/current-user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Tenant-Id": tenantId
      },
      cache: "no-store",
      signal: AbortSignal.timeout(2500)
    });

    if (!response.ok) {
      return currentUserFromToken(accessToken);
    }

    const envelope = (await response.json()) as ApiEnvelope<CurrentUser>;
    return envelope.data;
  } catch {
    return currentUserFromToken(accessToken);
  }
}
