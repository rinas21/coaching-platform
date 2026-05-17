"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function InternshipHeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Smooth parallax effect mapping exactly to the scroll amount
      gsap.to(".hero_bg", {
        y: "20vh", // move down smoothly as the user scrolls
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-cream-brand/50">
      <div className="hero_bg absolute -inset-y-[20%] w-full h-[140%] bg-[url('/assets/images/internship-page_hero.png')] bg-cover bg-center bg-no-repeat opacity-60 md:opacity-100" />
      <div className="absolute inset-0 bg-black/40 z-10" />
    </div>
  );
}
