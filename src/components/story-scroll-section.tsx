"use client";

import {
  type MotionValue,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
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
  },
  {
    eyebrow: "Striving For Change",
    title: "Rental living should feel fairer for everyone.",
    description:
      "From the beginning, we have aimed to improve the standard of rental living for both tenants and landlords through proper management, clear communication, and sincere care.",
    detail:
      "For renters, that means clean, move-in-ready rooms. For landlords, it means dependable tenants, consistent upkeep, and a team they can trust.",
    href: "/about#rental-belief",
  },
  {
    eyebrow: "Who Are We",
    title: "RentDeer History",
    description:
      "In the heart of Damansara, as the world grappled with the unprecedented challenges of the COVID-19 pandemic, RentDeer Sdn Bhd emerged with a bold vision.",
    detail:
      "At RentDeer, we are not just managing properties; we are building a legacy of accessible, quality living for all. Join us as we continue to redefine the standards of property management in Klang Valley and beyond.",
    href: "/about#story",
  },
  {
    eyebrow: "Our Next Chapter",
    title: "Looking To The Future",
    description:
      "As we step forward, RentDeer is poised for even greater heights. We are actively seeking passionate individuals to join our dynamic team, help us expand our reach, and enhance our services.",
    detail:
      "Our goal is not just to grow as a company, but to better serve our clients and contribute positively to our community. We remain committed to creating a new standard of living that is both high-quality and affordable.",
    href: "/contact",
  },
] as const;

type Story = (typeof stories)[number];

function StoryContent({
  isActive,
  index,
  progress,
  story,
}: {
  isActive: boolean;
  index: number;
  progress: MotionValue<number>;
  story: Story;
}) {
  const start = index / stories.length;
  const end = (index + 1) / stories.length;
  const transition = 0.035;
  const opacityInput =
    index === 0
      ? [0, end - transition, end + transition]
      : index === stories.length - 1
        ? [start - transition, start + transition, 1]
        : [
            start - transition,
            start + transition,
            end - transition,
            end + transition,
          ];
  const opacityOutput =
    index === 0
      ? [1, 1, 0]
      : index === stories.length - 1
        ? [0, 1, 1]
        : [0, 1, 1, 0];
  const yOutput =
    index === 0
      ? [0, 0, -28]
      : index === stories.length - 1
        ? [28, 0, 0]
        : [28, 0, 0, -28];
  const opacity = useTransform(progress, opacityInput, opacityOutput);
  const y = useTransform(progress, opacityInput, yOutput);

  return (
    <motion.div
      aria-hidden={!isActive}
      inert={!isActive}
      className={`rd-story-scroll-copy${isActive ? " is-active" : ""}`}
      style={{ opacity, y }}
    >
      <CardHeader className="rd-story-card-header">
        <span className="rd-script-label">{story.eyebrow}</span>
        <CardTitle>{story.title}</CardTitle>
      </CardHeader>
      <CardContent className="rd-story-card-content">
        <p>{story.description}</p>
        <p>{story.detail}</p>
        <Link
          href={story.href}
          className="rd-yellow-button"
          tabIndex={isActive ? 0 : -1}
        >
          More Info <span aria-hidden="true">→</span>
        </Link>
      </CardContent>
    </motion.div>
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

  return (
    <section className="rd-story-scroll-section" id="about">
      <div ref={stageRef} className="rd-story-scroll-stage">
        <div className="rd-story-scroll-visual">
          <div className="rd-story-scroll-frame">
            <video
              autoPlay
              className="rd-story-scroll-video"
              loop
              muted
              playsInline
              poster="/estatein/property-villa.png"
              preload="metadata"
            >
              <source
                media="(max-width: 700px)"
                src="/estatein/rentdeer-story-mobile.mp4"
                type="video/mp4"
              />
              <source src="/estatein/rentdeer-story.mp4" type="video/mp4" />
            </video>
            <div className="rd-story-scroll-scrim" />
            <div className="rd-story-scroll-intro">
              <span className="rd-script-label">Who are we</span>
              <h2>Renting should feel more connected.</h2>
              <p>
                Scroll through the story behind RentDeer and the change we are
                working towards for renters and landlords.
              </p>
            </div>
            <Card className="rd-story-card-shell">
              {stories.map((story, index) => (
                <StoryContent
                  index={index}
                  isActive={activeIndex === index}
                  key={story.eyebrow}
                  progress={smoothProgress}
                  story={story}
                />
              ))}
            </Card>
            <div className="rd-story-scroll-image-label">
              <span>RentDeer</span>
              <strong>
                0{activeIndex + 1} / 0{stories.length}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
