"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showAdminError, withAdminFeedback } from "@/lib/admin-feedback";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      await withAdminFeedback(
        async () => {
          const supabase = createClient();
          const { error: signInError } = await supabase.auth.signInWithPassword(
            {
              email: String(formData.get("email")),
              password: String(formData.get("password")),
            },
          );
          if (signInError) throw signInError;

          const { data: profile } = await supabase
            .from("admin_profiles")
            .select("is_active")
            .single();
          if (!profile?.is_active) {
            await supabase.auth.signOut();
            throw new Error(
              "This account does not have active administrator access.",
            );
          }
        },
        {
          loadingMessage: "Signing you in...",
          successMessage: "Signed in successfully.",
        },
      );

      const nextPath = new URLSearchParams(window.location.search).get("next");
      router.replace(
        nextPath?.startsWith("/admin/") ? nextPath : "/admin/dashboard",
      );
      router.refresh();
    } catch {
      setLoading(false);
    }
  };

  const sendPasswordReset = async () => {
    if (!email) {
      showAdminError("Enter your email address first.");
      return;
    }
    try {
      await withAdminFeedback(
        async () => {
          const supabase = createClient();
          const { error: resetError } =
            await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/auth/callback?next=/admin/reset-password`,
            });
          if (resetError) throw resetError;
        },
        {
          loadingMessage: "Sending password reset email...",
          successMessage: "Password reset email sent.",
        },
      );
    } catch {
      // The shared admin feedback layer presents the error toast.
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-brand-panel">
        <div className="admin-login-brand">
          <span>R</span>
          <strong>RentDeer</strong>
        </div>
        <div className="admin-login-message">
          <span>Rent smarter. Manage better.</span>
          <h1>Your website and rental operations, in one place.</h1>
          <p>
            Configure RentDeer pages, publish listings, organise media and keep
            track of every new enquiry.
          </p>
        </div>
        <div className="admin-login-footnote">
          <strong>Secure administrator access</strong>
          <span>
            Protected by Supabase authentication and database policies.
          </span>
        </div>
      </section>

      <section className="admin-login-form-panel">
        <form onSubmit={handleSubmit}>
          <div className="admin-login-heading">
            <span>Welcome back</span>
            <h2>Sign in to RentDeer Admin</h2>
            <p>Use your administrator email and password to continue.</p>
          </div>
          <div className="admin-login-field">
            <Label htmlFor="admin-email">Email address</Label>
            <div>
              <Mail aria-hidden="true" />
              <Input
                id="admin-email"
                name="email"
                type="email"
                placeholder="admin@rentdeer.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>
          <div className="admin-login-field">
            <div className="admin-login-label-row">
              <Label htmlFor="admin-password">Password</Label>
              <button type="button" onClick={sendPasswordReset}>
                Forgot password?
              </button>
            </div>
            <div>
              <LockKeyhole aria-hidden="true" />
              <Input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" />
                ) : (
                  <Eye aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          <label className="admin-remember-row">
            <input type="checkbox" defaultChecked />
            Keep me signed in on this device
          </label>
          <Button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
            <ArrowRight aria-hidden="true" />
          </Button>
          <p className="admin-login-help">
            Need access? Contact the RentDeer system administrator.
          </p>
        </form>
      </section>
    </main>
  );
}
