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
      audience: "For Children (Ages 5–12)",
      categoryDesc: "Play-based and clinically guided sessions to help children regulate emotions, build resilience, and thrive at home and school. Includes our signature BBR curriculum.",
      categoryCtaLink: "/contact",
      programmes: [
        {
          title: "Building Blocks of Resilience (BBR)",
          tag: "Resilience Building Programme | Group & 1:1 Sessions",
          desc: "Our signature programme. BBR helps children aged 5 – 12 understand their feelings and build the skills to handle everyday challenges. Grounded in neuroscience and delivered through age-appropriate, engaging methods, this is emotional literacy at its most foundational.",
        },
        {
          title: "Loud and Clear!",
          tag: "Communication Skills Programme | Group Sessions",
          desc: "Designed for children aged 5 – 12, this programme helps young people find their voice speaking up, building confidence, and expressing themselves clearly and authentically.",
        },
        {
          title: "Art and Emotions",
          tag: "Art Therapy | Group Sessions",
          desc: "Some feelings don't have words yet. Through art, children are given a safe and creative space to express what they carry inside. A gentle, powerful entry point for emotional exploration and processing.",
        },
        {
          title: "Social-Emotional Learning Sessions",
          tag: "Play-Based Executive Functioning & Creative Therapy | Structured 1:1 Sessions",
          desc: "Structured 1:1 support for emotional regulation, behaviour, focus, and routines delivered through executive functioning tools and creative, play-based methods. Skills are built from the inside out.",
        },
      ],
      image: "/assets/images/children.png",
    },
    {
      id: "teenagers",
      audience: "For Teenagers (Ages 13 – 18)",
      categoryDesc: "Individual therapy and structured skill building for teens facing anxiety, stress, identity questions, or the pressures of adolescent life.",
      categoryCtaLink: "/contact",
      programmes: [
        {
          title: "Loud and Clear!",
          tag: "Communication Skills Programme | Group Sessions",
          desc: "The teenage edition of our communication programme supports adolescents aged 13 – 16 in building confidence, assertiveness, and self expression.",
        },
        {
          title: "Mind the Clock",
          tag: "Time Management Programme | 1:1 & Group Sessions",
          desc: "A practical, regulation informed programme for teens navigating stress, overwhelm, and the demands of school, work, and daily life.",
        },
        {
          title: "Bold & Brave",
          tag: "Confidence Building Programme | 1:1 & Small Group | 12 Weeks",
          desc: "A 12 week journey exploring emotions, values, and self-acceptance building the courage to be yourself. Confidence here grows through understanding, not performance.",
        },
        {
          title: "Counselling and Psychotherapy",
          tag: "Trauma Informed Therapy & Wellness Coaching | 1:1 Sessions",
          desc: "Individual therapy for teenagers navigating stress, emotional difficulties, and life challenges. Delivered within a trauma informed framework, sessions are paced and safe.",
        },
      ],
      image: "/assets/images/teenagers.png",
    },
    {
      id: "adults",
      audience: "For Adults",
      categoryDesc: "Trauma informed counselling and psychotherapy for anxiety, burnout, complex PTSD, and the patterns that keep resurfacing. In person and online.",
      categoryCtaLink: "/contact",
      programmes: [
        {
          title: "Counselling and Psychotherapy",
          tag: "Trauma Informed Therapy & Wellness Coaching | 1:1 Sessions",
          desc: "Individual therapy for adults across a wide range of presentations from anxiety and depression to Complex PTSD (C-PTSD), dissociative patterns, and psychosis-spectrum concerns. Our approach integrates CBT, EMDR informed methods, and somatic practices.",
        },
        {
          title: "Burnout Support Programme",
          tag: "Stress Management Programme | Group Sessions",
          desc: "For adults running on empty. This programme supports individuals in understanding and managing stress, restoring balance, and rebuilding capacity practically and sustainably.",
        },
      ],
      image: "/assets/images/adults.png",
    },
    {
      id: "schools",
      audience: "For Schools",
      categoryDesc: "Whole school mental health programmes, teacher capacity building, and BBR School Edition bringing trauma aware practice into every classroom.",
      categoryCtaLink: "/contact",
      programmes: [
        {
          title: "BBR School Edition",
          tag: "Resilience Building Programme | School Based Delivery",
          desc: "Structured programmes that support emotional skills, behaviour, and overall wellbeing delivered directly within school settings.",
        },
        {
          title: "Teacher Capacity Building",
          tag: "Educator Programme | Group Sessions & Workshops",
          desc: "Equips teachers with practical, trauma informed tools to recognise, understand, and safely support children's emotions and behaviour.",
        },
      ],
      image: "/assets/images/school.png",
    },
    {
      id: "organisations",
      audience: "For Organisations & Corporates",
      categoryDesc: "Workplace wellbeing workshops, stress management, and team mental health support that creates lasting cultural change.",
      categoryCtaLink: "/contact",
      programmes: [
        {
          title: "Corporate Success Programmes",
          tag: "Workplace Wellbeing | Group Sessions & Workshops",
          desc: "Tailored stress management and emotional wellbeing support for teams and organisations. We build psychologically safer, more resilient workplaces.",
        },
      ],
      image: "/assets/images/corporates.png",
    },
    {
      id: "communities",
      audience: "For Communities",
      categoryDesc: "Accessible group programmes, community initiatives, and the Lift Others as You Rise platform.",
      categoryCtaLink: "/contact",
      programmes: [
        {
          title: "Lift Others as You Rise",
          tag: "Community Wellbeing Programme | Group Sessions",
          desc: "Brings emotional wellbeing and resilience support to groups and communities rooted in the belief that when one person heals, it ripples outward.",
        },
      ],
      image: "/assets/images/community.png",
    },
    {
      id: "parents",
      audience: "For Parents",
      categoryDesc: "Guidance, coaching, and resources to help parents support their children's emotional development and their own.",
      categoryCtaLink: "/contact",
      programmes: [
        {
          title: "Parenting and Psycho Education Workshops",
          tag: "Parenting Programme | Group Sessions",
          desc: "Helping parents understand emotions their children's and their own so they can show up with more calm, connection, and confidence.",
        },
      ],
      image: "/assets/images/parents.png",
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
              Therapy and skill building that goes beyond the session.
            </h1>
            <p className="services-hero-subtitle mt-6 text-lg md:text-xl text-white/75 font-nunito leading-relaxed max-w-2xl">
              Whether you are a parent seeking support for your child, an adult carrying something long held, or a school leader building a trauma aware culture The Safe Space has a pathway designed for you.
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
              That’s completely okay. Tell us what you’re experiencing, and
              we’ll help you choose a path no pressure, no commitment.
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
