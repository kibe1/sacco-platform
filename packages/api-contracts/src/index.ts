export const apiVersion = "v1";

export type ApiEnvelope<TData> = {
  data: TData;
  meta?: {
    correlationId?: string;
    tenantId?: string;
  };
};

export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "TENANT_NOT_FOUND"
  | "RESOURCE_NOT_FOUND"
  | "CONFLICT"
  | "IDEMPOTENCY_CONFLICT"
  | "INTERNAL_ERROR";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  correlationId?: string;
  details?: Record<string, unknown>;
};

export * from "./auth/contracts";
export * from "./tenant/contracts";
export * from "./user/contracts";
