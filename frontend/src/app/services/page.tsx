"use client";

import React, { useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import GsapReveal from "@/components/GsapReveal";
import ServiceHeroBackground from "@/components/ServiceHeroBackground";

gsap.registerPlugin(ScrollTrigger);

export default function ServicesPage() {
  const serviceCategories = [
    {
      id: "children",
      audience: "Executive Leadership & C-Suite Coaching",
      categoryDesc: "High-level strategic coaching for C-suite leaders and executives to maximize decision-making, leadership presence, and organizational impact. Includes our signature BBR framework.",
      categoryCtaLink: "/contact",
      programmes: [
        {
          title: "Building Business Resilience (BBR)",
          tag: "Executive Leadership Framework | 1:1 & Boardroom Sessions",
          desc: "Our signature executive program. BBR helps C-suite leaders and ambitious executives navigate market volatility, optimize team performance, and scale operations sustainably. Grounded in proven business strategy and delivered through high-impact executive advisory.",
        },
        {
          title: "Executive Presence & Influence",
          tag: "Leadership Communication | 1:1 Coaching",
          desc: "Designed for senior leaders, this program focuses on mastering executive communication, boardroom authority, and stakeholder management to lead with absolute confidence.",
        },
        {
          title: "Strategic Decision Mastery",
          tag: "Strategic Advisory | C-Suite Sessions",
          desc: "Navigate complex business challenges with clarity. We provide structured frameworks for risk assessment, competitive positioning, and high-stakes executive decision-making.",
        },
        {
          title: "Executive Alignment & Execution",
          tag: "High-Performance Execution | Structured 1:1 Sessions",
          desc: "Structured 1:1 support to align personal leadership vision with quarterly corporate execution goals. Build operational excellence from the inside out.",
        },
      ],
      image: "/assets/images/vision.png",
    },
    {
      id: "teenagers",
      audience: "Business Scaling & Entrepreneurship",
      categoryDesc: "Tailored strategies for entrepreneurs and business owners to scale operations, optimize team performance, and accelerate sustainable growth.",
      categoryCtaLink: "/contact",
      programmes: [
        {
          title: "Scale & Expand Strategy",
          tag: "Business Growth Program | Group & 1:1 Sessions",
          desc: "A comprehensive growth program supporting founders in identifying market opportunities, optimizing operational bottlenecks, and scaling revenue efficiently.",
        },
        {
          title: "Operational Excellence",
          tag: "Systems & Processes | 1:1 & Team Advisory",
          desc: "A practical, systems-driven program for business owners navigating operational overwhelm, streamlining daily management, and building self-sustaining teams.",
        },
        {
          title: "Bold Market Positioning",
          tag: "Brand & Market Strategy | 12 Weeks",
          desc: "A 12-week strategic journey exploring competitive advantage, value proposition refinement, and premium market positioning to stand out in crowded industries.",
        },
        {
          title: "Founder Advisory & Sounding Board",
          tag: "Strategic Sounding Board | 1:1 Sessions",
          desc: "Confidential, one-on-one strategic advisory for founders navigating high-stakes business challenges, partnership dynamics, and growth milestones.",
        },
      ],
      image: "/assets/images/corporates.png",
    },
    {
      id: "adults",
      audience: "Career Advancement & Professional Growth",
      categoryDesc: "Targeted professional development to navigate career transitions, secure leadership promotions, and build a powerful professional brand.",
      categoryCtaLink: "/contact",
      programmes: [
        {
          title: "Career Trajectory Mapping",
          tag: "Professional Advancement | 1:1 Sessions",
          desc: "Strategic career coaching for ambitious professionals seeking to secure executive promotions, pivot industries, or maximize their earning potential. We build actionable career progression roadmaps.",
        },
        {
          title: "Leadership Acceleration",
          tag: "Management Development | Small Group Sessions",
          desc: "For high-performing individual contributors stepping into management. This program equips emerging leaders with the skills to delegate, manage team performance, and lead with authority.",
        },
      ],
      image: "/assets/images/impact.png",
    },
    {
      id: "schools",
      audience: "Corporate Workshops & Team Alignment",
      categoryDesc: "High-impact team alignment sessions, leadership communication training, and performance mastery workshops for modern organizations.",
      categoryCtaLink: "/contact",
      programmes: [
        {
          title: "BBR Corporate Edition",
          tag: "Organizational Resilience | On-Site Delivery",
          desc: "Structured corporate programs that support high-performance teamwork, strategic alignment, and overall organizational resilience delivered directly within company headquarters.",
        },
        {
          title: "Management Capacity Building",
          tag: "Leadership Workshop | Group Sessions",
          desc: "Equips corporate managers with practical, high-performance coaching frameworks to recognize, understand, and effectively lead diverse organizational teams.",
        },
      ],
      image: "/assets/images/corporates.png",
    },
    {
      id: "organisations",
      audience: "Workplace Productivity & Stress Mastery",
      categoryDesc: "Workplace productivity workshops, executive energy management, and team performance support that creates lasting operational excellence.",
      categoryCtaLink: "/contact",
      programmes: [
        {
          title: "Corporate Success & Peak Performance",
          tag: "Workplace Productivity | Group Sessions & Workshops",
          desc: "Tailored energy management and executive peak performance support for elite corporate teams. We build highly productive, adaptable, and focused organizations.",
        },
      ],
      image: "/assets/images/corporates.png",
    },
    {
      id: "communities",
      audience: "Leadership Masterminds & Peer Advisory",
      categoryDesc: "Exclusive peer advisory groups, structured masterminds, and our signature Lift Others as You Rise executive networking platform.",
      categoryCtaLink: "/contact",
      programmes: [
        {
          title: "Lift Others as You Rise Mastermind",
          tag: "Executive Peer Advisory | Group Sessions",
          desc: "Brings elite strategic networking and mutual accountability to ambitious business leaders—rooted in the belief that when one leader succeeds, the entire industry elevates.",
        },
      ],
      image: "/assets/images/community.png",
    },
    {
      id: "parents",
      audience: "Life Coaching & Personal Vision",
      categoryDesc: "Holistic personal coaching designed to establish work-life harmony, clarify personal vision, and unlock elite individual performance.",
      categoryCtaLink: "/contact",
      programmes: [
        {
          title: "Personal Vision & Life Strategy",
          tag: "Holistic Life Coaching | 1:1 Sessions",
          desc: "Helping high-achieving individuals clarify their core personal vision, master work-life harmony, and show up in every area of life with absolute calm, purpose, and confidence.",
        },
      ],
      image: "/assets/images/adults.png",
    },
  ];

  const containerRef = useRef<HTMLElement>(null);

  const highlights = useMemo(
    () => [
      {
        icon: Calendar,
        title: "Flexible scheduling",
        desc: "Flexible scheduling sessions that work around your life",
      },
      {
        icon: ClipboardList,
        title: "Structured and practical",
        desc: "Clear goals, real tools, and sessions that stay with you long after you leave.",
      },
      {
        icon: ShieldCheck,
        title: "Evidence based methods",
        desc: "Evidence based methods proven approaches, tailored to you",
      },
    ],
    [],
  );

  useGSAP(
    () => {
      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (reducedMotion) return;

      gsap.to(".services-blob", {
        y: -14,
        duration: 3.6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.6,
      });

      gsap.utils.toArray<HTMLElement>(".services-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".services-programme-card").forEach((card) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, x: -50 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>(".service-category-wrapper").forEach((wrapper) => {
        const cards = gsap.utils.toArray<HTMLElement>(".programme-sticky-card", wrapper);

        cards.forEach((card, index) => {
          if (index === cards.length - 1) return;

          const topOffset = 120 + index * 16;
          const maxTopOffset = 120 + (cards.length - 1) * 16;

          gsap.to(card, {
            scale: 1 - (cards.length - 1 - index) * 0.04,
            transformOrigin: "top center",
            scrollTrigger: {
              trigger: card,
              start: `top top+=${topOffset}`,
              endTrigger: cards[cards.length - 1],
              end: `top top+=${maxTopOffset}`,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        });
      });

      gsap.utils.toArray<HTMLElement>(".services-parallax").forEach((img) => {
        gsap.fromTo(
          img,
          { y: 10 },
          {
            y: -10,
            ease: "none",
            scrollTrigger: {
              trigger: img,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
      });
    },
    { scope: containerRef },
  );

  return (
    <main
      ref={containerRef}
      className="-mt-32 min-h-screen bg-cream-brand/30 pb-32"
    >
      {/* Hero */}
      <section className="hero_section relative min-h-[600px] h-screen md:h-[100svh] w-full flex items-center justify-center overflow-hidden pt-20 md:pt-0">
        <ServiceHeroBackground />
        <div className="container max-w-[1240px] px-6 pt-32 pb-24 md:pt-56 md:pb-32 relative">
          <GsapReveal className="max-w-3xl" direction="up" delay={0.1}>
            <div className="services-hero-badge inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-brand" />
              Our Services
            </div>

            <h1 className="services-hero-title mt-7 text-4xl md:text-7xl font-playfair font-bold text-white leading-[1.05]">
              Executive coaching and business strategy that drives measurable results.
            </h1>
            <p className="services-hero-subtitle mt-6 text-lg md:text-xl text-white/75 font-nunito leading-relaxed max-w-2xl">
              Whether you are a C-suite executive seeking strategic clarity, an entrepreneur scaling your business, or a professional navigating career advancement, The Safe Space Global has a pathway designed for you.
            </p>

            <div className="services-hero-actions mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/booking"
                className="btn-primary !bg-amber-brand border-amber-brand shadow-xl shadow-amber-brand/20 inline-flex items-center justify-center gap-2"
              >
                Book a Consultation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="btn-outline !text-white !border-white/30 bg-white/5 inline-flex items-center justify-center gap-2"
              >
                Ask Us a Question <MessageCircleMore className="h-4 w-4" />
              </Link>
            </div>
          </GsapReveal>
        </div>
      </section>

      {/* Highlights */}
      <section className="container max-w-[1240px] px-6 -mt-10 md:-mt-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <GsapReveal direction="down" delay={0.3}
                key={item.title}
                className="rounded-[2.25rem] border border-amber-brand/15 bg-white/85 backdrop-blur p-8 shadow-lg"
              >
                <div className="h-12 w-12 rounded-2xl bg-amber-brand/10 border border-amber-brand/20 flex items-center justify-center mb-5">
                  <Icon className="h-6 w-6 text-amber-brand" />
                </div>
                <h3 className="text-xl font-playfair font-bold text-navy-brand">
                  {item.title}
                </h3>
                <p className="mt-3 text-brown-brand/80 font-nunito leading-relaxed">
                  {item.desc}
                </p>
              </GsapReveal>
            );
          })}
        </div>
      </section>

      {/* Detailed programmes */}
      <section
        id="programmes"
        className="container max-w-[1240px] px-6 mt-24 md:mt-32"
      >
        <div className="mt-10 space-y-16 md:space-y-24">
          {serviceCategories.map((cat, idx) => (
            <div
              key={cat.audience}
              id={cat.id}
              className="service-category-wrapper grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start scroll-mt-32"
            >
              <div className="lg:sticky lg:top-32">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-brand/20 bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-navy-brand">
                  <span className="h-2 w-2 rounded-full bg-amber-brand" />
                  {cat.audience}
                </div>
                <div className="mt-6 hidden lg:block pr-8">
                  <p className="text-lg text-brown-brand/80 font-nunito leading-relaxed">
                    {cat.categoryDesc}
                  </p>
                </div>

                <GsapReveal direction="left" delay={0.1} className="mt-8 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-brand/10 via-white/40 to-sage-brand/10 border border-amber-brand/15 shadow-md">
                  <div className="services-parallax relative w-full flex items-center justify-center">
                    <Image
                      src={cat.image}
                      alt={cat.audience}
                      className="w-full h-auto object-cover block"
                      style={{ maxHeight: '70vh' }}
                      width={800}
                      height={600}
                    />
                  </div>
                  <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-brand/10 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-sage-brand/10 blur-2xl" />
                </GsapReveal>
              </div>

              <div className="flex flex-col gap-6 md:gap-8">
                {cat.programmes.map((prog, pIdx) => (
                  <div
                    key={prog.title}
                    id={idx === 0 && pIdx === 0 ? "bbr" : undefined}
                    className="services-programme-card programme-sticky-card sticky group overflow-hidden rounded-[2.5rem] border border-amber-brand/15 bg-white backdrop-blur-md p-7 md:p-9 shadow-md hover:shadow-2xl transition-shadow origin-top"
                    style={{ zIndex: pIdx + 10, top: `calc(120px + ${pIdx * 16}px)` }}
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-amber-brand/10 via-transparent to-sage-brand/10" />

                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-brand">
                      {prog.tag}
                    </p>
                    <h3 className="mt-3 text-2xl md:text-3xl font-playfair font-bold text-navy-brand leading-tight">
                      {prog.title}
                    </h3>
                    <p className="mt-4 text-brown-brand/80 font-nunito leading-relaxed text-base md:text-lg">
                      {prog.desc}
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <Link
                        href="/booking"
                        className="btn-primary !py-3 !px-6 text-xs inline-flex items-center gap-2"
                      >
                        Book session <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/contact"
                        className="btn-outline !py-3 !px-6 text-xs bg-white/60"
                      >
                        Ask Us a Question
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container max-w-[1240px] px-6 mt-24 md:mt-32">
        <div className="services-reveal relative overflow-hidden rounded-[3rem] md:rounded-[4rem] bg-navy-brand text-cream-brand p-10 md:p-16 shadow-2xl">
          <div className="relative z-10 max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-brand">
              Next step
            </p>
            <h2 className="mt-4 text-3xl md:text-5xl font-playfair font-bold leading-tight text-white">
              Not sure where to start?
            </h2>
            <p className="mt-5 text-lg md:text-xl text-cream-brand/70 font-nunito leading-relaxed">
              That’s completely okay. Tell us about your professional and business goals, and
              we’ll help you choose the right coaching package no pressure, no commitment.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="btn-primary !bg-amber-brand border-amber-brand shadow-xl shadow-amber-brand/20 inline-flex items-center justify-center gap-2"
              >
                Send a message <MessageCircleMore className="h-4 w-4" />
              </Link>
              <Link
                href="/booking"
                className="btn-outline !text-cream-brand !border-white/20 bg-white/5 inline-flex items-center justify-center gap-2"
              >
                Book a consultation <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="pointer-events-none absolute -top-24 -right-24 h-[380px] w-[380px] rounded-full bg-amber-brand/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-28 h-[420px] w-[420px] rounded-full bg-sage-brand/10 blur-3xl" />
        </div>
      </section>
    </main>
  );
}
