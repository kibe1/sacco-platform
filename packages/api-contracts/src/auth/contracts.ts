export type AuthChannel = "admin" | "staff" | "member-web" | "pwa" | "mobile" | "ussd" | "partner";

export type LoginRequest = {
  tenantSlug?: string;
  username: string;
  password: string;
  channel: AuthChannel;
};

export type MfaChallenge = {
  challengeId: string;
  method: "otp" | "totp" | "sms" | "email";
  expiresAt: string;
};

export type LoginResponse = {
  status: "AUTHENTICATED" | "MFA_REQUIRED" | "LOCKED" | "DENIED";
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  mfaChallenge?: MfaChallenge;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

export type LogoutRequest = {
  refreshToken?: string;
  allSessions?: boolean;
};
