import { PageHeader } from "../member-ui";

export default function ProfileLoading() {
  return (
    <main className="member-module-page">
      <PageHeader
        eyebrow="Profile"
        title="Member Profile"
        description="Loading member profile details."
      />

      <section className="member-profile-hero">
        <div className="member-profile-skeleton-row">
          <div className="member-skeleton avatar" />
          <div className="member-profile-skeleton-grid">
            <div className="member-skeleton line" />
            <div className="member-skeleton line short" />
          </div>
        </div>
      </section>

      <div className="member-info-grid">
        <div className="member-skeleton" />
        <div className="member-skeleton" />
        <div className="member-skeleton" />
      </div>

      <div className="member-two-column">
        <div className="member-skeleton" />
        <div className="member-skeleton" />
      </div>
    </main>
  );
}
