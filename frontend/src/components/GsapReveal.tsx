"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Scroll-into-view reveal (opacity + slide).
 * Standardized to use ScrollTrigger with useGSAP for reliable React 19 performance.
 */
interface GsapRevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  className?: string;
  triggerOffset?: string;
}

export default function GsapReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.8,
  className = "",
  triggerOffset = "85%",
}: GsapRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(el, { opacity: 1, x: 0, y: 0, clearProps: "all" });
        return;
      }

      const isMobile = window.innerWidth < 768;
      let x = 0;
      let y = 0;
      const offset = isMobile ? 20 : 50;

      switch (direction) {
        case "up":
          y = offset;
          break;
        case "down":
          y = -offset;
          break;
        case "left":
          x = offset;
          break;
        case "right":
          x = -offset;
          break;
      }

      gsap.fromTo(
        el,
        { opacity: 0, x, y },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: `top ${triggerOffset}`,
            toggleActions: "play none none none",
            // Since we use Lenis, ScrollTrigger positions are usually accurate,
            // but we can add a refresh if needed.
          },
          onComplete: () => {
            // Clean up transforms to avoid z-index or fixed position issues
            gsap.set(el, { clearProps: "transform" });
          },
        }
      );
    },
    { dependencies: [direction, delay, duration, triggerOffset], scope: ref }
  );

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
