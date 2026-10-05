import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { getAdminUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await getAdminUser();
  if (hasSupabaseEnv() && !admin) redirect("/admin");

  return <AdminShell user={admin}>{children}</AdminShell>;
}
