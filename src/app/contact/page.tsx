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
        <span>✨ Discover Your Dream Property with Estatein</span>
        <Link href="/about">
          Learn More <ArrowIcon />
        </Link>
      </div>
      <SiteHeader active="contact" />
      <section className="contact-hero">
        <span className="section-kicker">CONTACT ESTATEIN</span>
        <h1>
          Let&apos;s make your next move feel <span>simple.</span>
        </h1>
        <p>
          Whether you are buying, selling, investing, or just beginning to
          explore, we are here to listen.
        </p>
      </section>
      <section className="contact-layout content-section">
        <div className="contact-details">
          <span className="section-kicker">START A CONVERSATION</span>
          <h2>We&apos;d love to hear what you&apos;re looking for.</h2>
          <p>
            Tell us a little about your goals and the Estatein team will get
            back to you with a thoughtful next step.
          </p>
          <div className="contact-detail-list">
            <a href="mailto:hello@estatein.com">
              <strong>Email us</strong>
              <span>hello@estatein.com</span>
            </a>
            <a href="tel:+12125550184">
              <strong>Call us</strong>
              <span>+1 (212) 555-0184</span>
            </a>
            <div>
              <strong>Visit us</strong>
              <span>28 Mercer Street, New York</span>
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
              <option>Buying a property</option>
              <option>Selling a property</option>
              <option>Property management</option>
              <option>Investment advisory</option>
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
            {submitted ? "Message Sent" : "Send Message"} <ArrowIcon />
          </button>
          {submitted && (
            <p className="form-success" aria-live="polite">
              Thanks — your message is ready for the Estatein team.
            </p>
          )}
        </form>
      </section>
      <section className="contact-cta contact-bottom">
        <div>
          <span className="section-kicker">PREFER TO BROWSE?</span>
          <h2>Explore properties at your own pace.</h2>
        </div>
        <Link className="button button-secondary" href="/properties">
          View Listings <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}
