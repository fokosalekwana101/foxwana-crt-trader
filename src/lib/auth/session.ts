/**
 * FUTURE AUTHENTICATION / PERMISSION LAYER.
 *
 * Version 1 does not lock the application. This module defines the contract the
 * rest of the app reads, so email/password auth, sessions, permissions,
 * subscription status and device management can be added behind it without
 * touching feature screens.
 *
 * No passwords, secrets or broker credentials are ever stored client-side.
 * Broker/MT5 connectivity must go through a secure server-side bridge.
 */
export type Permission =
  | "analysis.view"
  | "analysis.screenshot"
  | "fundamentals.view"
  | "journal.write"
  | "statistics.view"
  | "settings.write"
  | "admin.manage";

export type AccountStatus = "active" | "trial" | "suspended" | "expired";

export type Session = {
  authenticated: boolean;
  userId: string | null;
  email: string | null;
  displayName: string;
  role: "owner" | "user" | "admin";
  accountStatus: AccountStatus;
  permissions: Permission[];
  /** Open access in v1 — flipped on once authentication is enabled. */
  authEnabled: boolean;
};

const ALL_PERMISSIONS: Permission[] = [
  "analysis.view",
  "analysis.screenshot",
  "fundamentals.view",
  "journal.write",
  "statistics.view",
  "settings.write",
  "admin.manage",
];

export function getSession(): Session {
  return {
    authenticated: true,
    userId: null,
    email: null,
    displayName: "Local user",
    role: "owner",
    accountStatus: "active",
    permissions: ALL_PERMISSIONS,
    authEnabled: false,
  };
}

export function can(session: Session, permission: Permission): boolean {
  if (!session.authEnabled) return true;
  return session.authenticated && session.accountStatus !== "suspended" && session.permissions.includes(permission);
}
