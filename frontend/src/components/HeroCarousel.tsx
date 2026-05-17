"use client";

import { ReactNode, useMemo, useRef } from "react";
import { BookOpen, ChevronRight, Contact } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Slide = {
  imageUrl: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string; icon: ReactNode };
  secondaryCta: { label: string; href: string; icon: ReactNode };
};

function HeroSlideContent({
  slide,
  isActive,
}: {
  slide: Slide;
  isActive: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const btnPrimary =
    "inline-flex w-fit justify-center text-sm sm:text-base items-center gap-2 bg-primary text-white rounded-full px-5 py-2.5 font-medium transition-all duration-200 hover:bg-[var(--primary)] hover:text-white hover:-translate-y-px";

  const btnSecondary =
    "inline-flex w-fit justify-center text-sm sm:text-base items-center gap-2 bg-white/15 text-white rounded-full px-5 py-2.5 font-medium border border-white/35 transition-all duration-200 hover:bg-white/20 hover:text-white hover:-translate-y-px";

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const isMobile = window.innerWidth < 768;

      if (isActive) {
        const tl = gsap.timeline();

        if (isMobile) {
          gsap.set(".carousel-tile", { display: "none" });
          
          tl.fromTo(
            ".slide-bg",
            { scale: 1.05 },
            { scale: 1, duration: 1.5, ease: "power2.out" }
          )
          .fromTo(
            ".char-span",
            { y: 15, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.4,
              stagger: 0.02,
              ease: "power2.out",
            },
            "-=1"
          )
          .fromTo(
            ".desc-p",
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
            "-=0.2"
          )
          .fromTo(
            ".cta-div",
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
            "-=0.2"
          );
        } else {
          gsap.set(".carousel-tile", {
            clearProps: "all",
            scaleX: 1,
            scaleY: 1,
            scale: 1,
            y: "0%",
            opacity: 1,
          });

          const rand = Math.floor(Math.random() * 6);
          let tileAnim: gsap.TweenVars = { duration: 0.8, ease: "power4.inOut" };

          if (rand === 0)
            tileAnim = {
              ...tileAnim,
              scaleX: 0,
              stagger: 0.04,
              transformOrigin: "right",
            };
          else if (rand === 1)
            tileAnim = {
              ...tileAnim,
              scaleX: 0,
              stagger: 0.04,
              transformOrigin: "left",
            };
          else if (rand === 2)
            tileAnim = {
              ...tileAnim,
              scaleY: 0,
              stagger: 0.04,
              transformOrigin: "bottom",
            };
          else if (rand === 3)
            tileAnim = {
              ...tileAnim,
              scaleY: 0,
              stagger: -0.04,
              transformOrigin: "top",
            };
          else if (rand === 4)
            tileAnim = {
              ...tileAnim,
              scale: 0,
              opacity: 0,
              stagger: { each: 0.03, from: "random" },
            };
          else if (rand === 5)
            tileAnim = { ...tileAnim, y: "-100%", stagger: 0.03 };

          tl.to(".carousel-tile", tileAnim)
            .fromTo(
              ".slide-bg",
              { scale: 1.25 },
              { scale: 1, duration: 2, ease: "power4.out" },
              "-=0.6",
            )
            .fromTo(
              ".char-span",
              { y: 30, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.04,
                ease: "back.out(1.4)",
              },
              "-=1.5",
            )
            .fromTo(
              ".desc-p",
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
              "-=0.4",
            )
            .fromTo(
              ".cta-div",
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
              "-=0.4",
            );
        }
      } else {
        gsap.set(".slide-bg", { scale: 1.25 });
        gsap.set(".carousel-tile", {
          clearProps: "all",
          scaleX: 1,
          scaleY: 1,
          scale: 1,
          y: "0%",
          opacity: 1,
        });
        gsap.set([".char-span", ".desc-p", ".cta-div"], { opacity: 0, y: 20 });
      }
    },
    { dependencies: [isActive], scope: containerRef },
  );

  return (
    <div ref={containerRef} className="relative w-full h-screen pt-32">
      {/* Tiles for "Breaking" Effect */}
      <div className="absolute inset-0 z-10 pointer-events-none flex">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="carousel-tile h-full flex-1 bg-[#0b0b0b]" />
        ))}
      </div>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={slide.imageUrl}
          alt={slide.title}
          fill
          priority
          sizes="100vw"
          className="slide-bg object-cover object-center origin-center"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-black/15" />

      {/* Content */}
      <div className="relative z-[2] mx-auto max-w-[1200px] px-6 pt-20 sm:pt-28 pb-16">
        <h1 className="mb-6 max-w-[500px] text-4xl sm:text-6xl text-white uppercase font-bold leading-[1.15] tracking-[-0.6px]">
          {slide.title.split(" ").map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block mr-[0.25em]">
              {word.split("").map((char, charIndex) => (
                <span
                  key={charIndex}
                  className="char-span inline-block opacity-0"
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
          ))}
        </h1>

        <p className="desc-p mb-6 sm:mb-10 max-w-[450px] text-sm sm:text-xl text-white/85 opacity-0">
          {slide.description}
        </p>

        <div className="cta-div flex flex-col items-start sm:flex-row gap-3 sm:gap-4 opacity-0">
          <button
            type="button"
            onClick={() => router.push(slide.primaryCta.href)}
            className={btnPrimary}
          >
            <span>{slide.primaryCta.label}</span>
            {slide.primaryCta.icon}
          </button>

          <button
            type="button"
            onClick={() => router.push(slide.secondaryCta.href)}
            className={btnSecondary}
          >
            <span>{slide.secondaryCta.label}</span>
            {slide.secondaryCta.icon}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HeroCarousel() {
  const slides: Slide[] = useMemo(
    () => [
      {
        imageUrl: "/assets/hero_painted.jpg",
        title: "Change the pattern. Break the cycle.",
        description:
          "A trauma informed space for healing and human development. Opening a new story for your future self.",
        primaryCta: {
          label: "Our Services",
          href: "/services",
          icon: <ChevronRight size={16} />,
        },
        secondaryCta: {
          label: "Book a Session",
          href: "/booking",
          icon: <BookOpen size={16} />,
        },
      },
      {
        imageUrl: "/assets/design_brief.jpg",
        title: "A Storybook for Grown-Ups",
        description:
          "What you experienced as a child shaped you. What your child experiences now will shape them. We are here.",
        primaryCta: {
          label: "About Us",
          href: "/about",
          icon: <ChevronRight size={16} />,
        },
        secondaryCta: {
          label: "Read our Blog",
          href: "/blog",
          icon: <Contact size={16} />,
        },
      },
    ],
    [],
  );

  return (
    <section className="relative w-full overflow-hidden ">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        speed={1}
        fadeEffect={{ crossFade: true }}
        loop
        autoplay={{
          delay: 8000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        className="h-full "
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            {({ isActive }) => (
              <HeroSlideContent slide={slide} isActive={isActive} />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Scroll indicator */}
      <div className="absolute bottom-16 left-0 right-0 z-[2] flex flex-col items-center gap-1 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
        <span>Scroll</span>
        <div className="w-6 h-10 border-2 border-white/70 rounded-full animate-bounce delay-700 flex justify-center items-center mt-4">
          <div className="w-1 h-3 bg-white/70 rounded-full animate-bounce delay-500"></div>
        </div>
      </div>
    </section>
  );
}
