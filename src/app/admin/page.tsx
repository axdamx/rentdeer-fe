"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => router.push("/admin/dashboard"), 500);
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
          <span>Mock authentication flow for UI review.</span>
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
                type="email"
                placeholder="admin@rentdeer.com"
                defaultValue="admin@rentdeer.com"
                required
              />
            </div>
          </div>
          <div className="admin-login-field">
            <div className="admin-login-label-row">
              <Label htmlFor="admin-password">Password</Label>
              <button type="button">Forgot password?</button>
            </div>
            <div>
              <LockKeyhole aria-hidden="true" />
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                defaultValue="rentdeer-admin"
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
