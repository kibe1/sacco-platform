import type { StatusTone } from "../member-data";
import { memberProfile } from "../member-data";
import { InfoCard, StatusPill } from "../member-ui";

type KycDocumentStatus = "Submitted" | "Missing" | "Under Review" | "Rejected" | "Verified";

type KycDocument = {
  name: string;
  status: KycDocumentStatus;
  uploadDate?: string;
  rejectionReason?: string;
};

type KycSectionProps = {
  status: string;
  lastUpdated: string;
  completionPercentage?: number;
};

const requiredDocuments = [
  "National ID (front)",
  "National ID (back)",
  "Passport photo",
  "Proof of address"
];

function normalizeStatus(status: string): string {
  const normalized = status.trim().toLowerCase();

  if (normalized.includes("verified")) return "Verified";
  if (normalized.includes("pending")) return "Pending";
  if (normalized.includes("incomplete")) return "Incomplete";
  if (normalized.includes("review")) return "Under Review";

  return status || "Pending";
}

function kycMessage(status: string): string {
  const normalized = normalizeStatus(status);

  if (normalized === "Verified") return "Your identity has been verified";
  if (normalized === "Pending") return "Your documents are under review";
  if (normalized === "Incomplete") return "Some required documents are missing";
  if (normalized === "Under Review") return "Your KYC is currently being reviewed by our team";

  return "Your KYC status is being prepared";
}

function statusTone(status: string): StatusTone {
  const normalized = normalizeStatus(status);

  if (normalized === "Verified") return "success";
  if (normalized === "Rejected") return "danger";
  if (normalized === "Under Review" || normalized === "Pending") return "warning";
  if (normalized === "Submitted") return "info";

  return "neutral";
}

function sourceDocument(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("national id") && normalized.includes("front")) {
    return memberProfile.documents.find((document) => document.name.toLowerCase().includes("national id"));
  }

  if (normalized.includes("proof of address")) {
    return memberProfile.documents.find((document) => document.name.toLowerCase().includes("proof"));
  }

  if (normalized.includes("passport")) {
    return memberProfile.documents.find((document) => document.name.toLowerCase().includes("passport"));
  }

  return undefined;
}

function documentStatus(status?: string): KycDocumentStatus {
  const normalized = status?.toLowerCase() ?? "";

  if (!status) return "Missing";
  if (normalized.includes("verified")) return "Verified";
  if (normalized.includes("reject")) return "Rejected";
  if (normalized.includes("review")) return "Under Review";
  if (normalized.includes("submit")) return "Submitted";

  return "Submitted";
}

function requiredDocumentList(): KycDocument[] {
  return requiredDocuments.map((name) => {
    const source = sourceDocument(name);
    const status = documentStatus(source?.status);

    return {
      name,
      status,
      uploadDate: status === "Missing" ? undefined : source?.updated,
      rejectionReason: status === "Rejected" ? "Please upload a clearer document." : undefined
    };
  });
}

export function KycSection({ status, lastUpdated, completionPercentage }: KycSectionProps) {
  const normalizedStatus = normalizeStatus(status);
  const documents = requiredDocumentList();
  const submittedCount = documents.filter((document) => document.status !== "Missing").length;
  const progressPercentage = completionPercentage ?? Math.round((submittedCount / documents.length) * 100);

  return (
    <section className="member-kyc-section" id="kyc-documents">
      <div className="member-tab-section-heading">
        <div>
          <h2>KYC Status Overview</h2>
          <p>Your identity verification status and required document checklist.</p>
        </div>
        <StatusPill tone={statusTone(normalizedStatus)}>{normalizedStatus}</StatusPill>
      </div>

      <div className="member-kyc-overview">
        <div className="member-info-grid">
          <InfoCard title="Overall Status" value={normalizedStatus} detail={kycMessage(normalizedStatus)} icon="check-circle" tone="blue" />
          <InfoCard title="Last Updated" value={lastUpdated} detail="Most recent verification update" icon="time" tone="blue" />
          <InfoCard title="Progress" value={`${submittedCount} of ${documents.length}`} detail={`${progressPercentage}% complete`} icon="docs" tone="blue" />
        </div>

        <div className="member-kyc-progress" aria-label={`KYC completion ${progressPercentage}%`}>
          <div>
            <span>KYC progress</span>
            <strong>{submittedCount} of {documents.length} documents submitted</strong>
          </div>
          <div className="member-progress-track">
            <span style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
      </div>

      <div className="member-tab-section-heading compact">
        <div>
          <h2>Document Checklist</h2>
          <p>Document uploads are temporarily unavailable while secure submission is being prepared.</p>
        </div>
      </div>

      <div className="member-kyc-table-card">
        {documents.length > 0 ? (
          <div className="member-table-wrap">
            <table className="member-table member-kyc-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Status</th>
                  <th>Upload Date</th>
                  <th>Review Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr key={document.name}>
                    <td><strong>{document.name}</strong></td>
                    <td><StatusPill tone={statusTone(document.status)}>{document.status}</StatusPill></td>
                    <td>{document.uploadDate ?? "Not submitted"}</td>
                    <td>{document.rejectionReason ?? "No review note"}</td>
                    <td>
                      <div className="member-kyc-upload-action">
                        <button className="member-action-button secondary" disabled type="button">
                          {document.status === "Missing" ? "Upload" : "Re-upload"}
                        </button>
                        <small>JPG, PNG or PDF. Maximum file size: 2 MB.</small>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="member-empty-state">
            No KYC documents have been submitted yet.
          </div>
        )}
      </div>
    </section>
  );
}
