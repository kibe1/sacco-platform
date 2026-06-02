import { ReactNode } from "react";

type TailAdminTableColumn = {
  key: string;
  label: string;
  className?: string;
};

type TailAdminTableRow = {
  id: string;
  cells: Record<string, ReactNode>;
};

export function TailAdminStatusBadge({
  children,
  tone = "success"
}: {
  children: ReactNode;
  tone?: "success" | "warning" | "error";
}) {
  return <span className={`ta-status-badge ${tone}`}>{children}</span>;
}

export function TailAdminTableCard({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="ta-table-card">
      <div className="ta-table-card-header">
        <h2>{title}</h2>
      </div>
      <div className="ta-table-card-body">{children}</div>
    </section>
  );
}

export function TailAdminTable({
  columns,
  rows,
  minWidth = 920
}: {
  columns: TailAdminTableColumn[];
  rows: TailAdminTableRow[];
  minWidth?: number;
}) {
  return (
    <div className="ta-table-scroll">
      <div className="ta-table-inner" style={{ minWidth }}>
        <table className="ta-table">
          <thead className="ta-table-head">
            <tr>
              {columns.map((column) => (
                <th className={column.className} key={column.key}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="ta-table-body">
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td className={column.className} key={`${row.id}-${column.key}`}>
                    {row.cells[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TailAdminPrimaryCell({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="ta-primary-cell">
      <span>{title}</span>
      {subtitle && <small>{subtitle}</small>}
    </div>
  );
}
