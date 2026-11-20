import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getOwnerUser() {
  const supabase = await createClient();

  // Always use getUser() on the server—never trust getSession() alone
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: roleRow, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();

  if (roleError || !roleRow) {
    return null;
  }

  return user;
}

export async function requireOwner() {
  const user = await getOwnerUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}
