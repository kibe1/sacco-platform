export default function ThemeManagerPage() {
  return (
    <main>
      <div className="page-heading">
        <h1>Theme Manager</h1>
      </div>

      <section className="dashboard-grid">
        <form className="panel form-panel span-6">
          <label>
            Organization Name
            <input defaultValue="KENYA SACCO LTD" name="organizationName" />
          </label>
          <label>
            Primary Color
            <input defaultValue="#465fff" name="primaryColor" type="color" />
          </label>
          <label>
            Accent Color
            <input defaultValue="#2563eb" name="accentColor" type="color" />
          </label>
          <button type="button">Save Theme</button>
        </form>
        <section className="chart-panel span-6">
          <div className="panel-heading">
            <div>
              <h2>Preview</h2>
              <p>Review how tenant branding appears across digital channels.</p>
            </div>
            <span className="status-badge success">Active</span>
          </div>
          <div className="snapshot-grid">
            <div>
              <span>Portal Brand</span>
              <strong>KENYA SACCO LTD</strong>
            </div>
            <div>
              <span>Primary Button</span>
              <strong style={{ color: "var(--brand)" }}>#465fff</strong>
            </div>
            <div>
              <span>Accent</span>
              <strong style={{ color: "var(--accent)" }}>#2563eb</strong>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
