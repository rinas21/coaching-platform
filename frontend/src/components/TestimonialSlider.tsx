"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export type Testimonial = {
  quote: string;
  attribution: string;
};

interface TestimonialSliderProps {
  testimonials: Testimonial[];
}

export default function TestimonialSlider({
  testimonials,
}: TestimonialSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const wrapper = scrollWrapperRef.current;
      if (!wrapper) return;

      const cards = gsap.utils.toArray(".testimonial-card") as HTMLElement[];
      if (!cards.length) return;

      const totalScroll = Math.max(0, wrapper.scrollWidth - window.innerWidth);
      if (totalScroll === 0) return;

      gsap.to(wrapper, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          start: "center center", 
          end: () => `+=${totalScroll}`,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: containerRef }
  );

  if (!testimonials.length) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[450px] overflow-hidden flex flex-row relative w-[100vw] mt-16 items-center"
      style={{ left: "50%", right: "50%", marginLeft: "-50vw", marginRight: "-50vw", width: "100vw" }}
    >
      <div ref={scrollWrapperRef} className="flex flex-row h-full items-center px-[5vw] lg:px-[10vw]">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="testimonial-card relative shrink-0 w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[35vw] mr-6 md:mr-10 h-auto"
          >
            <div className="rounded-[2.5rem] p-8 md:p-10 shadow-lg h-full flex flex-col justify-between border border-amber-brand/10 bg-white/60 backdrop-blur-sm hover:shadow-xl transition-shadow duration-500">
              <div className="relative">
                <span className="absolute -top-6 -left-4 text-6xl text-amber-brand/20 font-serif">
                  “
                </span>
                <p className="mb-8 text-lg md:text-xl italic font-playfair leading-relaxed text-navy-brand relative z-10">
                  {t.quote}
                </p>
              </div>
              <footer className="text-xs md:text-sm font-bold tracking-widest uppercase text-amber-brand mt-auto pt-6 border-t border-amber-brand/10">
                — {t.attribution}
              </footer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
