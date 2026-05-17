"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import GsapSplitText from "@/components/GsapSplitText";
import Image from "next/image";
gsap.registerPlugin(ScrollTrigger);

const servicePillars = [
  {
    title: "Executive Coaching",
    desc: "High-level strategic coaching for C-suite leaders and executives to maximize decision-making, leadership presence, and organizational impact.",
    image: "/assets/images/vision.png",
  },
  {
    title: "Business Coaching",
    desc: "Tailored strategies for entrepreneurs and business owners to scale operations, optimize team performance, and accelerate sustainable growth.",
    image: "/assets/images/corporates.png",
  },
  {
    title: "Career Coaching",
    desc: "Targeted professional development to navigate career transitions, secure leadership promotions, and build a powerful professional brand.",
    image: "/assets/images/impact.png",
  },
  {
    title: "Life Coaching",
    desc: "Holistic personal coaching designed to establish work-life harmony, clarify personal vision, and unlock elite individual performance.",
    image: "/assets/images/adults.png",
  },
  {
    title: "Corporate Workshops",
    desc: "High-impact team alignment sessions, leadership communication training, and performance mastery workshops for modern organizations.",
    image: "/assets/images/corporates.png",
  },
  {
    title: "Leadership Masterminds",
    desc: "Exclusive peer advisory groups and structured masterminds connecting ambitious leaders for mutual growth, accountability, and strategic breakthrough.",
    image: "/assets/images/community.png",
  },
];

export default function PinnedServicePillars() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".pillar-card") as HTMLElement[];

      cards.forEach((card, index) => {
        if (index === cards.length - 1) return;

        gsap.to(card, {
          scale: 0.94 - index * 0.01,
          scrollTrigger: {
            trigger: card,
            start: "top top+=140",
            endTrigger: cards[index + 1],
            end: "top top+=140",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });
    },
    { scope: container },
  );

  return (
    <div ref={container} className="relative w-full">
      <div className="flex flex-col gap-6 lg:gap-10">
        {servicePillars.map((pillar, idx) => (
          <div
            key={idx}
            className="pillar-card sticky group top-[140px] w-full min-h-[450px] flex flex-col md:flex-row justify-between bg-cream-brand backdrop-blur-md rounded-[3rem] p-10 md:p-16 shadow-xl border border-amber-brand overflow-hidden"
            style={{ zIndex: idx + 10 }}
          >
            <div className="md:w-1/2 mb-8 md:mb-0 flex flex-col ">
              <GsapSplitText
                text={pillar.title}
                elementType="h3"
                className="text-2xl md:text-5xl font-playfair font-bold text-navy-brand mb-8 leading-tight"
              />
              <p className="max-w-96 mt-0 md:mt-10 flex flex-col gap-5 text-brown-brand/80 font-nunito text-sm md:text-lg leading-snug">
                {pillar.desc}
              </p>
            </div>
            <div className="w-full md:w-1/2 flex justify-center items-center mt-0 relative">
              <Image
                src={pillar.image}
                alt={pillar.title}
                className="w-full h-auto object-contain rounded-[2.5rem] group-hover:scale-105 transition-all duration-500 ease-in-out"
                width={600}
                height={600}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
