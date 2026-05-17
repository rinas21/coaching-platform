"use client";

import React, { type ElementType, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface GsapSplitTextProps {
  text: string;
  className?: string;
  triggerOffset?: string;
  delay?: number;
  elementType?: ElementType;
  staggerTime?: number;
}

export default function GsapSplitText({
  text,
  className = "",
  triggerOffset = "85%",
  delay = 0,
  elementType = "div",
  staggerTime,
}: GsapSplitTextProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const Element = elementType as ElementType;

  // Faster character stagger for paragraphs since they hold much more text
  const appliedStagger =
    staggerTime !== undefined ? staggerTime : elementType === "p" ? 0.005 : 0.03;

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const isMobile = window.innerWidth < 768;

      // Ensure ScrollTrigger refreshes once the layout has settled
      // This is crucial for nested animations and smooth-scrolling containers
      const refreshST = () => {
        ScrollTrigger.refresh();
      };
      
      // Delay refresh slightly to allow parent reveals/transitions to calculate
      const timer = setTimeout(refreshST, 100);

      if (isMobile) {
        gsap.set(containerRef.current, { opacity: 1 });
        gsap.set(".char-span", { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        ".char-span",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay,
          stagger: appliedStagger,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: `top ${triggerOffset}`,
            toggleActions: "play none none none",
          },
        }
      );

      return () => clearTimeout(timer);
    },
    { scope: containerRef, dependencies: [text, delay, triggerOffset] }
  );

  return (
    <Element
      ref={containerRef}
      className={className}
      aria-label={text}
    >
      {text.split(" ").map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em] whitespace-nowrap">
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              className="char-span inline-block"
              style={{ opacity: 0 }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </Element>
  );
}
