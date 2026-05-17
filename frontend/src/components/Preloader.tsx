"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const overlaysRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Check if preloader has already run in this session
    if (sessionStorage.getItem("preloader_run")) {
      if (containerRef.current) {
        containerRef.current.style.display = "none";
      }
      return;
    }

    // Lock scroll during preloader
    document.body.style.overflow = "hidden";
    // Scroll to top
    window.scrollTo(0, 0);

    const tl = gsap.timeline({
      onComplete: () => {
        if (containerRef.current) {
          containerRef.current.style.display = "none";
        }
        document.body.style.overflow = "";
        sessionStorage.setItem("preloader_run", "true");
        // Ensure ScrollTrigger gets refreshed after preloader unlocks the DOM
        if (typeof window !== "undefined") {
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 100);
        }
      },
    });

    tl.to(textRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: "power4.out",
    })
      .to(
        subtextRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 0.3,
          ease: "power3.out",
        },
        "-=0.2"
      )
      .to(
        [textRef.current, subtextRef.current],
        {
          y: -40,
          opacity: 0,
          duration: 0.4,
          ease: "power3.inOut",
          delay: 0.8,
        }
      )
      .to(
        overlaysRef.current,
        {
          xPercent: -100,
          duration: 0.8,
          stagger: 0.1,
          ease: "power4.inOut",
        },
        "-=0.2"
      );
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      <div
        ref={(el) => {
          overlaysRef.current[2] = el;
        }}
        className="absolute inset-0 bg-cream-brand w-full h-full z-10"
      />
      <div
        ref={(el) => {
          overlaysRef.current[1] = el;
        }}
        className="absolute inset-0 bg-amber-brand w-full h-full z-20"
      />
      <div
        ref={(el) => {
          overlaysRef.current[0] = el;
        }}
        className="absolute inset-0 bg-navy-brand w-full h-full z-30"
      />

      <div className="relative z-40 flex flex-col items-center overflow-hidden">
        <h1
          ref={textRef}
          className="text-4xl md:text-6xl font-playfair font-bold text-cream-brand translate-y-12 opacity-0"
        >
          The Safe Space
        </h1>
        <p
          ref={subtextRef}
          className="text-amber-brand mt-4 font-nunito tracking-widest uppercase text-sm translate-y-8 opacity-0"
        >
          Global
        </p>
      </div>
    </div>
  );
}
