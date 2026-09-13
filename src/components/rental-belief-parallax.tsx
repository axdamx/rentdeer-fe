"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useRef } from "react";

export default function RentalBeliefParallax() {
  const imageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [-52, 52]);
  const titleY = useTransform(scrollYProgress, [0, 1], [22, -22]);

  return (
    <div className="about-belief-feature" ref={imageRef}>
      <motion.div
        className="about-belief-feature-image"
        style={{ y: reduceMotion ? 0 : imageY }}
      >
        <Image
          src="/estatein/property-campus.png"
          alt="The RentDeer team striving to improve rental living"
          fill
          sizes="(max-width: 700px) 100vw, 1184px"
        />
      </motion.div>
      <div className="about-belief-feature-overlay" />
      <motion.div
        className="about-belief-feature-title"
        style={{ y: reduceMotion ? 0 : titleY }}
      >
        <span>RentDeer</span>
        <h3>
          Striving <em>For Change</em>
        </h3>
      </motion.div>
    </div>
  );
}
