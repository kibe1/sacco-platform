export const apiVersion = "v1";

export type ApiEnvelope<TData> = {
  data: TData;
  meta?: {
    correlationId?: string;
    tenantId?: string;
  };
};
