"use client";

import type { ReactNode } from "react";
import { useMemo, useRef, useState, useTransition } from "react";
import type { ProfileChangeRequestStatus, StatusTone } from "../member-data";
import { StatusPill } from "../member-ui";
import { KycSection } from "./kyc-section";
import { submitProfileChangeRequest, uploadProfileImage } from "./profile-actions";

type PreferenceKey = "email" | "sms" | "push" | "marketing";
type ProfileTab = "kyc" | "requests" | "security" | "preferences";

type ChangeRequest = {
  field: string;
  requestedValue: string;
  submittedAt: string;
  status: ProfileChangeRequestStatus;
  rejectionReason?: string;
};

type RestrictedField = {
  field: string;
  label: string;
  currentValue: string;
  inputType?: string;
};

type ProfileEditControlsProps = {
  initials: string;
  identityName: string;
  identityEmail: string;
  memberNumber: string;
  branch: string;
  tenantName: string;
  lifecycleStatus: string;
  lifecycleTone: StatusTone;
  memberSince: string;
  mobile: string;
  dateOfBirth: string;
  gender: string;
  nationalIdNumber: string;
  physicalAddress: string;
  twoFactorStatus: string;
  lastLogin: string;
  roles: string[];
  keycloakAccountUrl: string;
  kycStatus: string;
  kycLastUpdated: string;
  kycCompletionPercentage?: number;
  profileImageUrl?: string;
  restrictedFields: RestrictedField[];
  communicationPreferences: Record<PreferenceKey, boolean>;
  existingChangeRequests: ChangeRequest[];
};

type FormStatus = {
  tone: "success" | "warning" | "danger" | "info" | "neutral";
  message: string;
};

const preferenceLabels: Array<{ key: PreferenceKey; label: string; description: string }> = [
  { key: "email", label: "Email notifications", description: "Receive service updates by email." },
  { key: "sms", label: "SMS notifications", description: "Receive account alerts by SMS." },
  { key: "push", label: "Push notifications", description: "Receive PWA and mobile alerts." },
  { key: "marketing", label: "Product updates", description: "Receive optional SACCO product messages." }
];

const tabs: Array<{ key: ProfileTab; label: string }> = [
  { key: "kyc", label: "KYC & Documents" },
  { key: "requests", label: "Change Requests" },
  { key: "security", label: "Security" },
  { key: "preferences", label: "Preferences" }
];

function requestTone(status: ProfileChangeRequestStatus) {
  if (status === "Approved") return "success";
  if (status === "Rejected") return "danger";
  return "warning";
}

function todayLabel() {
  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date());
}

function ProfileField({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  return (
    <div className="member-profile-field">
      <span>{label}</span>
      {children ?? <strong>{value}</strong>}
    </div>
  );
}

export function ProfileEditControls({
  initials,
  identityName,
  identityEmail,
  memberNumber,
  branch,
  tenantName,
  lifecycleStatus,
  lifecycleTone,
  memberSince,
  mobile,
  dateOfBirth,
  gender,
  nationalIdNumber,
  physicalAddress,
  twoFactorStatus,
  lastLogin,
  roles,
  keycloakAccountUrl,
  kycStatus,
  kycLastUpdated,
  kycCompletionPercentage,
  profileImageUrl,
  restrictedFields,
  communicationPreferences,
  existingChangeRequests
}: ProfileEditControlsProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("kyc");
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(profileImageUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageStatus, setImageStatus] = useState<FormStatus | null>(null);
  const [preferences, setPreferences] = useState(communicationPreferences);
  const [preferenceStatus, setPreferenceStatus] = useState<FormStatus | null>(null);
  const [requests, setRequests] = useState(existingChangeRequests);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [requestedValue, setRequestedValue] = useState("");
  const [reason, setReason] = useState("");
  const [fieldStatuses, setFieldStatuses] = useState<Record<string, FormStatus>>({});
  const [isImagePending, startImageTransition] = useTransition();
  const [isChangePending, startChangeTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requestsByField = useMemo(() => {
    return requests.reduce<Record<string, ChangeRequest>>((accumulator, request) => {
      accumulator[request.field] = request;
      return accumulator;
    }, {});
  }, [requests]);

  function handleImageSelection(file: File | null) {
    setImageStatus(null);
    setSelectedFile(file);

    if (!file) {
      setPreviewUrl(profileImageUrl);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleImageUpload() {
    if (!selectedFile) {
      setImageStatus({ tone: "warning", message: "Choose an image before confirming." });
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    startImageTransition(async () => {
      const result = await uploadProfileImage(formData);

      if (result.ok) {
        setImageStatus({ tone: "success", message: "Profile image updated successfully." });
        setSelectedFile(null);
        if (result.data?.imageUrl) {
          setPreviewUrl(result.data.imageUrl);
        }
        return;
      }

      setImageStatus({
        tone: result.backendReady ? "danger" : "info",
        message: result.backendReady
          ? result.message
          : "Profile image upload is not available yet. The selected preview has not been saved."
      });
    });
  }

  function beginEdit(field: RestrictedField) {
    const pendingRequest = requestsByField[field.field];

    if (pendingRequest?.status === "Pending") {
      return;
    }

    setActiveField(field.field);
    setRequestedValue(field.currentValue === "Not provided" ? "" : field.currentValue);
    setReason("");
    setFieldStatuses((current) => {
      const next = { ...current };
      delete next[field.field];
      return next;
    });
  }

  function submitFieldRequest(field: RestrictedField) {
    startChangeTransition(async () => {
      const result = await submitProfileChangeRequest({
        field: field.field,
        currentValue: field.currentValue,
        requestedValue,
        reason
      });

      if (result.ok) {
        setRequests((current) => [
          ...current.filter((request) => request.field !== field.field),
          {
            field: field.field,
            requestedValue,
            submittedAt: todayLabel(),
            status: "Pending"
          }
        ]);
        setActiveField(null);
        setRequestedValue("");
        setReason("");
        setFieldStatuses((current) => ({
          ...current,
          [field.field]: { tone: "success", message: "Change request submitted for approval." }
        }));
        return;
      }

      setFieldStatuses((current) => ({
        ...current,
        [field.field]: {
          tone: result.backendReady ? "danger" : "info",
          message: result.backendReady
            ? result.message
            : "Change requests are not available yet. Your current value has not been changed."
        }
      }));
    });
  }

  return (
    <div className="member-profile-workspace">
      <section className="member-profile-hero">
        <div className="member-profile-hero-main">
          <div className="member-profile-avatar-wrap">
            <button
              className="member-profile-avatar member-profile-avatar-button"
              type="button"
              aria-label="Choose profile image"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? <img src={previewUrl} alt="" aria-hidden="true" /> : <span>{initials}</span>}
              <span className="member-avatar-camera" aria-hidden="true">
                <img src="/tailadmin-icons/pencil.svg" alt="" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              accept="image/*"
              className="visually-hidden"
              type="file"
              onChange={(event) => handleImageSelection(event.target.files?.[0] ?? null)}
            />
          </div>

          <div className="member-profile-summary">
            <h1>{identityName}</h1>
            <p>{memberNumber} · {branch} · Member since {memberSince}</p>
            <span>{tenantName}</span>
          </div>
        </div>

        <div className="member-profile-hero-side">
          <StatusPill tone={lifecycleTone}>{lifecycleStatus}</StatusPill>
          {selectedFile && (
            <div className="member-hero-image-actions">
              <button className="member-action-button" type="button" disabled={isImagePending} onClick={handleImageUpload}>
                {isImagePending ? "Uploading..." : "Confirm image"}
              </button>
              <button className="member-action-button secondary" type="button" onClick={() => handleImageSelection(null)}>
                Remove preview
              </button>
            </div>
          )}
        </div>
        {imageStatus && <div className={`member-form-message ${imageStatus.tone}`}>{imageStatus.message}</div>}
      </section>

      <section className="member-profile-info-layout">
        <div className="member-profile-info-card">
          <h2>Personal Information</h2>
          <ProfileField label="Full name" value={identityName} />
          <ProfileField label="Email address" value={identityEmail} />
          <ProfileField label="Mobile number" value={mobile} />
          <ProfileField label="Date of birth" value={dateOfBirth} />
          <ProfileField label="Gender" value={gender} />
          <ProfileField label="National ID number" value={nationalIdNumber} />
          <ProfileField label="Physical address" value={physicalAddress} />
        </div>

        <div className="member-profile-info-card">
          <h2>SACCO Information</h2>
          <ProfileField label="SACCO name" value={tenantName} />
          <ProfileField label="Branch" value={branch} />
          <ProfileField label="Member number" value={memberNumber} />
          <ProfileField label="Lifecycle status">
            <StatusPill tone={lifecycleTone}>{lifecycleStatus}</StatusPill>
          </ProfileField>
          <ProfileField label="Member since" value={memberSince} />
        </div>
      </section>

      <section className="member-profile-tabs">
        <div className="member-profile-tab-list" role="tablist" aria-label="Member profile sections">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="member-profile-tab-card">
          {activeTab === "kyc" && (
            <KycSection
              status={kycStatus}
              lastUpdated={kycLastUpdated}
              completionPercentage={kycCompletionPercentage}
            />
          )}

          {activeTab === "requests" && (
            <div className="member-change-request-list">
              {restrictedFields.map((field) => {
                const request = requestsByField[field.field];
                const isPending = request?.status === "Pending";
                const fieldStatus = fieldStatuses[field.field];
                const isEditing = activeField === field.field;

                return (
                  <section className="member-change-request-card" key={field.field}>
                    <div className="member-change-request-main">
                      <span>{field.label}</span>
                      <strong>{field.currentValue}</strong>
                      {request && (
                        <div className="member-request-history">
                          <StatusPill tone={requestTone(request.status)}>{request.status}</StatusPill>
                          <small>Requested value: {request.requestedValue}</small>
                          <small>Submitted: {request.submittedAt}</small>
                          {request.rejectionReason && <small>Reason: {request.rejectionReason}</small>}
                        </div>
                      )}
                      {fieldStatus && <div className={`member-form-message ${fieldStatus.tone}`}>{fieldStatus.message}</div>}
                    </div>
                    <div className="member-change-request-action">
                      <button
                        className="member-action-button secondary"
                        disabled={isPending || isChangePending}
                        type="button"
                        onClick={() => beginEdit(field)}
                      >
                        {isPending ? "Pending Approval" : "Edit"}
                      </button>
                    </div>
                    {isEditing && (
                      <form
                        className="member-change-request-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          submitFieldRequest(field);
                        }}
                      >
                        <label>
                          <span>Requested value</span>
                          <input
                            type={field.inputType ?? "text"}
                            value={requestedValue}
                            onChange={(event) => setRequestedValue(event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Reason</span>
                          <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional reason for this change" />
                        </label>
                        <div className="member-form-actions">
                          <button className="member-action-button" type="submit" disabled={isChangePending}>
                            {isChangePending ? "Submitting..." : "Submit request"}
                          </button>
                          <button className="member-action-button secondary" type="button" onClick={() => setActiveField(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </section>
                );
              })}
            </div>
          )}

          {activeTab === "security" && (
            <div className="member-security-panel">
              <div className="member-security-heading">
                <div>
                  <h2>Security & Access</h2>
                  <p>Account protection and sign-in details for this member profile.</p>
                </div>
                <a className="member-action-button secondary" href={keycloakAccountUrl} target="_blank" rel="noreferrer">
                  Change password
                </a>
              </div>
              <ProfileField label="2FA status" value={twoFactorStatus} />
              <ProfileField label="Last login" value={lastLogin} />
              <ProfileField label="Access roles">
                <span className="member-role-list">
                  {roles.length > 0
                    ? roles.map((role) => <StatusPill key={role} tone="info">{role}</StatusPill>)
                    : <StatusPill tone="neutral">No roles assigned</StatusPill>}
                </span>
              </ProfileField>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="member-preferences-panel">
              <div className="member-tab-section-heading">
                <div>
                  <h2>Communication Preferences</h2>
                  <p>Choose how you want to receive member service updates.</p>
                </div>
              </div>
              <div className="member-preference-list">
                {preferenceLabels.map((preference) => (
                  <label className="member-preference-row" key={preference.key}>
                    <span>
                      <strong>{preference.label}</strong>
                      <small>{preference.description}</small>
                    </span>
                    <input
                      checked={preferences[preference.key]}
                      type="checkbox"
                      onChange={(event) => {
                        setPreferences((current) => ({ ...current, [preference.key]: event.target.checked }));
                        setPreferenceStatus(null);
                      }}
                    />
                  </label>
                ))}
              </div>
              <button
                className="member-action-button"
                type="button"
                onClick={() => setPreferenceStatus({ tone: "success", message: "Communication preferences saved." })}
              >
                Save preferences
              </button>
              {preferenceStatus && <div className={`member-form-message ${preferenceStatus.tone}`}>{preferenceStatus.message}</div>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
