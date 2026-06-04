export type Tone = "blue" | "cyan" | "violet" | "red" | "amber";
export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";
export type ProfileChangeRequestStatus = "Pending" | "Approved" | "Rejected";

export const memberApiContracts = {
  dashboard: "/api/v1/mobile/home",
  profile: "/api/v1/member/profile",
  profileImage: "/api/v1/member/profile/image",
  profileChangeRequest: "/api/v1/member/profile/change-request",
  kycStatus: "/api/v1/member/kyc/status",
  savingsAccounts: "/api/v1/member/savings/accounts",
  savingsContributions: "/api/v1/member/savings/contributions",
  savingsWithdrawals: "/api/v1/member/savings/withdrawals",
  loanProducts: "/api/v1/member/loans/products",
  loanApplications: "/api/v1/member/loans/applications",
  loanAccounts: "/api/v1/member/loans/accounts",
  wallet: "/api/v1/member/wallet",
  walletTransactions: "/api/v1/member/wallet/transactions",
  walletTransfers: "/api/v1/member/wallet/transfers",
  statements: "/api/v1/member/reports/statements",
  notifications: "/api/v1/member/notifications"
} as const;

export const memberHomeSummary = {
  metrics: [
    { label: "Savings Balance", value: "KES 86,240", helper: "Last 30 Days", change: "11.01%", direction: "up" as const, icon: "group" },
    { label: "Active Loans", value: "2", helper: "Last 30 Days", change: "3.52%", direction: "up" as const, icon: "folder" },
    { label: "Wallet Balance", value: "KES 12,450", helper: "Last 30 Days", change: "14.8%", direction: "up" as const, icon: "dollar-line" },
    { label: "Next Repayment", value: "KES 8,500", helper: "Due 05 Jun 2026", change: "9.05%", direction: "down" as const, icon: "user-line" }
  ],
  services: [
    { name: "Savings", detail: "Recurring contributions", amount: "86.2K", icon: "box-cube", color: "blue" },
    { name: "Loans", detail: "Active repayment account", amount: "142.8K", icon: "dollar-line", color: "violet" },
    { name: "Wallet", detail: "Available transfer balance", amount: "12.4K", icon: "folder", color: "cyan" }
  ],
  recentActivity: [
    { date: "31 May", title: "Savings contribution", reference: "SAV-20260531-001", amount: "KES 5,000", status: "Completed", tone: "success" as StatusTone },
    { date: "29 May", title: "Loan repayment", reference: "LNR-20260529-004", amount: "KES 8,500", status: "Completed", tone: "success" as StatusTone },
    { date: "27 May", title: "Wallet transfer", reference: "WAL-20260527-011", amount: "KES 1,200", status: "Completed", tone: "success" as StatusTone }
  ]
};

export const memberProfile = {
  memberNumber: "1001000001",
  fullName: "Member User",
  email: "member.user@sacco.local",
  mobile: "254700000002",
  branch: "Head Office",
  status: "Active",
  kycStatus: "Verified",
  joinedOn: "12 Jan 2024",
  lastUpdated: "02 Jun 2026",
  contacts: [
    { label: "Primary phone", value: "254700000002" },
    { label: "Email address", value: "member.user@sacco.local" },
    { label: "Postal address", value: "P.O. Box 100, Nairobi" }
  ],
  documents: [
    { name: "National ID", status: "Verified", updated: "28 May 2026", tone: "success" as StatusTone },
    { name: "KRA PIN", status: "Verified", updated: "28 May 2026", tone: "success" as StatusTone },
    { name: "Proof of residence", status: "Review", updated: "30 May 2026", tone: "warning" as StatusTone }
  ],
  security: [
    { label: "Password", value: "Managed through Keycloak" },
    { label: "MFA", value: "Available when tenant policy requires it" },
    { label: "Consent", value: "Marketing messages disabled" }
  ]
};

export const memberCommunicationPreferences = {
  email: true,
  sms: true,
  push: false,
  marketing: false
};

export const memberProfileChangeRequests = [
  {
    field: "mobile",
    requestedValue: "254711000222",
    submittedAt: "03 Jun 2026",
    status: "Pending" as ProfileChangeRequestStatus
  },
  {
    field: "physicalAddress",
    requestedValue: "P.O. Box 400, Nairobi",
    submittedAt: "29 May 2026",
    status: "Rejected" as ProfileChangeRequestStatus,
    rejectionReason: "Supporting proof of residence was not attached."
  }
];

export const savingsAccounts = [
  { account: "SAV-001-0001", product: "Ordinary Savings", balance: "KES 64,240", available: "KES 60,000", holds: "KES 4,240", status: "Active", tone: "success" as StatusTone },
  { account: "DEP-001-0001", product: "Fixed Deposit", balance: "KES 22,000", available: "KES 0", holds: "KES 22,000", status: "Locked", tone: "warning" as StatusTone }
];

export const savingsTransactions = [
  { date: "31 May 2026", type: "Contribution", reference: "SAV-20260531-001", amount: "KES 5,000", status: "Completed", tone: "success" as StatusTone },
  { date: "18 May 2026", type: "Standing order", reference: "SAV-20260518-004", amount: "KES 3,000", status: "Completed", tone: "success" as StatusTone },
  { date: "02 May 2026", type: "Withdrawal request", reference: "WDR-20260502-002", amount: "KES 2,500", status: "Review", tone: "warning" as StatusTone }
];

export const walletSummary = {
  balance: "KES 12,450",
  available: "KES 12,450",
  dailyLimit: "KES 50,000",
  usedToday: "KES 1,200",
  status: "Active"
};

export const walletTransactions = [
  { date: "27 May 2026", type: "Transfer", reference: "WAL-20260527-011", amount: "KES 1,200", counterparty: "Member wallet", status: "Completed", tone: "success" as StatusTone },
  { date: "24 May 2026", type: "Credit", reference: "WAL-20260524-007", amount: "KES 6,500", counterparty: "Savings payout", status: "Completed", tone: "success" as StatusTone },
  { date: "20 May 2026", type: "Hold", reference: "HLD-20260520-003", amount: "KES 2,000", counterparty: "Pending review", status: "Held", tone: "warning" as StatusTone }
];

export const loanProducts = [
  { product: "Development Loan", rate: "12% p.a.", limit: "Up to 3x savings", tenure: "36 months", status: "Available", tone: "success" as StatusTone },
  { product: "Emergency Loan", rate: "10% p.a.", limit: "KES 50,000", tenure: "12 months", status: "Available", tone: "success" as StatusTone },
  { product: "Asset Finance", rate: "14% p.a.", limit: "By appraisal", tenure: "48 months", status: "Review", tone: "warning" as StatusTone }
];

export const loanAccounts = [
  { loan: "LON-2026-001", product: "Development Loan", principal: "KES 150,000", outstanding: "KES 142,800", nextDue: "05 Jun 2026", status: "Current", tone: "success" as StatusTone },
  { loan: "LON-2025-014", product: "Emergency Loan", principal: "KES 40,000", outstanding: "KES 0", nextDue: "-", status: "Closed", tone: "neutral" as StatusTone }
];

export const loanApplications = [
  { reference: "APP-20260520-002", product: "Emergency Loan", amount: "KES 50,000", submitted: "20 May 2026", status: "Under Review", tone: "warning" as StatusTone },
  { reference: "APP-20260402-006", product: "Development Loan", amount: "KES 150,000", submitted: "02 Apr 2026", status: "Approved", tone: "success" as StatusTone }
];

export const statements = [
  { name: "Member consolidated statement", period: "May 2026", requested: "01 Jun 2026", status: "Ready", tone: "success" as StatusTone },
  { name: "Savings account statement", period: "Apr 2026", requested: "02 May 2026", status: "Ready", tone: "success" as StatusTone },
  { name: "Loan repayment statement", period: "FY 2026", requested: "03 Jun 2026", status: "Processing", tone: "warning" as StatusTone }
];

export const supportRequests = [
  { ticket: "SR-20260601-001", subject: "Update contact details", category: "Profile", opened: "01 Jun 2026", status: "In Progress", tone: "warning" as StatusTone },
  { ticket: "SR-20260522-004", subject: "Savings receipt confirmation", category: "Savings", opened: "22 May 2026", status: "Resolved", tone: "success" as StatusTone }
];

export const serviceMessages = [
  { title: "Payment posting", message: "All member financial commands require confirmed backend idempotency before submission is enabled.", tone: "info" as StatusTone },
  { title: "KYC review", message: "Document updates are routed to member-service and audited under the current tenant.", tone: "success" as StatusTone }
];
