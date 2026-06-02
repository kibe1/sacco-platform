import { cookies } from "next/headers";

export type AccessProfile = {
  userId: string;
  tenantId: string;
  displayName: string;
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
      return null;
    }

    const envelope = (await response.json()) as ApiEnvelope<CurrentUser>;
    return envelope.data;
  } catch {
    return null;
  }
}
