import { walletSummary, walletTransactions } from "../member-data";
import { DataTable, DetailCard, GatedActionPanel, InfoCard, PageHeader, StatusPill } from "../member-ui";

export default function WalletPage() {
  return (
    <main className="member-module-page">
      <PageHeader
        eyebrow="Wallet"
        title="Wallet Activity"
        description="Wallet balance, transfer limits, holds, and member transaction history."
      />

      <div className="member-info-grid">
        <InfoCard title="Wallet Balance" value={walletSummary.balance} detail={walletSummary.status} icon="folder" tone="blue" />
        <InfoCard title="Available" value={walletSummary.available} detail="Available for transfers" icon="check-circle" tone="cyan" />
        <InfoCard title="Daily Limit" value={walletSummary.dailyLimit} detail={`${walletSummary.usedToday} used today`} icon="bolt" tone="violet" />
      </div>

      <div className="member-two-column">
        <DetailCard title="Wallet Transactions" description="Wallet activity is displayed from member-owned wallet read models.">
          <DataTable
            columns={["Date", "Type", "Reference", "Counterparty", "Amount", "Status"]}
            rows={walletTransactions.map((transaction) => [
              transaction.date,
              <strong key="type">{transaction.type}</strong>,
              transaction.reference,
              transaction.counterparty,
              transaction.amount,
              <StatusPill key="status" tone={transaction.tone}>{transaction.status}</StatusPill>
            ])}
          />
        </DetailCard>

        <GatedActionPanel
          title="Wallet Transfer"
          description="Secure wallet transfers will be enabled in a later service release."
          fields={[
            { label: "Recipient", placeholder: "Member number or wallet reference" },
            { label: "Amount", placeholder: "KES 0.00" },
            { label: "Narration", placeholder: "Transfer purpose" }
          ]}
          actionLabel="Initiate transfer"
        />
      </div>
    </main>
  );
}
