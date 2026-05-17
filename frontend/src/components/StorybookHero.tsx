"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeroImage from "@/../public/assets/images/homepage_hero-background_variation-2.png";
import HeroImageBright from "@/../public/assets/images/homepage_hero-daytime.png";
import GsapReveal from "./GsapReveal";
import { ChevronRight } from "lucide-react";
import Cloud from "@/../public/assets/cloud.png";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const btnPrimary =
  "inline-flex w-fit justify-center bg-amber-brand text-sm sm:text-base items-center gap-2 text-white rounded-full px-5 py-2.5 font-medium transition-all duration-200 hover:bg-[var(--primary)] hover:text-white hover:-translate-y-px";

const btnSecondary =
  "inline-flex w-fit justify-center text-sm sm:text-base items-center gap-2 bg-white/15 text-white rounded-full px-5 py-2.5 font-medium border border-white/35 transition-all duration-200 hover:bg-white/20 hover:text-white hover:-translate-y-px";

export default function StorybookHero() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);
  const outerTextRef = useRef<HTMLDivElement>(null);
  const magneticRef = useRef<HTMLButtonElement>(null);
  const cloudRef = useRef<HTMLImageElement>(null);
  const brightImageRef = useRef<HTMLImageElement>(null);

  // Story text references
  const introRef = useRef<HTMLDivElement>(null);
  const story1Ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magneticRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } =
      magneticRef.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);

    gsap.to(magneticRef.current, {
      x: x * 0.4,
      y: y * 0.4,
      duration: 1,
      ease: "power3.out",
    });
  };

  const handleMouseLeave = () => {
    if (!magneticRef.current) return;
    gsap.to(magneticRef.current, {
      x: 0,
      y: 0,
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
  };

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=3000", // Adjusted scroll length
          scrub: 1, // Smooth scrubbing
          pin: true,
          anticipatePin: 1,
        },
      });

      // 1. The "Portal" opens: The frame scales up to reveal the full image background
      // Outer text scales outwards and fades
      tl.to(
        outerTextRef.current,
        {
          scale: 1.2,
          opacity: 0,
          ease: "power2.inOut",
          duration: 1.5,
        },
        0,
      );

      // Fade out the intro text immediately
      tl.to(
        introRef.current,
        {
          opacity: 0,
          scale: 0.8,
          ease: "power2.out",
          duration: 1,
        },
        0,
      );

      tl.fromTo(
        portalRef.current,
        {
          opacity: 0,
          scale: 0.5,
        },
        {
          opacity: 1,
          scale: 1,
          width: "100%",
          height: "100vh",
          borderRadius: "0px",
          ease: "power2.inOut",
          duration: 2,
        },
        0,
      );

      // Subtle parallax effect on the background image while zooming into the portal
      tl.to(
        bgImageRef.current,
        {
          scale: 1, // it starts at 1.15 in css
          ease: "power2.inOut",
          duration: 2,
        },
        0,
      );

      tl.to(
        brightImageRef.current,
        {
          opacity: 1,
          duration: 1.5,
          ease: "power2.inOut",
        },
        0, // starts at the same moment as outerText fade + portal scale
      );

      // 2. Story Phase 1
      tl.to(
        story1Ref.current,
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
        },
        "+=0.2",
      );


      // Keep everything held for a bit before unpinning
      tl.to({}, { duration: 1.5 });

      // Ambient moving animation for the cloud
      if (cloudRef.current) {
        gsap.fromTo(
          cloudRef.current,
          { scale: 1.1, xPercent: -3, yPercent: -1 },
          {
            xPercent: 3,
            yPercent: 1,
            duration: 25,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          },
        );
      }
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center font-body selection:bg-navy-brand selection:text-white"
    >
      <Image
        ref={cloudRef}
        src={Cloud}
        alt="Cloud"
        className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none opacity-80"
        sizes="100vw"
      />
      <Image
        ref={bgImageRef}
        src={HeroImage}
        alt="dark hero"
        className="absolute bottom-0 left-0 w-full h-full object-cover object-[center_top] md:object-center z-0 pointer-events-none"
        sizes="100vw"
      />
      {/* --- OUTER ELEMENTS (Initial View) --- */}
      <div
        ref={outerTextRef}
        className="absolute inset-0 z-30 origin-center pointer-events-none"
      >
        {/* Left Large Text */}
        <div className="flex justify-center items-center p-20 mt-20 max-w-4xl">
          <GsapReveal delay={0.1}>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl xl:text-[6rem] font-playfair text-white leading-none">
              Change the pattern. Break the cycle.
            </h2>
          </GsapReveal>
        </div>

        {/* Bottom Left Text */}
        <div className="absolute left-[3%] lg:left-[5%] bottom-[8%] max-w-[200px] sm:max-w-[280px]">
          <h3 className="text-base sm:text-lg text-amber-brand md:text-xl font-bold mb-2 sm:mb-3 font-playfair tracking-wide leading-tight">
            This is where the pattern shifts.
          </h3>
          <div className="w-6 h-px bg-cream-brand/50 mb-2 sm:mb-3"></div>
          <p className="text-[10px] md:text-[13px] text-cream-brand/70 font-nunito leading-relaxed hidden sm:block">
            Therapy that works with the whole of you not just the symptom. Grounded in neuroscience. Delivered with care.
          </p>
        </div>

        {/* Bottom Right Scroll Indicator */}
        <div className="absolute right-[3%] lg:right-[5%] bottom-[8%] flex flex-col items-end sm:items-center sm:flex-row gap-4 text-[10px] font-bold tracking-[0.1em] uppercase text-cream-brand/80">
          <div className="flex-col items-center animate-bounce hidden sm:flex">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
              <path d="m6 15 6 6 6-6" />
            </svg>
          </div>
          <span className="flex items-center gap-2">
            <span className="sm:hidden animate-bounce">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
                <path d="m6 15 6 6 6-6" />
              </svg>
            </span>
            Scroll to explore
          </span>
        </div>

        {/* Bottom Center Button (Outer) */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[16%] md:bottom-[6%] pointer-events-auto z-30 w-[92vw] sm:w-auto flex justify-center">
          <button
            type="button"
            ref={magneticRef}
            onClick={() => router.push("/booking")}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="bg-white/10 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 p-1.5 sm:p-2.5 rounded-[2rem] sm:rounded-full flex items-center sm:gap-2 group will-change-transform w-full sm:w-auto"
          >
            <span className="bg-white text-[#1c1815] group-hover:bg-amber-brand group-hover:text-white px-4 sm:px-5 py-3 sm:py-2.5 rounded-[2rem] sm:rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-colors shadow-2xl flex-1 sm:flex-initial flex items-center justify-center text-center leading-tight">
              Book a Confidential First Session
            </span>
            <div className="bg-white hidden sm:flex rounded-full p-2.5 group-hover:bg-amber-brand transition-colors duration-200 group-hover:text-white shrink-0 items-center justify-center">
              <ChevronRight size={16} />
            </div>
          </button>
        </div>
      </div>

      <div
        ref={portalRef}
        className="relative z-0 overflow-hidden flex items-center justify-center w-[40vw] h-[40vh] sm:w-[30vw] sm:h-[60vh] lg:w-[25vw] lg:h-[75vh] rounded-full opacity-0 scale-50"
      >
        <div className="absolute inset-0 z-20 pointer-events-none rounded-[inherit]"></div>

        <div className="absolute inset-0 bg-black/40 z-10"></div>

        <Image
          ref={brightImageRef}
          src={HeroImageBright}
          alt="daylight hero"
          fill
          priority
          className="absolute inset-0 w-full h-full object-cover object-[center_top] md:object-center z-[1] pointer-events-none"
          style={{ opacity: 0 }}
          sizes="100vw"
        />

        <div className="relative z-20 w-full h-full max-w-[1240px] mx-auto flex flex-col items-center justify-center text-center px-6">
          {/* Initial State text inside Window */}
          <div
            ref={story1Ref}
            className="absolute inset-0 flex flex-col items-center justify-center opacity-0 translate-y-12 px-6"
          >
            <h2 className="text-2xl md:text-6xl font-playfair font-bold text-cream-brand leading-tight max-w-4xl split-line drop-shadow-xl">
              Trauma informed psychology and skill building for <br className="hidden md:block" />
              <span className="italic text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                children, adults, schools, and communities. Rooted in Sri Lanka. Reaching the world.
              </span>
            </h2>
            <div className="flex gap-4 mt-10 pointer-events-auto">
              <Link href="/services" className={btnPrimary}>
                Explore Our Services
              </Link>
              <Link href="/contact" className={btnSecondary}>
                Ask Us a Question
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
