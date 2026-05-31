export type Permission =
  | "tenant.manage"
  | "users.manage"
  | "members.read"
  | "members.manage"
  | "savings.read"
  | "savings.manage"
  | "loans.read"
  | "loans.manage"
  | "payments.read"
  | "reports.read"
  | "audit.read";

export type AccessProfile = {
  userId: string;
  tenantId: string;
  displayName: string;
  roles: string[];
  permissions: Permission[];
  branchIds?: string[];
};

export type CurrentUserResponse = {
  profile: AccessProfile;
};
