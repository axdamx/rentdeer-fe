"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import SiteHeader from "@/components/site-header";

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
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };
  return (
    <main className="contact-page">
      <div className="announcement-bar">
        <span>✨ Rent smarter. Live better with RentDeer.</span>
        <Link href="/faq">
          Read the FAQ <ArrowIcon />
        </Link>
      </div>
      <SiteHeader active="contact" />
      <section className="contact-hero">
        <span className="section-kicker">CONTACT RENTDEER</span>
        <h1>
          Let&apos;s make your next move feel <span>simple.</span>
        </h1>
        <p>
          Whether you are looking for a room, managing a property, or building a
          partnership, our team is ready to help.
        </p>
      </section>
      <section className="contact-layout content-section">
        <div className="contact-details">
          <span className="section-kicker">START A CONVERSATION</span>
          <h2>We&apos;re here for your next rental step.</h2>
          <p>
            Choose the path that fits your enquiry and the RentDeer team will
            get back to you.
          </p>
          <div className="contact-detail-list">
            <a href="mailto:hello.rentdeer@gmail.com">
              <strong>Email us</strong>
              <span>hello.rentdeer@gmail.com</span>
            </a>
            <a href="tel:+60192523804">
              <strong>Tenant enquiries</strong>
              <span>+6019 252 3804 · WhatsApp +6019 343 3804</span>
            </a>
            <a href="tel:+601139282804">
              <strong>Landlord enquiries</strong>
              <span>WhatsApp +6011 3928 2804</span>
            </a>
            <div>
              <strong>Visit us</strong>
              <span>
                S-036 &amp; S-042, Seasons Square, Jalan PJU 10/3C, Damansara
                Damai, 47380 Petaling Jaya, Selangor, Malaysia
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
            <input required type="checkbox" />{" "}
            <span>I agree to the privacy policy and terms of use.</span>
          </label>
          <button type="submit" className="button button-primary">
            {submitted ? "Enquiry Ready" : "Send Enquiry"} <ArrowIcon />
          </button>
          {submitted && (
            <p className="form-success" aria-live="polite">
              Thanks — your enquiry is ready for the RentDeer team.
            </p>
          )}
        </form>
      </section>
      <section className="contact-cta contact-bottom">
        <div>
          <span className="section-kicker">PREFER TO BROWSE?</span>
          <h2>Explore current rental listings.</h2>
        </div>
        <Link className="button button-secondary" href="/properties">
          View Listings <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}
