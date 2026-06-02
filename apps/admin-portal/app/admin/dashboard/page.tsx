import { getDashboardData } from "../admin-data";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthlyCollections = [155, 375, 190, 285, 175, 185, 278, 100, 205, 380, 268, 100];
const repaymentTrend = [178, 188, 168, 158, 174, 164, 168, 205, 228, 210, 238, 234];
const savingsTrend = [40, 30, 50, 40, 55, 40, 70, 98, 108, 120, 148, 138];

function formatCompact(value: string) {
  const number = Number(value.replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(number) || number === 0) return value;
  return number.toLocaleString("en-KE", { maximumFractionDigits: 0 });
}

function StatCard({
  title,
  value,
  change,
  direction,
  icon
}: {
  title: string;
  value: string;
  change: string;
  direction: "up" | "down";
  icon: string;
}) {
  return (
    <article className="tail-card tail-stat-card">
      <div className="tail-card-icon">{icon}</div>
      <div className="tail-stat-bottom">
        <div>
          <p>{title}</p>
          <strong>{value}</strong>
        </div>
        <span className={`tail-change ${direction}`}>{direction === "up" ? "↑" : "↓"} {change}</span>
      </div>
    </article>
  );
}

function MonthlyCollectionsCard() {
  return (
    <section className="tail-card tail-monthly-card">
      <div className="tail-card-heading">
        <h2>Monthly Collections</h2>
        <button type="button" aria-label="Chart menu">⋮</button>
      </div>
      <div className="tail-bar-chart" aria-label="Monthly SACCO collections chart">
        <div className="tail-chart-grid">
          {[400, 300, 200, 100, 0].map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <div className="tail-bars">
          {monthlyCollections.map((value, index) => (
            <div className="tail-bar-column" key={months[index]}>
              <span style={{ height: `${(value / 400) * 100}%` }} />
              <small>{months[index]}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CollectionTargetCard({
  month,
  week,
  today,
  outstanding,
  arrears,
  uptime
}: {
  month: string;
  week: string;
  today: string;
  outstanding: string;
  arrears: string;
  uptime: string;
}) {
  return (
    <section className="tail-card tail-target-card">
      <div className="tail-card-heading">
        <div>
          <h2>Collection Target</h2>
          <p>Repayment and channel performance this month</p>
        </div>
        <button type="button" aria-label="Collection menu">⋮</button>
      </div>
      <div className="tail-gauge" aria-label="Collection target 75.55 percent">
        <svg viewBox="0 0 260 150" role="img">
          <path className="track" d="M32 126a98 98 0 0 1 196 0" />
          <path className="progress" d="M32 126a98 98 0 0 1 196 0" />
        </svg>
        <div className="tail-gauge-value">
          <strong>75.55%</strong>
          <span>+10%</span>
        </div>
      </div>
      <p className="tail-target-copy">This month's collection is {month}. Channel uptime is steady at {uptime}.</p>
      <div className="tail-target-footer">
        <div>
          <span>Today</span>
          <strong>{today} <b>↑</b></strong>
        </div>
        <div>
          <span>This Week</span>
          <strong>{week} <b>↑</b></strong>
        </div>
        <div>
          <span>Arrears</span>
          <strong>{arrears} <b className="down">↓</b></strong>
        </div>
      </div>
      <p className="tail-target-copy subtle">Outstanding portfolio: {outstanding}</p>
    </section>
  );
}

function PortfolioStatisticsCard() {
  const pointsA = repaymentTrend.map((value, index) => `${index * 9.09},${260 - value}`).join(" ");
  const pointsB = savingsTrend.map((value, index) => `${index * 9.09},${260 - value}`).join(" ");

  return (
    <section className="tail-card tail-statistics-card">
      <div className="tail-card-heading tail-statistics-heading">
        <div>
          <h2>Portfolio Statistics</h2>
          <p>Repayment and savings movement trend</p>
        </div>
        <div className="tail-tabs">
          <button className="active" type="button">Monthly</button>
          <button type="button">Quarterly</button>
          <button type="button">Annually</button>
          <button type="button" className="date">□ FY 2026</button>
        </div>
      </div>
      <div className="tail-line-chart">
        <svg viewBox="0 0 100 270" preserveAspectRatio="none">
          <defs>
            <linearGradient id="tailAreaA" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#465fff" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#465fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="tailAreaB" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#8cb4ff" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#8cb4ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 50, 100, 150, 200, 250].map((tick) => (
            <line key={tick} x1="0" x2="100" y1={260 - tick} y2={260 - tick} />
          ))}
          <polygon points={`0,270 ${pointsA} 100,270`} fill="url(#tailAreaA)" />
          <polygon points={`0,270 ${pointsB} 100,270`} fill="url(#tailAreaB)" />
          <polyline points={pointsA} className="primary" />
          <polyline points={pointsB} className="secondary" />
        </svg>
      </div>
    </section>
  );
}

export default async function DashboardPage() {
  const { summary, collections } = await getDashboardData();

  return (
    <main className="tail-dashboard">
      <div className="tail-dashboard-grid">
        <div className="tail-left-stack">
          <div className="tail-stat-grid">
            <StatCard title="Active Members" value={formatCompact(summary.activeMembers)} change="11.01%" direction="up" icon="♙" />
            <StatCard title="Outstanding Loans" value={formatCompact(summary.totalOutstanding)} change="9.05%" direction="down" icon="◇" />
          </div>
          <MonthlyCollectionsCard />
        </div>
        <CollectionTargetCard
          month={collections.month}
          week={collections.week}
          today={collections.today}
          outstanding={summary.totalOutstanding}
          arrears={summary.totalArrears}
          uptime={summary.channelUptime}
        />
        <PortfolioStatisticsCard />
      </div>
    </main>
  );
}
