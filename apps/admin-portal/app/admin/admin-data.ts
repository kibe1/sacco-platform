export const fallbackDashboardSummary = {
  loansDisbursed: "KES 18.4M",
  totalRepayments: "KES 6.8M",
  totalOutstanding: "KES 42.1M",
  totalArrears: "KES 1.2M",
  activeMembers: "24,890",
  pendingApprovals: "37",
  reconciliationItems: "8",
  channelUptime: "99.94%"
};

export const fallbackCollectionMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

export const fallbackClients = [
  { id: "1", accountNo: "MBR-0001", name: "Admin Test Member", mobile: "+254700000001", status: "Active" },
  { id: "2", accountNo: "MBR-0002", name: "Member Test User", mobile: "+254700000002", status: "Pending KYC" }
];

export const fallbackLoans = [
  {
    id: "1",
    accountNo: "LN-0001",
    client: "Admin Test Member",
    principal: "KES 0.00",
    outstanding: "KES 0.00",
    status: "Draft"
  }
];

export const fallbackModules = [
  "Tenant Management",
  "Users and Roles",
  "Member Management",
  "KYC",
  "Savings",
  "Loans",
  "Wallet",
  "Payments",
  "Accounting",
  "Notifications",
  "USSD",
  "Reports",
  "Audit",
  "Configuration"
].map((name, index) => ({ id: String(index + 1), name, status: index < 8 ? "Enabled" : "Planned" }));

export const fallbackAuditLogs = [
  {
    id: "local-audit-1",
    actor: "Super Admin",
    eventType: "ADMIN_PORTAL_OPENED",
    entityType: "AdminPortal",
    entityId: "local",
    details: "Audit activity feed is available.",
    occurredAt: new Date().toISOString()
  }
];

export const fallbackTenants = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Local SACCO",
    code: "LOCAL",
    status: "ACTIVE",
    createdAt: new Date().toISOString()
  }
];

export const fallbackChannelMenus = {
  USSD: [
    { code: "1", label: "Check Balance", action: "balance.lookup" },
    { code: "2", label: "Loan Repayment", action: "loan.repayment" },
    { code: "3", label: "Mini Statement", action: "statement.mini" }
  ],
  MOBILE: [
    { code: "home", label: "Dashboard", action: "/member" },
    { code: "savings", label: "Savings", action: "/member/savings" },
    { code: "loans", label: "Loans", action: "/member/loans" }
  ],
  WEB: [
    { code: "members", label: "Members", action: "/admin/clients" },
    { code: "loans", label: "Loans", action: "/admin/loans" },
    { code: "reports", label: "Reports", action: "#" }
  ]
};

export const workQueue = [
  { title: "Loan approvals", count: 18, owner: "Credit committee", status: "Due today" },
  { title: "Pending KYC reviews", count: 11, owner: "Member operations", status: "In review" },
  { title: "Payment exceptions", count: 5, owner: "Finance desk", status: "Needs action" },
  { title: "Dormant account checks", count: 3, owner: "Compliance", status: "Scheduled" }
];

export const channelStatus = [
  { name: "Web Admin", status: "Online", detail: "Keycloak protected" },
  { name: "Member PWA", status: "Online", detail: "Auth wiring in progress" },
  { name: "Mobile API", status: "Planned", detail: "Shared contracts pending" },
  { name: "USSD Adapter", status: "Planned", detail: "Gateway integration pending" }
];

export const recentActivity = [
  { time: "09:42", event: "Admin session authenticated", actor: "Super Admin" },
  { time: "09:35", event: "Keycloak realm verified", actor: "Platform setup" },
  { time: "09:21", event: "Kafka, Redis, PostgreSQL healthy", actor: "Local infrastructure" },
  { time: "08:58", event: "Admin portal shell assimilated", actor: "Frontend workspace" }
];

export const financialBreakdown = [
  { label: "Savings deposits", value: "KES 12.6M", percentage: 76 },
  { label: "Loan repayments", value: "KES 6.8M", percentage: 54 },
  { label: "Wallet transfers", value: "KES 2.3M", percentage: 38 }
];

const apiBaseUrl = process.env.API_URL ?? process.env.API_GATEWAY_URL ?? "http://localhost:8088";

type ApiRecord = Record<string, unknown>;

export type ModuleDetail = {
  module: string;
  status: string;
  owner: string;
  postgresSchema: string;
  notes: string;
  contract: string;
};

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { cache: "no-store" });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

function formatMoney(value: unknown, fallback = "KES 0.00") {
  if (typeof value === "string") {
    return value.startsWith("KES") ? value : `KES ${value}`;
  }

  if (typeof value === "number") {
    return `KES ${value.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return fallback;
}

export async function getDashboardData() {
  const summary = await getJson<ApiRecord>("/api/v1/dashboard/summary", {});
  const collections = await getJson<ApiRecord>("/api/v1/dashboard/collections", {});
  const series = Array.isArray(collections.series) ? (collections.series as ApiRecord[]) : [];

  return {
    summary: {
      loansDisbursed: formatMoney(summary.loansDisbursed, fallbackDashboardSummary.loansDisbursed),
      totalRepayments: formatMoney(summary.totalRepayments, fallbackDashboardSummary.totalRepayments),
      totalOutstanding: formatMoney(summary.totalOutstanding, fallbackDashboardSummary.totalOutstanding),
      totalArrears: formatMoney(summary.totalArrears, fallbackDashboardSummary.totalArrears),
      activeMembers: String(summary.activeMembers ?? fallbackDashboardSummary.activeMembers),
      pendingApprovals: String(summary.pendingApprovals ?? fallbackDashboardSummary.pendingApprovals),
      reconciliationItems: String(summary.reconciliationItems ?? fallbackDashboardSummary.reconciliationItems),
      channelUptime: String(summary.channelUptime ?? fallbackDashboardSummary.channelUptime)
    },
    collections: {
      today: formatMoney(collections.today, "KES 0.00"),
      week: formatMoney(collections.week, "KES 0.00"),
      month: formatMoney(collections.month, "KES 0.00"),
      months: series.length > 0 ? series.map((item) => String(item.month ?? item.label ?? "")) : fallbackCollectionMonths
    }
  };
}

export async function getClients() {
  const rows = await getJson<ApiRecord[]>("/api/v1/clients", []);

  if (rows.length === 0) {
    return fallbackClients;
  }

  return rows.map((client) => ({
    id: String(client.id ?? client.account_no ?? crypto.randomUUID()),
    accountNo: String(client.account_no ?? client.accountNo ?? client.id ?? ""),
    name: String(client.full_name ?? client.name ?? ""),
    mobile: String(client.mobile ?? ""),
    status: String(client.status ?? "UNKNOWN")
  }));
}

export async function getLoans() {
  const rows = await getJson<ApiRecord[]>("/api/v1/loans", []);

  if (rows.length === 0) {
    return fallbackLoans;
  }

  return rows.map((loan) => ({
    id: String(loan.id ?? loan.account_no ?? crypto.randomUUID()),
    accountNo: String(loan.account_no ?? loan.accountNo ?? loan.id ?? ""),
    client: String(loan.full_name ?? loan.client ?? loan.memberId ?? ""),
    principal: formatMoney(loan.principal),
    outstanding: formatMoney(loan.outstanding),
    status: String(loan.status ?? "UNKNOWN")
  }));
}

export async function getModules() {
  const rows = await getJson<ApiRecord[]>("/api/v1/admin/modules", []);

  if (rows.length === 0) {
    return fallbackModules;
  }

  return rows.map((module) => ({
    id: String(module.id ?? module.name ?? crypto.randomUUID()),
    name: String(module.name ?? module.id ?? ""),
    status: String(module.status ?? "Enabled")
  }));
}

export async function getModuleDetail(module: string): Promise<ModuleDetail> {
  const detail = await getJson<ApiRecord>(`/api/v1/modules/${encodeURIComponent(module)}`, {});

  return {
    module: String(detail.module ?? module),
    status: String(detail.status ?? "FOUNDATION_READY"),
    owner: String(detail.owner ?? "service boundary pending"),
    postgresSchema: String(detail.postgresSchema ?? "service-owned"),
    notes: String(detail.notes ?? "Module administration is available for authorized users."),
    contract: String(detail.contract ?? `/api/v1/modules/${module}/schema`)
  };
}

export async function getTenants() {
  const rows = await getJson<ApiRecord[]>("/api/v1/tenants", []);

  if (rows.length === 0) {
    return fallbackTenants;
  }

  return rows.map((tenant) => ({
    id: String(tenant.id ?? crypto.randomUUID()),
    name: String(tenant.name ?? ""),
    code: String(tenant.code ?? ""),
    status: String(tenant.status ?? "UNKNOWN"),
    createdAt: String(tenant.createdAt ?? "")
  }));
}

export async function getAuditLogs() {
  const rows = await getJson<ApiRecord[]>("/api/v1/audit", []);

  if (rows.length === 0) {
    return fallbackAuditLogs;
  }

  return rows.map((log) => ({
    id: String(log.id ?? crypto.randomUUID()),
    actor: String(log.actor ?? "system"),
    eventType: String(log.eventType ?? log.action ?? "EVENT"),
    entityType: String(log.entityType ?? ""),
    entityId: String(log.entityId ?? ""),
    details: typeof log.details === "string" ? log.details : JSON.stringify(log.details ?? {}),
    occurredAt: String(log.occurredAt ?? log.createdAt ?? "")
  }));
}

export async function getChannelMenus(channel: "USSD" | "MOBILE" | "WEB") {
  const rows = await getJson<ApiRecord[]>(`/api/v1/channel-menus?channel=${channel}`, []);

  if (rows.length === 0) {
    return fallbackChannelMenus[channel];
  }

  return rows.map((menu) => ({
    code: String(menu.menu_code ?? menu.option ?? ""),
    label: String(menu.label ?? ""),
    action: String(menu.route_or_action ?? menu.action ?? "")
  }));
}

export async function getPlatformHealth() {
  const health = await getJson<ApiRecord>("/actuator/health", { status: "UNKNOWN" });
  const status = await getJson<ApiRecord>("/api/v1/platform/status", {
    gateway: "Gateway unavailable",
    keycloak: "Running locally on port 8180",
    postgres: "Running locally on port 5432",
    redis: "Running locally on port 6379",
    kafka: "Running locally on port 9092"
  });

  return { health, status };
}
