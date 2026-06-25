import { requireSession } from "@/lib/auth";
import { getOrg } from "@/lib/db/store";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const org = await getOrg(session.orgId);

  return (
    <div className="shell">
      <Sidebar orgName={org?.name ?? "Workspace"} userName={session.user.name} />
      <div className="main">{children}</div>
    </div>
  );
}
