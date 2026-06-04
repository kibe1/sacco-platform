import type { ReactNode } from "react";
import { getCurrentUser } from "../lib/session";
import { MemberShell } from "./member-shell";

export default async function MemberLayout({ children }: Readonly<{ children: ReactNode }>) {
  const currentUser = await getCurrentUser();
  const displayName = currentUser?.profile.displayName ?? "";
  const email = currentUser?.profile.email ?? "";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return <MemberShell displayName={displayName} email={email} initials={initials}>{children}</MemberShell>;
}
