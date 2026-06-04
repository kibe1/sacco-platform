import type { StatusTone } from "../member-data";
import { keycloakBaseUrl, realm } from "../../lib/keycloak";
import { getCurrentUser } from "../../lib/session";
import { memberApi } from "../member-api";
import { memberCommunicationPreferences, memberProfile, memberProfileChangeRequests } from "../member-data";
import { ProfileEditControls } from "./profile-edit-controls";

type GatewayProfile = Partial<{
  memberNumber: string;
  memberNo: string;
  accountNo: string;
  fullName: string;
  displayName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobile: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  nationalIdNumber: string;
  nationalId: string;
  idNumber: string;
  physicalAddress: string;
  address: string;
  branch: string;
  branchName: string;
  tenantName: string;
  saccoName: string;
  tenant: string;
  lifecycleStatus: string;
  status: string;
  memberSince: string;
  joinedOn: string;
  createdAt: string;
  lastLoginAt: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
  mfaEnabled: boolean;
  profileImageUrl: string;
  avatarUrl: string;
}>;

type GatewayKycStatus = Partial<{
  overallStatus: string;
  status: string;
  kycStatus: string;
  updatedAt: string;
  lastUpdated: string;
  completionPercentage: number;
}>;

const emptyValue = "Not provided";

function coalesceString(...values: Array<unknown>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function displayField(...values: Array<unknown>): string {
  return coalesceString(...values) || emptyValue;
}

function fullNameFromProfile(profile?: GatewayProfile | null) {
  return coalesceString(
    profile?.fullName,
    profile?.displayName,
    [profile?.firstName, profile?.middleName, profile?.lastName].filter(Boolean).join(" ")
  );
}

function initialsFromName(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "MU";
}

function statusTone(status: string): StatusTone {
  const normalized = status.toLowerCase();

  if (["active", "verified", "enabled", "current", "complete", "completed"].some((value) => normalized.includes(value))) {
    return "success";
  }

  if (["pending", "review", "dormant"].some((value) => normalized.includes(value))) {
    return "warning";
  }

  if (["suspended", "blocked", "incomplete", "failed", "disabled"].some((value) => normalized.includes(value))) {
    return "danger";
  }

  return "neutral";
}

function booleanStatus(profile?: GatewayProfile | null) {
  if (profile?.twoFactorEnabled === true || profile?.mfaEnabled === true) {
    return "Enabled";
  }

  if (profile?.twoFactorEnabled === false || profile?.mfaEnabled === false) {
    return "Not enabled";
  }

  return memberProfile.security.find((item) => item.label === "MFA")?.value ?? emptyValue;
}

export default async function ProfilePage() {
  const [currentUser, gatewayProfile, gatewayKycStatus] = await Promise.all([
    getCurrentUser(),
    memberApi.profile<GatewayProfile>(),
    memberApi.kycStatus<GatewayKycStatus>()
  ]);

  const identityName = displayField(
    currentUser?.profile.displayName,
    fullNameFromProfile(gatewayProfile),
    memberProfile.fullName
  );
  const identityEmail = displayField(currentUser?.profile.email, gatewayProfile?.email, memberProfile.email);
  const roles = currentUser?.profile.roles ?? [];
  const memberNumber = displayField(gatewayProfile?.memberNumber, gatewayProfile?.memberNo, gatewayProfile?.accountNo, memberProfile.memberNumber);
  const branch = displayField(gatewayProfile?.branch, gatewayProfile?.branchName, memberProfile.branch);
  const tenantName = displayField(gatewayProfile?.tenantName, gatewayProfile?.saccoName, gatewayProfile?.tenant, "Kenya Sacco LTD");
  const lifecycleStatus = displayField(gatewayProfile?.lifecycleStatus, gatewayProfile?.status, memberProfile.status);
  const memberSince = displayField(gatewayProfile?.memberSince, gatewayProfile?.joinedOn, gatewayProfile?.createdAt, memberProfile.joinedOn);
  const kycStatus = displayField(gatewayKycStatus?.overallStatus, gatewayKycStatus?.status, gatewayKycStatus?.kycStatus, memberProfile.kycStatus);
  const kycLastUpdated = displayField(gatewayKycStatus?.updatedAt, gatewayKycStatus?.lastUpdated, memberProfile.lastUpdated);
  const mobile = displayField(gatewayProfile?.mobile, gatewayProfile?.phone, memberProfile.mobile);
  const dateOfBirth = displayField(gatewayProfile?.dateOfBirth);
  const gender = displayField(gatewayProfile?.gender);
  const nationalIdNumber = displayField(gatewayProfile?.nationalIdNumber, gatewayProfile?.nationalId, gatewayProfile?.idNumber);
  const physicalAddress = displayField(
    gatewayProfile?.physicalAddress,
    gatewayProfile?.address,
    memberProfile.contacts.find((contact) => contact.label.toLowerCase().includes("address"))?.value
  );
  const keycloakAccountUrl = `${keycloakBaseUrl}/realms/${realm}/account/`;
  const initials = initialsFromName(identityName);
  const twoFactorStatus = booleanStatus(gatewayProfile);
  const lastLogin = displayField(gatewayProfile?.lastLoginAt, gatewayProfile?.lastLogin);

  return (
    <main className="member-module-page">
      <ProfileEditControls
        initials={initials}
        identityName={identityName}
        identityEmail={identityEmail}
        memberNumber={memberNumber}
        branch={branch}
        tenantName={tenantName}
        lifecycleStatus={lifecycleStatus}
        lifecycleTone={statusTone(lifecycleStatus)}
        memberSince={memberSince}
        mobile={mobile}
        dateOfBirth={dateOfBirth}
        gender={gender}
        nationalIdNumber={nationalIdNumber}
        physicalAddress={physicalAddress}
        twoFactorStatus={twoFactorStatus}
        lastLogin={lastLogin}
        roles={roles}
        keycloakAccountUrl={keycloakAccountUrl}
        kycStatus={kycStatus}
        kycLastUpdated={kycLastUpdated}
        kycCompletionPercentage={gatewayKycStatus?.completionPercentage}
        profileImageUrl={coalesceString(gatewayProfile?.profileImageUrl, gatewayProfile?.avatarUrl)}
        communicationPreferences={memberCommunicationPreferences}
        existingChangeRequests={memberProfileChangeRequests}
        restrictedFields={[
          { field: "fullName", label: "Full name", currentValue: identityName },
          { field: "email", label: "Email address", currentValue: identityEmail, inputType: "email" },
          { field: "mobile", label: "Mobile number", currentValue: mobile, inputType: "tel" },
          { field: "nationalIdNumber", label: "National ID number", currentValue: nationalIdNumber },
          { field: "dateOfBirth", label: "Date of birth", currentValue: dateOfBirth, inputType: "date" },
          { field: "physicalAddress", label: "Physical address", currentValue: physicalAddress }
        ]}
      />
    </main>
  );
}
