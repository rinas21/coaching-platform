"use client";

import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

type TeamMember = {
  documentId?: string;
  name?: string;
  role?: string;
  credentials?: string;
  bio?: string;
  specialisations?: string;
  languages?: string;
  experience?: string;
  imageSrc: string | null;
};

interface TeamGalleryProps {
  team: TeamMember[];
}

export default function TeamGallery({ team }: TeamGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const wrapper = scrollWrapperRef.current;
      if (!wrapper) return;

      const cards = gsap.utils.toArray(".team-card") as HTMLElement[];
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

  if (!team.length) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[600px] overflow-hidden flex flex-row relative w-[100vw] mb-12 items-center"
      style={{ left: "50%", right: "50%", marginLeft: "-50vw", marginRight: "-50vw", width: "100vw" }}
    >
      <div ref={scrollWrapperRef} className="flex flex-row h-full px-[5vw] lg:px-[10vw] items-center w-max">
        {team.map((member, idx) => {
          return (
            <div
              key={member.documentId || `${member.name}-${idx}`}
              className="team-card relative shrink-0 w-[85vw] sm:w-[60vw] md:w-[40vw] lg:w-[28vw] mr-8 md:mr-12 h-full flex flex-col justify-center py-6"
            >
              <div className="flex flex-col mt-6 md:mt-10 min-h-[550px] md:h-auto bg-white py-6 md:py-10 gap-2 md:gap-4 rounded-3xl md:rounded-[4rem] px-4 shadow-sm border border-amber-brand/5 group hover:shadow-2xl transition-all duration-700 overflow-y-auto hide-scrollbar">
                <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto shrink-0 mb-2">
                  <div className="absolute inset-0 bg-amber-brand/10 rounded-full group-hover:scale-125 transition-transform duration-700 blur-2xl opacity-0 group-hover:opacity-100" />
                  <div className="w-full h-full rounded-full overflow-hidden border-8 border-white shadow-xl relative z-10">
                    {member.imageSrc ? (
                      <Image
                        src={member.imageSrc}
                        alt={member.name || "Team Member"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-cream-brand/60 flex items-center justify-center">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-brown-brand/50 text-center px-4">
                          No photo
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center flex flex-col justify-center">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-playfair font-bold text-navy-brand mb-2 md:mb-3 group-hover:text-amber-brand transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-amber-brand font-bold text-[9px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] mb-2 md:mb-4 h-auto md:h-8 flex items-center justify-center">
                    {member.role}
                  </p>
                  {member.credentials ? (
                    <p className="text-[11px] text-brown-brand/60 font-nunito">
                      {member.credentials}
                    </p>
                  ) : null}
                  <p className="text-brown-brand/70 font-nunito leading-relaxed italic text-sm md:text-[16px]">
                    {member.bio}
                  </p>
                  {(member.specialisations || member.languages || member.experience) && (
                    <div className="mt-auto pt-4 md:pt-6 border-t border-amber-brand/10">
                      <span className="text-[9px] md:text-[10px] font-bold text-navy-brand uppercase tracking-widest block">
                        Specialisations
                      </span>
                      {member.specialisations ? (
                        <p className="text-sm text-brown-brand/60 font-nunito">
                          {member.specialisations}
                        </p>
                      ) : null}
                      {member.languages ? (
                        <p className="text-sm text-brown-brand/60 font-nunito">
                          Languages: {member.languages}
                        </p>
                      ) : null}
                      {member.experience ? (
                        <p className="text-sm text-brown-brand/60 font-nunito">
                          {member.experience}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
