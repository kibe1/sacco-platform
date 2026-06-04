import { cookies } from "next/headers";
import { memberApiContracts } from "./member-data";

type ApiEnvelope<T> = {
  data: T;
};

export type MemberMutationResult<T = unknown> = {
  ok: boolean;
  backendReady: boolean;
  message: string;
  status?: number;
  data?: T;
};

const gatewayBaseUrl = process.env.API_GATEWAY_URL ?? "http://localhost:8088";
const tenantId = process.env.SACCO_TENANT_ID ?? "local-sacco";

async function getMemberAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("sacco_member_access_token")?.value;
}

function mutationFailure<T>(status: number | undefined, message: string): MemberMutationResult<T> {
  return {
    ok: false,
    backendReady: status !== 404 && status !== 501 && status !== 503,
    message,
    status
  };
}

async function memberGatewayGet<T>(path: string): Promise<T | null> {
  const accessToken = await getMemberAccessToken();

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${gatewayBaseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Tenant-Id": tenantId,
        "X-Client-Channel": "member-web"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(2500)
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiEnvelope<T> | T;
    return "data" in Object(payload) ? (payload as ApiEnvelope<T>).data : (payload as T);
  } catch {
    return null;
  }
}

async function memberGatewayPostJson<T>(path: string, body: Record<string, unknown>): Promise<MemberMutationResult<T>> {
  const accessToken = await getMemberAccessToken();

  if (!accessToken) {
    return mutationFailure<T>(401, "Your session could not be verified.");
  }

  try {
    const response = await fetch(`${gatewayBaseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Tenant-Id": tenantId,
        "X-Client-Channel": "member-web"
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return mutationFailure<T>(response.status, "The request could not be completed right now.");
    }

    const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T> | T;
    const data = "data" in Object(payload) ? (payload as ApiEnvelope<T>).data : (payload as T);

    return {
      ok: true,
      backendReady: true,
      message: "Request submitted successfully.",
      status: response.status,
      data
    };
  } catch {
    return mutationFailure<T>(undefined, "The request could not be completed right now.");
  }
}

async function memberGatewayPostFormData<T>(path: string, body: FormData): Promise<MemberMutationResult<T>> {
  const accessToken = await getMemberAccessToken();

  if (!accessToken) {
    return mutationFailure<T>(401, "Your session could not be verified.");
  }

  try {
    const response = await fetch(`${gatewayBaseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Tenant-Id": tenantId,
        "X-Client-Channel": "member-web"
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      return mutationFailure<T>(response.status, "The image could not be uploaded right now.");
    }

    const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T> | T;
    const data = "data" in Object(payload) ? (payload as ApiEnvelope<T>).data : (payload as T);

    return {
      ok: true,
      backendReady: true,
      message: "Profile image updated successfully.",
      status: response.status,
      data
    };
  } catch {
    return mutationFailure<T>(undefined, "The image could not be uploaded right now.");
  }
}

export const memberApi = {
  profile: <T>() => memberGatewayGet<T>(memberApiContracts.profile),
  uploadProfileImage: <T>(body: FormData) => memberGatewayPostFormData<T>(memberApiContracts.profileImage, body),
  submitProfileChangeRequest: <T>(body: Record<string, unknown>) => memberGatewayPostJson<T>(memberApiContracts.profileChangeRequest, body),
  kycStatus: <T>() => memberGatewayGet<T>(memberApiContracts.kycStatus),
  savingsAccounts: <T>() => memberGatewayGet<T>(memberApiContracts.savingsAccounts),
  loanProducts: <T>() => memberGatewayGet<T>(memberApiContracts.loanProducts),
  loanAccounts: <T>() => memberGatewayGet<T>(memberApiContracts.loanAccounts),
  wallet: <T>() => memberGatewayGet<T>(memberApiContracts.wallet),
  walletTransactions: <T>() => memberGatewayGet<T>(memberApiContracts.walletTransactions),
  statements: <T>() => memberGatewayGet<T>(memberApiContracts.statements),
  notifications: <T>() => memberGatewayGet<T>(memberApiContracts.notifications)
};
