"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { apiRequest } from "@/lib/api-client";
import type { EnquiryInput, SiteSettingsInput } from "@/lib/listing-schema";
import { type EnquiryContext, enquiryMessage } from "@/lib/rental-options";

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

export default function ContactContent({
  enquiry,
}: {
  enquiry: EnquiryContext | null;
}) {
  const [message, setMessage] = useState(
    enquiry ? enquiryMessage(enquiry) : "",
  );
  const [isWriting, setIsWriting] = useState(Boolean(enquiry));
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!isWriting || !messageRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsWriting(false);
      return;
    }
    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let characters = 0;
        const step = Math.max(1, Math.ceil(message.length / 24));
        timer = setInterval(() => {
          characters = Math.min(message.length, characters + step);
          setVisibleCharacters(characters);
          if (characters === message.length) {
            clearInterval(timer);
            setIsWriting(false);
          }
        }, 25);
      },
      { threshold: 0.15 },
    );
    observer.observe(messageRef.current);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [isWriting, message]);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (formData.get("consent") !== "on") return;
    const params = new URLSearchParams(window.location.search);
    setIsWriting(false);
    enquiryMutation.mutate(
      {
        propertySlug: enquiry?.propertySlug ?? "",
        rentalOptionSlug: enquiry?.rentalOptionSlug ?? "",
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        topic: String(formData.get("topic") ?? ""),
        message,
        consent: true,
        sourceUrl: window.location.href,
        utmSource: params.get("utm_source") ?? "",
        utmMedium: params.get("utm_medium") ?? "",
        utmCampaign: params.get("utm_campaign") ?? "",
      },
      {
        onSuccess: () => {
          form.reset();
          setMessage("");
        },
      },
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
        <form
          className="contact-form"
          id="enquiry-form"
          onSubmit={handleSubmit}
        >
          {enquiry && (
            <div className="enquiry-selection">
              <span className="enquiry-selection-label">
                Your selected {enquiry.unitTitle ? "rental option" : "property"}
              </span>
              <h3>{enquiry.unitTitle ?? enquiry.propertyTitle}</h3>
              {enquiry.unitTitle && <p>{enquiry.propertyTitle}</p>}
              <p>{enquiry.location}</p>
              {enquiry.unitTitle && (
                <div className="enquiry-selection-meta">
                  <span>{enquiry.roomType}</span>
                  <strong>{enquiry.price} / month</strong>
                  <span>{enquiry.availability}</span>
                </div>
              )}
              <Link
                href={
                  enquiry.rentalOptionSlug
                    ? `/properties/${enquiry.propertySlug}/units/${enquiry.rentalOptionSlug}`
                    : `/properties/${enquiry.propertySlug}`
                }
              >
                View listing <ArrowIcon />
              </Link>
            </div>
          )}
          <div className="form-row">
            <label>
              First name
              <input
                required
                name="firstName"
                autoComplete="given-name"
                placeholder="Your first name"
              />
            </label>
            <label>
              Last name
              <input
                required
                name="lastName"
                autoComplete="family-name"
                placeholder="Your last name"
              />
            </label>
          </div>
          <label>
            Email address
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            Phone or WhatsApp
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+60..."
            />
          </label>
          <label>
            What can we help with?
            <select
              required
              name="topic"
              defaultValue={enquiry ? "Viewing a room" : ""}
            >
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
            <span className="enquiry-message-label">
              Message{" "}
              {enquiry && message && (
                <span className="enquiry-message-prepared">
                  <Sparkles aria-hidden="true" /> Message prepared for you
                </span>
              )}
            </span>
            <textarea
              required
              name="message"
              ref={messageRef}
              value={isWriting ? message.slice(0, visibleCharacters) : message}
              onFocus={() => setIsWriting(false)}
              onChange={(event) => {
                setIsWriting(false);
                setMessage(event.target.value);
              }}
              className={enquiry ? "enquiry-prefilled-message" : undefined}
              aria-describedby={enquiry ? "enquiry-message-hint" : undefined}
              placeholder={
                isWriting
                  ? "Preparing your enquiry message..."
                  : "Tell us a little more about your plans..."
              }
              maxLength={5000}
              rows={enquiry ? 10 : 5}
            />
          </label>
          {enquiry && (
            <p id="enquiry-message-hint" className="enquiry-message-hint">
              We’ve added the listing details. Edit the message or add your
              preferred move-in date before sending.
            </p>
          )}
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
