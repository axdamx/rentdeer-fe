"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

export type TeamMember = {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

type AnimatedTeamShowcaseProps = {
  eyebrow?: string;
  heading?: string;
  description?: string;
  members: TeamMember[];
};

export default function AnimatedTeamShowcase({
  eyebrow = "Meet The Team",
  heading = "Behind The Vision",
  description = "With a focus on better living and smarter property solutions, our team continues to shape RentDeer's journey and the future of rental living.",
  members,
}: AnimatedTeamShowcaseProps) {
  const [activeState, setActiveState] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const activeMemberIndex = activeState - 1;
  const stateKeys = ["overview", ...members.map((member) => member.id)];

  useEffect(() => {
    if (reduceMotion || isPaused || members.length < 1) return;

    const interval = window.setInterval(() => {
      setActiveState((current) => (current + 1) % (members.length + 1));
    }, 2000);

    return () => window.clearInterval(interval);
  }, [isPaused, members.length, reduceMotion]);

  if (!members.length) return null;

  return (
    <div className="team-showcase">
      <div className="team-showcase-intro">
        <span>{eyebrow}</span>
        <h2>{heading}</h2>
        <p>{description}</p>
      </div>

      <div
        className={`team-showcase-stage team-count-${members.length} ${activeState === 0 ? "is-overview" : "is-profile"}`}
      >
        {members.map((member, index) => {
          const isActive = index === activeMemberIndex;
          const isInactive = activeState > 0 && !isActive;

          return (
            <motion.button
              type="button"
              className={`team-person team-person-${index + 1}${isActive ? " is-active" : ""}${isInactive ? " is-inactive" : ""}`}
              key={member.id}
              layout
              onClick={() => setActiveState(index + 1)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onPointerDown={(event) => {
                if (event.pointerType !== "mouse") setIsPaused(true);
              }}
              onPointerUp={(event) => {
                if (event.pointerType !== "mouse") setIsPaused(false);
              }}
              aria-label={`Show ${member.name}'s profile`}
              aria-pressed={isActive}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="team-person-image">
                <Image
                  src={member.image}
                  alt={member.imageAlt}
                  fill
                  sizes="(max-width: 700px) 58vw, 32vw"
                />
              </span>
              <span className="team-person-label">
                <strong>{member.title}</strong>
                <small>{member.name}</small>
              </span>
            </motion.button>
          );
        })}

        <AnimatePresence mode="wait">
          {activeMemberIndex >= 0 && members[activeMemberIndex] && (
            <motion.div
              className="team-active-description"
              key={members[activeMemberIndex].id}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <strong>{members[activeMemberIndex].title}</strong>
              <h3>{members[activeMemberIndex].name}</h3>
              <p>{members[activeMemberIndex].description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="team-state-indicator" aria-hidden="true">
        {stateKeys.map((stateKey, index) => (
          <span
            className={activeState === index ? "is-active" : ""}
            key={stateKey}
          />
        ))}
      </div>
    </div>
  );
}
