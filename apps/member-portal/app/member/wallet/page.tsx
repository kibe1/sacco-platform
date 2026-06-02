export default function WalletPage() {
  return (
    <main>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Wallet</p>
          <h1>Wallet activity</h1>
          <p>Wallet balances, transfers, payment references, holds, limits, and reconciliation status.</p>
        </div>
      </section>
      <section className="panel">
        <h2>Wallet service integration pending</h2>
        <p>This module will consume wallet-service APIs without owning transaction posting rules.</p>
      </section>
    </main>
  );
}
