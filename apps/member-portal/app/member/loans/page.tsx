import { loanAccounts, loanApplications, loanProducts } from "../member-data";
import { DataTable, DetailCard, GatedActionPanel, InfoCard, PageHeader, StatusPill } from "../member-ui";

export default function LoansPage() {
  return (
    <main className="member-module-page">
      <PageHeader
        eyebrow="Credit"
        title="Loan Center"
        description="Loan products, applications, active accounts, and repayment status. Eligibility is always backend-owned."
      />

      <div className="member-info-grid">
        <InfoCard title="Outstanding" value="KES 142,800" detail="Across active loan accounts" icon="dollar-line" tone="blue" />
        <InfoCard title="Active Loans" value="2" detail="One current, one closed" icon="folder" tone="cyan" />
        <InfoCard title="Next Repayment" value="KES 8,500" detail="Due 05 Jun 2026" icon="calendar" tone="red" />
      </div>

      <DetailCard title="Available Products" description="Loan products are displayed from backend-owned product and eligibility rules.">
        <DataTable
          columns={["Product", "Rate", "Limit", "Tenure", "Status"]}
          rows={loanProducts.map((product) => [
            <strong key="product">{product.product}</strong>,
            product.rate,
            product.limit,
            product.tenure,
            <StatusPill key="status" tone={product.tone}>{product.status}</StatusPill>
          ])}
        />
      </DetailCard>

      <div className="member-two-column">
        <DetailCard title="Loan Accounts" description="Loan balances and repayment status are sourced from the loan service.">
          <DataTable
            columns={["Loan", "Product", "Principal", "Outstanding", "Next Due", "Status"]}
            rows={loanAccounts.map((loan) => [
              <strong key="loan">{loan.loan}</strong>,
              loan.product,
              loan.principal,
              loan.outstanding,
              loan.nextDue,
              <StatusPill key="status" tone={loan.tone}>{loan.status}</StatusPill>
            ])}
          />
        </DetailCard>

        <GatedActionPanel
          title="Loan Application / Repayment"
          description="Online applications and repayments will be enabled in a later service release."
          fields={[
            { label: "Product", placeholder: "Select loan product" },
            { label: "Amount", placeholder: "KES 0.00" },
            { label: "Purpose", placeholder: "Loan purpose" }
          ]}
          actionLabel="Submit loan request"
        />
      </div>

      <DetailCard title="Applications">
        <DataTable
          columns={["Reference", "Product", "Amount", "Submitted", "Status"]}
          rows={loanApplications.map((application) => [
            <strong key="reference">{application.reference}</strong>,
            application.product,
            application.amount,
            application.submitted,
            <StatusPill key="status" tone={application.tone}>{application.status}</StatusPill>
          ])}
        />
      </DetailCard>
    </main>
  );
}
