export default function ProfilePage() {
  return (
    <main>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Member profile</h1>
          <p>KYC status, contact information, linked identifiers, documents, and notification preferences.</p>
        </div>
      </section>
      <section className="panel">
        <h2>Member service integration pending</h2>
        <p>Profile data will come from member-service and tenant-aware identity context.</p>
      </section>
    </main>
  );
}
