"use client";
import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * ThemeScrollTracker
 * Monitors two sections on the home page and toggles the 'theme-light' class on document.body.
 * When the first section starts to enter and until the second section finishes leaving,
 * the body will have the white theme.
 */

interface ThemeScrollTrackerProps {
  sectionIds: string[];
}

export default function ThemeScrollTracker({ sectionIds }: ThemeScrollTrackerProps) {
  useLayoutEffect(() => {
    if (typeof window === "undefined" || sectionIds.length === 0) return;

    // Register ScrollTrigger if not already
    gsap.registerPlugin(ScrollTrigger);

    const firstSection = document.getElementById(sectionIds[0]);
    const lastSection = document.getElementById(sectionIds[sectionIds.length - 1]);

    if (!firstSection || !lastSection) return;

    const trigger = ScrollTrigger.create({
      trigger: firstSection,
      start: "top 50%", // When the top of the first section reaches middle of viewport
      endTrigger: lastSection,
      end: "bottom 50%", // When the bottom of the last section reaches middle of viewport
      onEnter: () => document.body.classList.add("theme-light"),
      onLeave: () => document.body.classList.remove("theme-light"),
      onEnterBack: () => document.body.classList.add("theme-light"),
      onLeaveBack: () => document.body.classList.remove("theme-light"),
      // markers: true, // Uncomment for debugging
    });

    return () => {
      trigger.kill();
      document.body.classList.remove("theme-light");
    };
  }, [sectionIds]);

  return null; // This component doesn't render anything visually
}
