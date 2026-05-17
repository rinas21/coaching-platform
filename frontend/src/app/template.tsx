"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLenis } from "lenis/react";

export default function Template({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const tl = gsap.timeline({
        onStart: () => {
          document.body.style.overflow = "hidden";
          window.scrollTo(0, 0);
          if (lenis) {
            lenis.scrollTo(0, { immediate: true });
          }
        },
        onComplete: () => {
          document.body.style.overflow = "auto";
          // Refresh ScrollTrigger to ensure all positions are correct after transition
          if (typeof window !== "undefined") {
            void import("gsap/ScrollTrigger").then((mod) => {
              mod.ScrollTrigger.refresh();
            });
          }
        },
      });

      tl.set(".page-transition-overlay", { autoAlpha: 1 });
      tl.set(".page-transition-panel", {
        xPercent: 100,
        transformOrigin: "left center",
      });

      // Phase 1: panel sweeps in to fully cover screen
      tl.to(
        ".page-transition-panel",
        {
          xPercent: 0,
          duration: 0.62,
          ease: "power4.inOut",
        },
        0,
      );

      // Phase 2: panel keeps moving and reveals the new page
      tl.to(
        ".page-transition-panel",
        {
          xPercent: -100,
          duration: 0.86,
          ease: "expo.inOut",
        },
        0.46,
      );

      tl.fromTo(
        contentRef.current,
        {
          x: 28,
          scale: 0.985,
          opacity: 0,
        },
        {
          x: 0,
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "all",
        },
        0.72,
      );

      tl.to(
        ".page-transition-overlay",
        {
          autoAlpha: 0,
          duration: 0.2,
          pointerEvents: "none",
        },
        "-=0.15",
      );
    },
    { scope: containerRef, dependencies: [lenis] },
  );

  return (
    <div ref={containerRef}>
      {/* Directional page-reveal panels */}
      <div className="page-transition-overlay fixed inset-0 z-[200] pointer-events-none">
        <div className="page-transition-panel h-full w-full bg-navy-brand" />
      </div>

      <div ref={contentRef}>{children}</div>
    </div>
  );
}
