import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth/require-owner";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const user = await requireOwner();

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-3xl mx-auto flex items-center justify-between border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold">Owner Dashboard Verified</h1>
          <p className="text-sm text-neutral-400 mt-1">Signed in as {user.email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
          >
            Sign Out
          </button>
        </form>
      </div>
    </main>
  );
}
