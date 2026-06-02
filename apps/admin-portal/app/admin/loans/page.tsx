import { getLoans } from "../admin-data";
import {
  TailAdminPrimaryCell,
  TailAdminStatusBadge,
  TailAdminTable,
  TailAdminTableCard
} from "../components/tailadmin-table";

export default async function LoansPage() {
  const loans = await getLoans();
  const columns = [
    { key: "borrower", label: "Borrower" },
    { key: "account", label: "Account" },
    { key: "principal", label: "Principal" },
    { key: "outstanding", label: "Outstanding" },
    { key: "status", label: "Status" }
  ];
  const rows = loans.map((loan) => ({
    id: loan.id,
    cells: {
      borrower: <TailAdminPrimaryCell title={loan.client} subtitle="Loan account" />,
      account: loan.accountNo,
      principal: loan.principal,
      outstanding: loan.outstanding,
      status: <TailAdminStatusBadge tone="warning">{loan.status}</TailAdminStatusBadge>
    }
  }));

  return (
    <main>
      <div className="page-heading">
        <h1>Loans</h1>
      </div>

      <TailAdminTableCard title="Loan Portfolio">
        <TailAdminTable columns={columns} rows={rows} />
      </TailAdminTableCard>
    </main>
  );
}
