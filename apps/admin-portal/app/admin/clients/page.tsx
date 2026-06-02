import { getClients } from "../admin-data";
import {
  TailAdminPrimaryCell,
  TailAdminStatusBadge,
  TailAdminTable,
  TailAdminTableCard
} from "../components/tailadmin-table";

export default async function ClientsPage() {
  const clients = await getClients();
  const columns = [
    { key: "member", label: "Member" },
    { key: "account", label: "Account" },
    { key: "mobile", label: "Mobile" },
    { key: "status", label: "Status" }
  ];
  const rows = clients.map((client) => ({
    id: client.id,
    cells: {
      member: <TailAdminPrimaryCell title={client.name} subtitle="Member account" />,
      account: client.accountNo,
      mobile: client.mobile,
      status: <TailAdminStatusBadge>{client.status}</TailAdminStatusBadge>
    }
  }));

  return (
    <main>
      <div className="page-heading">
        <h1>Clients</h1>
      </div>

      <TailAdminTableCard title="Client Register">
        <TailAdminTable columns={columns} rows={rows} />
      </TailAdminTableCard>
    </main>
  );
}
