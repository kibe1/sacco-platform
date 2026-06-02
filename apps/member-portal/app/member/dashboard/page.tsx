import { loanProgress, memberSummary, moduleCards, quickActions, recentTransactions } from "../member-data";

export default function MemberDashboardPage() {
  return (
    <main>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Member Portal</p>
          <h1>Self-service dashboard</h1>
          <p>Manage savings, loans, wallet activity, statements, and support from one secure workspace.</p>
        </div>
      </section>

      <section className="metric-grid" aria-label="Member account summary">
        {memberSummary.map((item) => (
          <article className={`metric-card ${item.tone}`} key={item.label}>
            <span />
            <div>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel span-4">
          <div className="panel-heading">
            <div>
              <h2>Quick actions</h2>
              <p>Common member tasks ready for API integration.</p>
            </div>
          </div>
          <div className="action-list">
            {quickActions.map((action) => (
              <button type="button" key={action}>
                {action}
              </button>
            ))}
          </div>
        </article>

        <article className="panel span-8">
          <div className="panel-heading">
            <div>
              <h2>Loan health</h2>
              <p>Repayment progress and account standing placeholders.</p>
            </div>
            <span className="status-badge success">Current</span>
          </div>
          <div className="bar-list">
            {loanProgress.map((item) => (
              <div className="bar-item" key={item.label}>
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.percentage}%</span>
                </div>
                <div className="bar-track">
                  <span style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel span-7">
          <div className="panel-heading">
            <div>
              <h2>Recent transactions</h2>
              <p>Latest savings, loan, and wallet activity.</p>
            </div>
          </div>
          <div className="transaction-list">
            {recentTransactions.map((transaction) => (
              <div className="transaction-row" key={transaction.reference}>
                <time>{transaction.date}</time>
                <div>
                  <strong>{transaction.type}</strong>
                  <small>{transaction.reference}</small>
                </div>
                <span>{transaction.amount}</span>
                <b>{transaction.status}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="panel span-5">
          <div className="panel-heading">
            <div>
              <h2>Channel readiness</h2>
              <p>Web/PWA, mobile, and USSD share backend business services.</p>
            </div>
          </div>
          <div className="status-list">
            {["Web/PWA authenticated", "Mobile API compatible", "USSD adapter ready for menu mapping"].map((item) => (
              <div className="status-row" key={item}>
                <span className="status-dot online" />
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="module-grid" aria-label="Member modules">
        {moduleCards.map((module) => (
          <a className="module-card" href={module.href} key={module.title}>
            <strong>{module.title}</strong>
            <span>{module.detail}</span>
          </a>
        ))}
      </section>
    </main>
  );
}
