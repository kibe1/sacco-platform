export const memberSummary = [
  { label: "Savings Balance", value: "KES 86,240", note: "Available contribution balance", tone: "green" },
  { label: "Loan Balance", value: "KES 142,800", note: "Outstanding across active loans", tone: "yellow" },
  { label: "Wallet Balance", value: "KES 12,450", note: "Available for transfers", tone: "blue" },
  { label: "Next Repayment", value: "KES 8,500", note: "Due on 05 Jun 2026", tone: "red" }
];

export const quickActions = ["Deposit savings", "Repay loan", "Apply for loan", "Download statement"];

export const recentTransactions = [
  { date: "31 May", type: "Savings deposit", reference: "SAV-20260531-001", amount: "KES 5,000", status: "Completed" },
  { date: "29 May", type: "Loan repayment", reference: "LNR-20260529-004", amount: "KES 8,500", status: "Completed" },
  { date: "27 May", type: "Wallet transfer", reference: "WAL-20260527-011", amount: "KES 1,200", status: "Completed" }
];

export const loanProgress = [
  { label: "Principal repaid", percentage: 42 },
  { label: "Interest cleared", percentage: 65 },
  { label: "Remaining tenure", percentage: 58 }
];

export const moduleCards = [
  { title: "Savings", detail: "Contributions, withdrawals, holds, and savings statements.", href: "/member/savings" },
  { title: "Loans", detail: "Loan eligibility, applications, repayments, and arrears visibility.", href: "/member/loans" },
  { title: "Wallet", detail: "Wallet balance, transfers, payment confirmations, and limits.", href: "/member/wallet" },
  { title: "Statements", detail: "Downloadable member, savings, loan, and wallet statements.", href: "/member/statements" },
  { title: "Profile", detail: "KYC status, contact details, documents, and consent preferences.", href: "/member/profile" },
  { title: "Support", detail: "Service requests, notifications, help desk, and escalation history.", href: "/member/support" }
];
