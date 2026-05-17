"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function FooterReveal({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !innerRef.current) return;

      // Use matchMedia to only apply the parallax effect on larger screens
      // On mobile, the footer is tall and the parallax effect causes the top
      // (like the NewsletterSignup) to be cut off by overflow-hidden.
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        gsap.fromTo(
          innerRef.current,
          {
            yPercent: -25,
            scale: 0.95,
          },
          {
            yPercent: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
            },
          }
        );
      });

      return () => mm.revert(); // clean up matchMedia
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full z-0 overflow-hidden bg-cream-brand"
      // Background should match footer bg color here so the container isn't transparent below it
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div ref={innerRef} className="w-full h-full">
        {children}
      </div>
    </div>
  );
}
