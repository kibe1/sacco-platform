import { memberHomeSummary } from "../member-data";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const contributionTrend = [23, 24.5, 22.6, 24.8, 23.2, 25.2, 24.6, 27, 25.8, 28.5, 27.3, 30.9];
const repaymentTrend = [13, 14.2, 12.6, 14.7, 13.3, 15.5, 14.6, 17, 16, 18.4, 17.2, 19.8];

function Icon({ name, label }: { name: string; label: string }) {
  return <img src={`/tailadmin-icons/${name}.svg`} alt="" aria-label={label} />;
}

function MetricCard({
  label,
  value,
  helper,
  change,
  direction,
  icon
}: {
  label: string;
  value: string;
  helper: string;
  change: string;
  direction: "up" | "down";
  icon: string;
}) {
  return (
    <article className="ai-metric-card">
      <div className="ai-metric-top">
        <span>{label}</span>
        <span className="ai-metric-icon"><Icon name={icon} label={label} /></span>
      </div>
      <strong>{value}</strong>
      <div className="ai-metric-bottom">
        <span>{helper}</span>
        <b className={direction}>{direction === "up" ? "↑" : "↓"} {change}</b>
      </div>
    </article>
  );
}

function SavingsLoanStatistics() {
  const contributionPoints = contributionTrend.map((value, index) => `${index * 9.09},${36 - value}`).join(" ");
  const repaymentPoints = repaymentTrend.map((value, index) => `${index * 9.09},${36 - value}`).join(" ");

  return (
    <section className="ai-card ai-statistics-panel">
      <div className="ai-panel-heading">
        <div>
          <h2>Savings & Loan Statistics</h2>
          <p>Monthly contribution and repayment movement.</p>
        </div>
        <div className="ai-tabs" aria-label="Statistics period">
          <button className="active" type="button">Monthly</button>
          <button type="button">Quarterly</button>
          <button type="button">Annually</button>
        </div>
      </div>
      <div className="ai-chart-legend">
        <span><b className="primary" /> Savings</span>
        <span><b className="secondary" /> Repayments</span>
      </div>
      <div className="ai-area-chart" aria-label="Savings and repayments chart">
        <div className="ai-y-axis">
          {["35K", "30K", "25K", "20K", "15K", "10K", "5K", "0"].map((tick) => <span key={tick}>{tick}</span>)}
        </div>
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img">
          <defs>
            <linearGradient id="memberAiPrimary" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#465fff" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#465fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="memberAiSecondary" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#8cb4ff" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#8cb4ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[5, 10, 15, 20, 25, 30, 35].map((tick) => (
            <line key={tick} x1="0" x2="100" y1={40 - tick} y2={40 - tick} />
          ))}
          <polygon points={`0,40 ${contributionPoints} 100,40`} className="area-primary" />
          <polygon points={`0,40 ${repaymentPoints} 100,40`} className="area-secondary" />
          <polyline points={contributionPoints} className="line-primary" />
          <polyline points={repaymentPoints} className="line-secondary" />
        </svg>
        <div className="ai-x-axis">
          {months.map((month) => <span key={month}>{month}</span>)}
        </div>
      </div>
    </section>
  );
}

function ServiceUsage() {
  return (
    <section className="ai-card ai-usage-panel">
      <div className="ai-panel-heading">
        <h2>Member Services</h2>
        <button type="button" aria-label="Member services menu">
          <Icon name="horizontal-dots" label="More" />
        </button>
      </div>
      <div className="ai-donut" aria-label="Member service distribution">
        <div className="ai-donut-ring" />
        <div className="ai-donut-center">
          <strong>241.4K</strong>
          <span>Total value</span>
        </div>
      </div>
      <div className="ai-usage-list">
        {memberHomeSummary.services.map((service) => (
          <div className="ai-usage-row" key={service.name}>
            <span className={`ai-service-icon ${service.color}`}>
              <Icon name={service.icon} label={service.name} />
            </span>
            <div>
              <strong>{service.name}</strong>
              <p>{service.detail}</p>
            </div>
            <b>{service.amount}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function AnalyticsCard({ title, text, value }: { title: string; text: string; value: string }) {
  return (
    <section className="ai-card ai-analytics-card">
      <div className="ai-panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <button type="button" aria-label={`${title} menu`}>
          <Icon name="horizontal-dots" label="More" />
        </button>
      </div>
      <div className="ai-mini-chart">
        {[44, 52, 48, 61, 58, 69, 72, 65, 78, 84].map((height, index) => (
          <span key={index} style={{ height: `${height}%` }} />
        ))}
      </div>
      <strong>{value}</strong>
    </section>
  );
}

export default function MemberDashboardPage() {
  return (
    <main className="ai-dashboard">
      <div className="ai-metrics-grid">
        {memberHomeSummary.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <div className="ai-dashboard-grid">
        <SavingsLoanStatistics />
        <ServiceUsage />
      </div>
      <div className="ai-bottom-grid">
        <AnalyticsCard title="Savings Analytics" text="Contribution movement and account activity." value="KES 12,000 monthly target" />
        <AnalyticsCard title="Loan Analytics" text="Repayment progress and account standing." value="Current account status" />
      </div>
      <section className="member-detail-card">
        <div className="member-card-heading">
          <div>
            <h2>Recent Activity</h2>
            <p>Latest member-facing transactions and service updates.</p>
          </div>
        </div>
        <div className="member-activity-list">
          {memberHomeSummary.recentActivity.map((activity) => (
            <div className="member-activity-row" key={activity.reference}>
              <time>{activity.date}</time>
              <div>
                <strong>{activity.title}</strong>
                <span>{activity.reference}</span>
              </div>
              <b>{activity.amount}</b>
              <span className={`member-status-pill ${activity.tone}`}>{activity.status}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
