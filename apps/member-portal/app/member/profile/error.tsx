"use client";

import { PageHeader } from "../member-ui";

export default function ProfileError({ reset }: { reset: () => void }) {
  return (
    <main className="member-module-page">
      <PageHeader
        eyebrow="Profile"
        title="Member Profile"
        description="We could not load the member profile details."
      />

      <section className="member-detail-card">
        <div className="member-empty-state">
          <div>
            <strong>Profile unavailable</strong>
            <p>Please retry. If the issue continues, contact support.</p>
            <button className="member-action-button" type="button" onClick={reset}>Retry</button>
          </div>
        </div>
      </section>
    </main>
  );
}
