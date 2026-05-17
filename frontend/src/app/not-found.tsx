"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Animate the large "404" background text
      tl.fromTo(
        bgTextRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1.5, ease: "power3.out" }
      )

      // Continuous floating animation for the bird video
      gsap.to(videoRef.current, {
        y: -15,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-cream-brand to-brown-brand overflow-hidden relative"
    >
      {/* Huge Background 404 Text */}
      <div
        ref={bgTextRef}
        className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
      >
        <span className="text-[12rem] sm:text-[16rem] md:text-[22rem] lg:text-[26rem] font-black text-white drop-shadow-sm select-none leading-none tracking-tighter">
          404
        </span>
      </div>

      <div className="z-10 flex flex-col items-center text-center px-4 max-w-4xl w-full mt-10 md:mt-0">
        {/* Bird Video overlapping the '0' */}
        <div className="relative w-full max-w-[280px] sm:max-w-xs md:max-w-sm lg:max-w-md mx-auto mb-2 md:mb-6">
          <video
            ref={videoRef}
            src="/assets/video/bird.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto object-contain mix-blend-multiply filter drop-shadow-2xl"
          />
        </div>

        <div ref={textRef} className="space-y-4 relative z-20">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight font-nunito">
            Oops, I think we&apos;re lost...
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-lg mx-auto font-nunito pb-6">
            Let&apos;s get you back to somewhere familiar.
          </p>

          <div>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-3 bg-white text-slate-800 rounded-full px-8 py-3.5 text-base md:text-lg font-bold transition-all hover:scale-[1.05] shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/60 active:scale-[0.98] border border-slate-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
