import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth/require-owner";
import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "@/components/admin/AdminDashboard";

export type AdminPage = "Dashboard" | "Quotes" | "Messages" | "Subscribers" | "Services" | "Testimonies" | "Site Content" | "Settings";

export default async function AdminRoute({ page }: { page: AdminPage }) {
  const user = await requireOwner();
  const supabase = await createClient();
  const [quotesResult, messagesResult, subscribersResult, sectionsResult] = await Promise.all([
    supabase.from("quote_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
    supabase.from("subscribers").select("*").order("created_at", { ascending: false }),
    supabase.from("site_sections").select("section_key,label,is_visible,content,updated_at").neq("section_key", "global_media").order("section_key"),
  ]);
  async function signOut() {
    "use server";
    const client = await createClient();
    await client.auth.signOut();
    redirect("/admin/login");
  }
  return <AdminDashboard page={page} ownerEmail={user.email ?? "Owner"} initialData={{ quotes: quotesResult.data ?? [], messages: messagesResult.data ?? [], subscribers: subscribersResult.data ?? [], sections: sectionsResult.data ?? [] }} signOut={signOut} />;
}
