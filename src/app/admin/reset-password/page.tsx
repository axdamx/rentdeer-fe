"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withAdminFeedback } from "@/lib/admin-feedback";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password"));
    try {
      await withAdminFeedback(
        async () => {
          const supabase = createClient();
          const { error } = await supabase.auth.updateUser({ password });
          if (error) throw error;
        },
        {
          loadingMessage: "Updating your password...",
          successMessage: "Password updated successfully.",
        },
      );
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-form-panel">
        <form onSubmit={submit}>
          <div className="admin-login-heading">
            <span>Account security</span>
            <h1>Set a new password</h1>
            <p>Choose a secure password for your RentDeer admin account.</p>
          </div>
          <div className="admin-login-field">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              name="password"
              type="password"
              minLength={8}
              required
            />
          </div>
          <Button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </section>
    </main>
  );
}
