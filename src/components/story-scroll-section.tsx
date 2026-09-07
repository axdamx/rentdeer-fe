"use client";

import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stories = [
  {
    eyebrow: "Behind RentDeer",
    title: "A better way to rent starts with care.",
    description:
      "In the heart of Damansara, during the difficult days of the COVID-19 pandemic, RentDeer Sdn Bhd was founded with a simple but meaningful purpose: make comfortable, quality living accessible to everyone.",
    detail:
      "We bring renters and landlords together with well-managed homes, clearer communication, and support that continues after move-in.",
    href: "/about#story",
    image: "/estatein/property-campus.png",
    alt: "A landscaped RentDeer residence",
  },
  {
    eyebrow: "Striving For Change",
    title: "Rental living should feel fairer for everyone.",
    description:
      "From the beginning, we have aimed to improve the standard of rental living for both tenants and landlords through proper management, clear communication, and sincere care.",
    detail:
      "For renters, that means clean, move-in-ready rooms. For landlords, it means dependable tenants, consistent upkeep, and a team they can trust.",
    href: "/about#rental-belief",
    image: "/estatein/property-tower.png",
    alt: "A modern residential tower",
  },
  {
    eyebrow: "Who Are We",
    title: "RentDeer History",
    description:
      "In the heart of Damansara, as the world grappled with the unprecedented challenges of the COVID-19 pandemic, RentDeer Sdn Bhd emerged with a bold vision.",
    detail:
      "At RentDeer, we are not just managing properties; we are building a legacy of accessible, quality living for all. Join us as we continue to redefine the standards of property management in Klang Valley and beyond.",
    href: "/about#story",
    image: "/estatein/property-villa.png",
    alt: "A RentDeer residence representing the company history",
  },
  {
    eyebrow: "Our Next Chapter",
    title: "Looking To The Future",
    description:
      "As we step forward, RentDeer is poised for even greater heights. We are actively seeking passionate individuals to join our dynamic team, help us expand our reach, and enhance our services.",
    detail:
      "Our goal is not just to grow as a company, but to better serve our clients and contribute positively to our community. We remain committed to creating a new standard of living that is both high-quality and affordable.",
    href: "/contact",
    image: "/estatein/property-campus.png",
    alt: "A connected residential community representing RentDeer's future",
  },
] as const;

type Story = (typeof stories)[number];

function StoryStep({
  index,
  progress,
  story,
}: {
  index: number;
  progress: MotionValue<number>;
  story: Story;
}) {
  const start = index / stories.length;
  const end = (index + 1) / stories.length;
  const fadeStart = index === 0 ? 0 : start;
  const fadeEnd = index === stories.length - 1 ? 1 : end;
  const opacity = useTransform(
    progress,
    [fadeStart, start + 0.05, end - 0.05, fadeEnd],
    [index === 0 ? 1 : 0, 1, 1, index === stories.length - 1 ? 1 : 0],
  );
  const y = useTransform(
    progress,
    [fadeStart, start + 0.05, end - 0.05, fadeEnd],
    [index === 0 ? 0 : 50, 0, 0, index === stories.length - 1 ? 0 : -50],
  );

  return (
    <div className="rd-story-scroll-step">
      <motion.div className="rd-story-scroll-copy" style={{ opacity, y }}>
        <Card className="rd-story-card-shell">
          <CardHeader className="rd-story-card-header">
            <span className="rd-script-label">{story.eyebrow}</span>
            <CardTitle>{story.title}</CardTitle>
          </CardHeader>
          <CardContent className="rd-story-card-content">
            <p>{story.description}</p>
            <p>{story.detail}</p>
            <Link href={story.href} className="rd-yellow-button">
              More Info <span aria-hidden="true">→</span>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function StoryScrollSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 180,
    restDelta: 0.001,
  });
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (!Number.isFinite(latest)) return;

    const nextIndex = Math.min(
      stories.length - 1,
      Math.max(0, Math.floor(latest * stories.length)),
    );
    setActiveIndex(nextIndex);
  });

  const activeStory = stories[activeIndex] ?? stories[0];

  return (
    <section className="rd-story-scroll-section" id="about">
      <div className="rd-container rd-story-scroll-heading">
        <span className="rd-script-label">Who are we</span>
        <h2>Renting should feel more connected.</h2>
        <p>
          Scroll through the story behind RentDeer and the change we are working
          towards for renters and landlords.
        </p>
      </div>
      <div ref={stageRef} className="rd-story-scroll-stage">
        <div className="rd-story-scroll-visual">
          <div className="rd-story-scroll-frame">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStory.image}
                className="rd-story-scroll-image"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <Image
                  src={activeStory.image}
                  alt={activeStory.alt}
                  fill
                  sizes="(max-width: 700px) 100vw, 46vw"
                />
              </motion.div>
            </AnimatePresence>
            <div className="rd-story-scroll-image-label">
              <span>RentDeer</span>
              <strong>
                0{activeIndex + 1} / 0{stories.length}
              </strong>
            </div>
          </div>
        </div>
        <div className="rd-story-scroll-steps">
          {stories.map((story, index) => (
            <StoryStep
              index={index}
              key={story.eyebrow}
              progress={smoothProgress}
              story={story}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
