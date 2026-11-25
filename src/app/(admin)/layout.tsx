import type { Metadata } from "next";
import "../../app/globals.css";
import "./admin/theme.css";

export const metadata: Metadata = {
  title: "Admin Panel | Shalom Logistics",
  description: "Shalom Logistics Admin Panel",
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-theme min-h-screen bg-[var(--admin-page)] text-[var(--admin-ink)]">{children}</div>;
}
