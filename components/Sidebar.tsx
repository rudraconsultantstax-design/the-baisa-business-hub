"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV: { label: string; items: [string, string, string][] }[] = [
  {
    label: "Overview",
    items: [
      ["📊", "Dashboard", "/dashboard"],
      ["🧠", "Insights", "/insights"]
    ]
  },
  {
    label: "Commerce",
    items: [
      ["🏷️", "Catalog & Pricing", "/catalog"],
      ["🧮", "Costing Engine", "/costing"],
      ["📦", "Inventory", "/inventory"],
      ["🛍️", "Orders", "/orders"],
      ["👥", "Customers", "/customers"],
      ["🔗", "Channels", "/channels"]
    ]
  },
  {
    label: "Factory",
    items: [
      ["🏭", "Production (DPR)", "/production"],
      ["🧵", "Job-Work & Wages", "/jobwork"],
      ["🧶", "Fabric & Cutting", "/fabric"]
    ]
  },
  {
    label: "Back office",
    items: [
      ["💰", "Finance & MIS", "/finance"],
      ["🤝", "Partners", "/partners"],
      ["📣", "Content", "/content"],
      ["✅", "Tasks", "/tasks"],
      ["⚙️", "Settings", "/settings"]
    ]
  }
];

export function Sidebar({ orgName, userName }: { orgName: string; userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>
          Baisa<span style={{ color: "var(--text)" }}> OS</span>
        </h1>
        <p>{orgName}</p>
      </div>
      <nav className="sidebar-nav">
        {NAV.map((group) => (
          <div key={group.label}>
            <div className="nav-label">{group.label}</div>
            {group.items.map(([ico, label, href]) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href} className={`nav-item${active ? " active" : ""}`}>
                  <span className="ico">{ico}</span>
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="spread">
          <div>
            <div style={{ color: "var(--text-2)", fontWeight: 600 }}>{userName}</div>
            <div style={{ fontSize: "0.68rem" }}>Owner</div>
          </div>
          <button className="btn btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
