import { savingsAccounts, savingsTransactions } from "../member-data";
import { ActionButton, DataTable, DetailCard, GatedActionPanel, InfoCard, PageHeader, StatusPill } from "../member-ui";

export default function SavingsPage() {
  const totalBalance = "KES 86,240";

  return (
    <main className="member-module-page">
      <PageHeader
        eyebrow="Savings"
        title="Savings Accounts"
        description="Contribution balances, account holds, and transaction history for the authenticated member."
        actions={<ActionButton disabled>Open contribution flow</ActionButton>}
      />

      <div className="member-info-grid">
        <InfoCard title="Total Savings" value={totalBalance} detail="Across active savings accounts" icon="box-cube" tone="blue" />
        <InfoCard title="Available" value="KES 60,000" detail="Available after holds" icon="check-circle" tone="cyan" />
        <InfoCard title="Held Balance" value="KES 26,240" detail="Fixed deposits and pending holds" icon="lock" tone="amber" />
      </div>

      <DetailCard title="Accounts" description="Savings balances and holds are shown from tenant-scoped savings read models.">
        <DataTable
          columns={["Account", "Product", "Balance", "Available", "Holds", "Status"]}
          rows={savingsAccounts.map((account) => [
            <strong key="account">{account.account}</strong>,
            account.product,
            account.balance,
            account.available,
            account.holds,
            <StatusPill key="status" tone={account.tone}>{account.status}</StatusPill>
          ])}
        />
      </DetailCard>

      <div className="member-two-column">
        <DetailCard title="Contribution History" description="Latest savings movement visible to the member.">
          <DataTable
            columns={["Date", "Type", "Reference", "Amount", "Status"]}
            rows={savingsTransactions.map((transaction) => [
              transaction.date,
              <strong key="type">{transaction.type}</strong>,
              transaction.reference,
              transaction.amount,
              <StatusPill key="status" tone={transaction.tone}>{transaction.status}</StatusPill>
            ])}
          />
        </DetailCard>

        <GatedActionPanel
          title="Contribution / Withdrawal"
          description="Secure online contribution and withdrawal requests will be enabled in a later service release."
          fields={[
            { label: "Account", placeholder: "Select savings account" },
            { label: "Amount", placeholder: "KES 0.00" }
          ]}
          actionLabel="Submit request"
        />
      </div>
    </main>
  );
}
