import { statements } from "../member-data";
import { ActionButton, DataTable, DetailCard, GatedActionPanel, InfoCard, PageHeader, StatusPill } from "../member-ui";

export default function StatementsPage() {
  return (
    <main className="member-module-page">
      <PageHeader
        eyebrow="Reports"
        title="Statements & Downloads"
        description="Member, savings, loan, and wallet statement requests backed by reporting read models."
        actions={<ActionButton variant="secondary" disabled>Download selected</ActionButton>}
      />

      <div className="member-info-grid">
        <InfoCard title="Ready Statements" value="2" detail="Available for download" icon="docs" tone="blue" />
        <InfoCard title="Processing" value="1" detail="Generation in progress" icon="time" tone="amber" />
        <InfoCard title="Statement Channel" value="PWA" detail="Email delivery can be configured later" icon="download" tone="cyan" />
      </div>

      <div className="member-two-column">
        <DetailCard title="Statement Requests" description="Statement requests are tracked through reporting read models.">
          <DataTable
            columns={["Statement", "Period", "Requested", "Status"]}
            rows={statements.map((statement) => [
              <strong key="name">{statement.name}</strong>,
              statement.period,
              statement.requested,
              <StatusPill key="status" tone={statement.tone}>{statement.status}</StatusPill>
            ])}
          />
        </DetailCard>

        <GatedActionPanel
          title="Request Statement"
          description="Statement generation will create an auditable report request through report-service."
          fields={[
            { label: "Statement type", placeholder: "Member consolidated statement" },
            { label: "Period", placeholder: "Select period" }
          ]}
          actionLabel="Request statement"
        />
      </div>
    </main>
  );
}
