import { serviceMessages, supportRequests } from "../member-data";
import { DataTable, DetailCard, GatedActionPanel, InfoCard, PageHeader, StatusPill } from "../member-ui";

export default function SupportPage() {
  return (
    <main className="member-module-page">
      <PageHeader
        eyebrow="Support"
        title="Support Center"
        description="Service requests, member notifications, and support guidance for authenticated self-service users."
      />

      <div className="member-info-grid">
        <InfoCard title="Open Requests" value="1" detail="One request in progress" icon="chat" tone="blue" />
        <InfoCard title="Notifications" value="3" detail="Unread member service messages" icon="bell" tone="cyan" />
        <InfoCard title="Support Status" value="Online" detail="Tenant service desk available" icon="info" tone="violet" />
      </div>

      <div className="member-two-column">
        <DetailCard title="Requests">
          <DataTable
            columns={["Ticket", "Subject", "Category", "Opened", "Status"]}
            rows={supportRequests.map((request) => [
              <strong key="ticket">{request.ticket}</strong>,
              request.subject,
              request.category,
              request.opened,
              <StatusPill key="status" tone={request.tone}>{request.status}</StatusPill>
            ])}
          />
        </DetailCard>

        <GatedActionPanel
          title="Create Support Request"
          description="Support creation will be wired to notification, audit, and member communication services."
          fields={[
            { label: "Category", placeholder: "Select support category" },
            { label: "Message", placeholder: "Describe your request" }
          ]}
          actionLabel="Submit support request"
        />
      </div>

      <DetailCard title="Service Messages">
        <div className="member-card-grid">
          {serviceMessages.map((message) => (
            <div className="member-mini-card" key={message.title}>
              <span>{message.title}</span>
              <strong>{message.message}</strong>
            </div>
          ))}
        </div>
      </DetailCard>
    </main>
  );
}
