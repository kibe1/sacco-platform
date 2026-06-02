import { NextRequest, NextResponse } from "next/server";

const gatewayBaseUrl = process.env.API_GATEWAY_URL ?? "http://localhost:8088";
const tenantId = process.env.SACCO_TENANT_ID ?? "local-sacco";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("sacco_member_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    const response = await fetch(`${gatewayBaseUrl}/api/v1/auth/current-user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Correlation-Id": correlationId,
        "X-Tenant-Id": tenantId
      },
      cache: "no-store",
      signal: AbortSignal.timeout(3000)
    });

    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
        "X-Correlation-Id": correlationId
      }
    });
  } catch {
    return NextResponse.json(
      { error: "session_service_unavailable", correlationId },
      { status: 503, headers: { "X-Correlation-Id": correlationId } }
    );
  }
}
