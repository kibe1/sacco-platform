import { getModules } from "../admin-data";

export default async function MenuManagerPage() {
  const modules = await getModules();

  return (
    <main>
      <div className="page-heading">
        <h1>Manage Menu</h1>
      </div>

      <section className="module-grid">
        {modules.map((module) => (
          <article className="module-card" key={module.id}>
            <div>
              <strong>{module.name}</strong>
              <span>Available for authorized administration.</span>
            </div>
            <b className="status-badge success">{module.status}</b>
          </article>
        ))}
      </section>
    </main>
  );
}
