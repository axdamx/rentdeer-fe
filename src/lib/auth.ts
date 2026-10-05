import "server-only";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function getAdminUser() {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId) return null;

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("user_id, display_name, role, is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!profile) return null;

  return {
    id: userId,
    email: typeof data.claims.email === "string" ? data.claims.email : null,
    displayName: profile.display_name,
    role: profile.role,
  };
}
