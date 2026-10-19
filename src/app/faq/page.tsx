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
  {
    id: "pets",
    question: (
      <>
        Are <strong>pets</strong> allowed?
      </>
    ),
    answer: (
      <>
        We understand that many tenants love pets. However, to maintain
        cleanliness and comfort for all residents,{" "}
        <strong>pets are not allowed</strong> in our units/rooms at the moment.
      </>
    ),
  },
  {
    id: "cooking",
    question: (
      <>
        Is <strong>cooking permitted</strong> in the unit?
      </>
    ),
    answer: (
      <>
        Yes, <strong>cooking is permitted</strong>. Each unit is equipped with
        shared kitchen facilities. We kindly ask all tenants to maintain
        cleanliness after use for the convenience of others.
      </>
    ),
  },
  {
    id: "rental-period",
    question: (
      <>
        What is the <strong>minimum rental period</strong>?
      </>
    ),
    answer: (
      <>
        The minimum rental period is <strong>six (6) months</strong>. This helps
        ensure a stable living environment for all tenants while still providing
        flexibility for those with shorter commitments.
      </>
    ),
  },
  {
    id: "parking",
    question: (
      <>
        Is a <strong>parking space included</strong> in the rental?
      </>
    ),
    answer: (
      <>
        Parking is not included in the rent, but it’s{" "}
        <strong>available upon request with a monthly fee</strong>. Our team
        will be happy to assist with parking arrangements based on availability.
      </>
    ),
  },
  {
    id: "deposit",
    question: (
      <>
        Is a <strong>deposit</strong> required?
      </>
    ),
    answer: (
      <>
        Yes, a <strong>deposit is required</strong> upon booking confirmation
      </>
    ),
  },
  {
    id: "muslimah",
    question: (
      <>
        Does RentDeer offer <strong>Muslimah units</strong>?
      </>
    ),
    answer: (
      <>
        Yes, we <strong>do offer Muslimah units</strong> for female tenants who
        prefer a Muslim-friendly environment
      </>
    ),
  },
  {
    id: "internship",
    question: (
      <>
        Does RentDeer accept <strong>internship</strong> tenants?
      </>
    ),
    answer: (
      <>
        Yes, internship tenants <strong>are welcome</strong> to stay with us
      </>
    ),
  },
];

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState(0);
  return (
    <main className="faq-page">
      <section className="faq-page-hero">
        <SiteHeader active="faq" tone="dark" />
        <div className="rd-page-hero-inner">
          <span className="rd-script-label">RentDeer FAQ</span>
          <h1>
            Answers before you <span>move in.</span>
          </h1>
          <p>
            Get quick answers about rooms, deposits, rental terms, shared
            living, and the booking journey.
          </p>
        </div>
      </section>
      <section className="content-section faq-page-content">
        <div className="section-heading">
          <div>
            <span className="rd-script-label">Frequently asked</span>
            <h2>Good questions make better moves.</h2>
          </div>
          <p>
            Still unsure? Send the team a message and we will help you work
            through the details.
          </p>
        </div>
        <div className="faq-list">
          {faqs.map(({ id, question, answer }, index) => (
            <div
              className={openFaq === index ? "faq-item is-open" : "faq-item"}
              key={id}
            >
              <button
                type="button"
                aria-expanded={openFaq === index}
                aria-controls={`faq-answer-${id}`}
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
              >
                <span>
                  {index + 1}. {question}
                </span>
                <ChevronIcon />
              </button>
              {openFaq === index && <p id={`faq-answer-${id}`}>{answer}</p>}
            </div>
          ))}
        </div>
      </section>
      <section className="rd-page-cta-section">
        <div className="about-cta faq-cta">
          <div>
            <span className="rd-script-label">Need more help?</span>
            <h2>Talk to the RentDeer team.</h2>
            <p>
              We can help you find the right room or route your landlord and
              agent enquiry.
            </p>
          </div>
          <Link className="rd-yellow-button" href="/contact">
            Contact Us <ArrowIcon />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
