import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminFeedbackProvider from "@/components/admin/admin-feedback-provider";
import "./admin.css";

export const metadata: Metadata = {
  title: "RentDeer Admin",
  description: "RentDeer website and listing administration.",
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <AdminFeedbackProvider>{children}</AdminFeedbackProvider>;
}
