import { getCurrentUser } from "../lib/session";
import { AdminShell } from "./admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  const displayName = currentUser?.profile.displayName ?? "";
  const email = currentUser?.profile.email ?? "";

  return <AdminShell displayName={displayName} email={email}>{children}</AdminShell>;
}
