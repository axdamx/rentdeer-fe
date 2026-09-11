"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useRef } from "react";

const values = [
  [
    "Transparency",
    "Clear listings, honest conversations, and no unnecessary surprises.",
  ],
  [
    "Community",
    "Better homes start with better relationships between tenants and owners.",
  ],
  [
    "Simplicity",
    "Every step should be easy to understand, from search to signing.",
  ],
  [
    "Empowerment",
    "Useful information helps every renter and property partner decide with confidence.",
  ],
];

function CheckIcon() {
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
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}

export default function AboutParallaxIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const firstColumnY = useTransform(scrollYProgress, [0, 1], [72, -72]);
  const secondColumnY = useTransform(scrollYProgress, [0, 1], [112, -112]);
  const thirdColumnY = useTransform(scrollYProgress, [0, 1], [52, -52]);

  return (
    <section className="about-story-section" id="story" ref={sectionRef}>
      <div className="about-story-inner">
        <div className="about-bento">
          <div className="about-bento-grid">
            <motion.div
              className="about-bento-column about-bento-column-one"
              style={{ y: reduceMotion ? 0 : firstColumnY }}
            >
              <div className="about-bento-tile about-bento-short">
                <Image
                  src="/estatein/property-campus.png"
                  alt="RentDeer team gathering"
                  fill
                  sizes="(max-width: 700px) 30vw, 16vw"
                />
              </div>
              <div className="about-bento-tile about-bento-tall">
                <Image
                  src="/estatein/property-villa.png"
                  alt="RentDeer community event"
                  fill
                  sizes="(max-width: 700px) 30vw, 16vw"
                />
              </div>
              <div className="about-bento-tile about-bento-medium">
                <Image
                  src="/estatein/property-tower.png"
                  alt="RentDeer neighbourhood"
                  fill
                  sizes="(max-width: 700px) 30vw, 16vw"
                />
              </div>
            </motion.div>

            <motion.div
              className="about-bento-column about-bento-column-two"
              style={{ y: reduceMotion ? 0 : secondColumnY }}
            >
              <div className="about-bento-tile about-bento-medium">
                <Image
                  src="/estatein/property-tower.png"
                  alt="A welcoming RentDeer home"
                  fill
                  sizes="(max-width: 700px) 36vw, 19vw"
                />
              </div>
              <div className="about-bento-tile about-bento-tall">
                <Image
                  src="/estatein/property-campus.png"
                  alt="RentDeer team members at work"
                  fill
                  sizes="(max-width: 700px) 36vw, 19vw"
                />
              </div>
              <div className="about-bento-tile about-bento-short">
                <Image
                  src="/estatein/property-villa.png"
                  alt="A comfortable rental living space"
                  fill
                  sizes="(max-width: 700px) 36vw, 19vw"
                />
              </div>
            </motion.div>

            <motion.div
              className="about-bento-column about-bento-column-three"
              style={{ y: reduceMotion ? 0 : thirdColumnY }}
            >
              <div className="about-bento-tile about-bento-short">
                <Image
                  src="/estatein/property-villa.png"
                  alt="RentDeer team celebration"
                  fill
                  sizes="(max-width: 700px) 30vw, 17vw"
                />
              </div>
              <div className="about-bento-tile about-bento-medium">
                <Image
                  src="/estatein/property-campus.png"
                  alt="RentDeer community members"
                  fill
                  sizes="(max-width: 700px) 30vw, 17vw"
                />
              </div>
              <div className="about-bento-tile about-bento-tall">
                <Image
                  src="/estatein/property-tower.png"
                  alt="RentDeer managed property"
                  fill
                  sizes="(max-width: 700px) 30vw, 17vw"
                />
              </div>
            </motion.div>
          </div>
          <span className="about-bento-fade about-bento-fade-top" />
          <span className="about-bento-fade about-bento-fade-bottom" />
        </div>

        <div className="about-intro-copy">
          <span className="rd-script-label">Behind RentDeer</span>
          <h2>Comfortable, quality living should be accessible to everyone.</h2>
          <p>
            In the heart of Damansara, during the difficult days of the COVID-19
            pandemic, RentDeer Sdn Bhd was founded with a simple but meaningful
            purpose. A group of real estate agents came together with a shared
            belief: that comfortable, quality living should be accessible to
            everyone, no matter their budget.
          </p>
          <p>
            Through our work with both renters and landlords, we saw firsthand
            the challenges they faced. Many renters struggled to find clean,
            affordable rooms they could trust. At the same time, landlords were
            dealing with property maintenance issues, unreliable tenants, and a
            lack of dependable management support.
          </p>
          <p>
            RentDeer was created to bridge this gap. We aim to provide renters
            with well-managed, ready-to-move-in homes, while giving landlords a
            reliable and transparent team to help care for their properties. At
            the heart of RentDeer is a sincere commitment to make renting
            easier, fairer, and more worry-free for everyone involved.
          </p>
          <div className="about-points">
            {values.map(([title, text]) => (
              <div className="about-point" key={title}>
                <span className="about-point-icon">
                  <CheckIcon />
                </span>
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
