"use client";

import Link from "next/link";
import { useState } from "react";
import SiteFooter from "@/components/site-footer";
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

function ChevronIcon() {
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
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

const faqs = [
  [
    "Does RentDeer accept internship tenants?",
    "Yes. Internship tenants are welcome to stay with us. Contact the team to check available rooms and requirements.",
  ],
  [
    "Are Muslimah units available?",
    "Muslimah units may be available depending on the current listing. Contact RentDeer so we can check the right options for you.",
  ],
  [
    "Is a deposit required?",
    "Yes, a deposit is required upon booking confirmation. The team will explain the amount and terms before you commit.",
  ],
  [
    "Can I cook in a shared kitchen?",
    "Cooking is permitted in shared kitchens. Please keep the space clean and considerate for the next person.",
  ],
  ["Are pets allowed?", "Pets are not allowed in the current rental homes."],
  [
    "What is the minimum rental period?",
    "The minimum rental period is six months.",
  ],
  [
    "Is parking included?",
    "Parking is not included by default, but it may be available on request for a monthly fee.",
  ],
  [
    "How do I enquire about a property?",
    "Use the property listing to review the details, then submit an enquiry. The RentDeer team will help with viewing, booking, and the next steps.",
  ],
];

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState(0);
  return (
    <main className="faq-page">
      <div className="announcement-bar">
        <span>✨ Rent smarter. Live better with RentDeer.</span>
        <Link href="/properties">
          Find a stay <ArrowIcon />
        </Link>
      </div>
      <SiteHeader active="faq" />
      <section className="faq-page-hero">
        <span className="section-kicker">RENTDEER FAQ</span>
        <h1>
          Answers before you <span>move in.</span>
        </h1>
        <p>
          Get quick answers about rooms, deposits, rental terms, shared living,
          and the booking journey.
        </p>
      </section>
      <section className="content-section faq-page-content">
        <div className="section-heading">
          <div>
            <span className="section-kicker">FREQUENTLY ASKED</span>
            <h2>Good questions make better moves.</h2>
          </div>
          <p>
            Still unsure? Send the team a message and we will help you work
            through the details.
          </p>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => (
            <div
              className={openFaq === index ? "faq-item is-open" : "faq-item"}
              key={question}
            >
              <button
                type="button"
                aria-expanded={openFaq === index}
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
              >
                <span>{question}</span>
                <ChevronIcon />
              </button>
              {openFaq === index && <p>{answer}</p>}
            </div>
          ))}
        </div>
      </section>
      <section className="contact-cta faq-cta">
        <div>
          <span className="section-kicker">NEED MORE HELP?</span>
          <h2>Talk to the RentDeer team.</h2>
          <p>
            We can help you find the right room or route your landlord and agent
            enquiry.
          </p>
        </div>
        <Link className="button button-primary" href="/contact">
          Contact Us <ArrowIcon />
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
