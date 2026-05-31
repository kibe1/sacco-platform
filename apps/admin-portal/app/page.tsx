import { createKeycloakLoginUrl } from "./lib/keycloak";

const modules = ["Tenants", "Members", "Savings", "Loans", "Payments", "Reports"];

export default function AdminHomePage() {
  const loginUrl = createKeycloakLoginUrl();

  return (
    <main className="layout">
      <aside>
        <h1>SACCO Admin</h1>
        <nav aria-label="Main navigation">
          {modules.map((module) => (
            <a href="#" key={module}>
              {module}
            </a>
          ))}
        </nav>
      </aside>
      <section className="content">
        <p className="eyebrow">Operations</p>
        <h2>Admin workspace</h2>
        <div className="panel">
          <strong>Implementation foundation ready</strong>
          <p>Connect authentication, tenant context, and module APIs next.</p>
          <a className="action" href={loginUrl}>
            Sign in with Keycloak
          </a>
        </div>
      </section>
    </main>
  );
}
