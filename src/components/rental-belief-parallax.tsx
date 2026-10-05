"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useRef } from "react";

type RentalBeliefParallaxProps = {
  brand?: string;
  heading?: string;
  imageAlt?: string;
  imageSrc?: string;
};

export default function RentalBeliefParallax({
  brand = "RentDeer",
  heading = "Striving For Change",
  imageAlt = "The RentDeer team striving to improve rental living",
  imageSrc = "/estatein/property-campus.png",
}: RentalBeliefParallaxProps) {
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
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 700px) 100vw, 1184px"
        />
      </motion.div>
      <div className="about-belief-feature-overlay" />
      <motion.div
        className="about-belief-feature-title"
        style={{ y: reduceMotion ? 0 : titleY }}
      >
        <span>{brand}</span>
        <h3>{heading}</h3>
      </motion.div>
    </div>
  );
}
