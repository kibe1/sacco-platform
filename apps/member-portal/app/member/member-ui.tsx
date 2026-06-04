import type { ReactNode } from "react";
import type { StatusTone } from "./member-data";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="member-page-header">
      <div>
        {eyebrow && <p className="member-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="member-page-actions">{actions}</div>}
    </section>
  );
}

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: StatusTone }) {
  return <span className={`member-status-pill ${tone}`}>{children}</span>;
}

export function ActionButton({
  children,
  variant = "primary",
  disabled = false
}: {
  children: ReactNode;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}) {
  return (
    <button className={`member-action-button ${variant}`} type="button" disabled={disabled}>
      {children}
    </button>
  );
}

export function InfoCard({
  title,
  value,
  detail,
  icon,
  tone = "blue"
}: {
  title: string;
  value: string;
  detail?: string;
  icon?: string;
  tone?: "blue" | "cyan" | "violet" | "red" | "amber";
}) {
  return (
    <article className="member-info-card">
      <div className={`member-card-icon ${tone}`}>
        {icon ? <img src={`/tailadmin-icons/${icon}.svg`} alt="" aria-hidden="true" /> : null}
      </div>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        {detail && <span>{detail}</span>}
      </div>
    </article>
  );
}

export function DetailCard({
  title,
  description,
  children,
  action
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="member-detail-card">
      <div className="member-card-heading">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function DataTable({
  columns,
  rows,
  emptyMessage = "No records found."
}: {
  columns: string[];
  rows: ReactNode[][];
  emptyMessage?: string;
}) {
  return (
    <div className="member-table-wrap">
      <table className="member-table">
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length > 0 ? rows.map((row, index) => (
            <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
          )) : (
            <tr>
              <td colSpan={columns.length}>
                <div className="member-empty-state">{emptyMessage}</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function GatedActionPanel({
  title,
  description,
  fields,
  actionLabel
}: {
  title: string;
  description: string;
  fields: Array<{ label: string; placeholder: string }>;
  actionLabel: string;
}) {
  return (
    <DetailCard
      title={title}
      description={description}
      action={<StatusPill tone="info">Coming soon</StatusPill>}
    >
      <form className="member-form">
        {fields.map((field) => (
          <label key={field.label}>
            <span>{field.label}</span>
            <input placeholder={field.placeholder} disabled />
          </label>
        ))}
        <ActionButton disabled>{actionLabel}</ActionButton>
      </form>
    </DetailCard>
  );
}
