export type TenantStatus = "ACTIVE" | "SUSPENDED" | "PENDING" | "DISABLED";

export type TenantBranding = {
  displayName: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
};

export type TenantContext = {
  tenantId: string;
  slug: string;
  status: TenantStatus;
  branding: TenantBranding;
};

export type ResolveTenantRequest = {
  host?: string;
  slug?: string;
  ussdServiceCode?: string;
};

export type ResolveTenantResponse = {
  tenant: TenantContext;
};
