import { createKeycloakLoginUrl } from "./lib/keycloak";

const summaryItems = [
  { label: "Savings Balance", value: "KES 0.00" },
  { label: "Loan Balance", value: "KES 0.00" },
  { label: "Wallet Balance", value: "KES 0.00" }
];

export default function MemberHomePage() {
  const loginUrl = createKeycloakLoginUrl();

  return (
    <main className="shell">
      <section className="header">
        <div>
          <p className="eyebrow">Member Portal</p>
          <h1>SACCO self-service</h1>
        </div>
        <a className="button" href={loginUrl}>
          Sign in
        </a>
      </section>

      <section className="grid" aria-label="Account summary">
        {summaryItems.map((item) => (
          <article className="card" key={item.label}>
            <p>{item.label}</p>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
