"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { FormEvent } from "react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { apiRequest } from "@/lib/api-client";
import type { EnquiryInput, SiteSettingsInput } from "@/lib/listing-schema";

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export default function ContactPage() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const params = new URLSearchParams(window.location.search);
    enquiryMutation.mutate(
      {
        propertySlug: params.get("property") ?? "",
        rentalOptionSlug: params.get("unit") ?? "",
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        topic: String(formData.get("topic") ?? ""),
        message: String(formData.get("message") ?? ""),
        consent: true,
        sourceUrl: window.location.href,
        utmSource: params.get("utm_source") ?? "",
        utmMedium: params.get("utm_medium") ?? "",
        utmCampaign: params.get("utm_campaign") ?? "",
      },
      { onSuccess: () => form.reset() },
    );
  };
  const enquiryMutation = useMutation({
    mutationFn: (input: EnquiryInput) =>
      apiRequest<{ success: true }>("/api/enquiries", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
  const settingsQuery = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => apiRequest<{ data: SiteSettingsInput }>("/api/settings"),
    staleTime: 5 * 60_000,
  });
  const settings = settingsQuery.data?.data;
  const email = settings?.companyEmail || "hello.rentdeer@gmail.com";
  const tenantPhone = settings?.tenantPhone || "+6019 252 3804";
  const tenantWhatsapp = settings?.tenantWhatsapp || "+6019 343 3804";
  const landlordWhatsapp = settings?.landlordWhatsapp || "+6011 3928 2804";
  return (
    <main className="contact-page">
      <section className="contact-hero">
        <SiteHeader active="contact" tone="dark" />
        <div className="rd-page-hero-inner">
          <span className="rd-script-label">Contact RentDeer</span>
          <h1>
            Let&apos;s make your next move feel <span>simple.</span>
          </h1>
          <p>
            Whether you are looking for a room, managing a property, or building
            a partnership, our team is ready to help.
          </p>
        </div>
      </section>
      <section className="contact-layout content-section">
        <div className="contact-details">
          <span className="rd-script-label">Start a conversation</span>
          <h2>We&apos;re here for your next rental step.</h2>
          <p>
            Choose the path that fits your enquiry and the RentDeer team will
            get back to you.
          </p>
          <div className="contact-detail-list">
            <a href={`mailto:${email}`}>
              <strong>Email us</strong>
              <span>{email}</span>
            </a>
            <a href={`tel:${tenantPhone.replace(/\s/g, "")}`}>
              <strong>Tenant enquiries</strong>
              <span>
                {tenantPhone} · WhatsApp {tenantWhatsapp}
              </span>
            </a>
            <a href={`tel:${landlordWhatsapp.replace(/\s/g, "")}`}>
              <strong>Landlord enquiries</strong>
              <span>WhatsApp {landlordWhatsapp}</span>
            </a>
            <div>
              <strong>Visit us</strong>
              <span>
                {settings?.companyAddress ||
                  "Damansara Damai, Selangor, Malaysia"}
              </span>
            </div>
          </div>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              First name
              <input required name="firstName" placeholder="Your first name" />
            </label>
            <label>
              Last name
              <input required name="lastName" placeholder="Your last name" />
            </label>
          </div>
          <label>
            Email address
            <input
              required
              type="email"
              name="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            Phone or WhatsApp
            <input name="phone" type="tel" placeholder="+60..." />
          </label>
          <label>
            What can we help with?
            <select name="topic" defaultValue="">
              <option value="" disabled>
                Select an option
              </option>
              <option>Viewing a room</option>
              <option>Booking a room</option>
              <option>Landlord management</option>
              <option>Property agent partnership</option>
              <option>General question</option>
            </select>
          </label>
          <label>
            Message
            <textarea
              required
              name="message"
              placeholder="Tell us a little more about your plans..."
              rows={5}
            />
          </label>
          <label className="checkbox-label">
            <input required type="checkbox" name="consent" />{" "}
            <span>I agree to the privacy policy and terms of use.</span>
          </label>
          <button
            type="submit"
            className="rd-yellow-button"
            disabled={enquiryMutation.isPending}
          >
            {enquiryMutation.isPending ? "Sending..." : "Send Enquiry"}{" "}
            <ArrowIcon />
          </button>
          {enquiryMutation.isSuccess && (
            <p className="form-success" aria-live="polite">
              Thanks — your enquiry has been sent to the RentDeer team.
            </p>
          )}
          {enquiryMutation.isError && (
            <p className="form-success" role="alert">
              {enquiryMutation.error.message}
            </p>
          )}
        </form>
      </section>
      <section className="rd-page-cta-section">
        <div className="about-cta contact-bottom">
          <div>
            <span className="rd-script-label">Prefer to browse?</span>
            <h2>Explore current rental listings.</h2>
          </div>
          <Link className="rd-yellow-button" href="/properties">
            View Listings <ArrowIcon />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
