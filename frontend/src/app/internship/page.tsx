"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, BookOpen, ShieldCheck, Milestone, Users, Lightbulb, ClipboardList, BookMarked, Target, Shield, CheckCircle } from "lucide-react";
import InternshipCvApplicationForm from "@/components/InternshipCvApplicationForm";
import InternshipHeroBackground from "@/components/InternshipHeroBackground";

gsap.registerPlugin(ScrollTrigger);

export default function InternshipPage() {
  const containerRef = useRef<HTMLElement>(null);

  const levels = [
    {
      level: "Level 1 — Diploma",
      identity: "The Helper",
      focus: "Batch size: 10 | Lectures: Mondays, 9am–12pm",
      description:
        "This level lays the foundation. Interns develop emotional literacy, trauma informed listening, and the ability to design and facilitate structured group activities.",
      months: [
        {
          title: "Month 1 — Foundations & Research",
          desc: "Training in emotional literacy, trauma informed listening, SEL and BBR frameworks, compassion fatigue, and professional boundaries. Groups of 5 design BBR based activities around a chosen psychosocial theme.",
        },
        {
          title: "Month 2 — Fieldwork",
          desc: "Two community sessions per week, delivering SEL sessions and documenting emotional shifts and participation across 6 weeks.",
        },
        {
          title: "Month 3 — Analysis & Presentation",
          desc: "Before and after comparison, qualitative reporting, activity evaluation, and group presentation.",
        },
      ],
      competencies:
        "Emotional literacy, empathic communication, SEL design, documentation basics.",
      icon: "🌱",
      color: "from-amber-brand/20 to-amber-brand/5",
      accent: "text-amber-brand",
    },
    {
      level: "Level 2 — Bachelor's",
      identity: "The Applied Practitioner",
      focus: "Focus: Moderate anxiety, depression, and mild dysregulation",
      description:
        "This level bridges theory and clinical practice. Interns work with real clients under supervision, developing the skills to assess, plan, and implement evidence-based interventions.",
      months: [
        {
          title: "Month 1 — Academic Foundations",
          desc: "Weekly lectures on anxiety, mood, and behavioural disorders, grounding techniques, psychoeducation, Executive Functioning (EF) theory, and polyvagal theory. Interns develop weekly fictional client plans across 6 disorder presentations.",
        },
        {
          title: "Month 2 — EF Intervention",
          desc: "Each intern is assigned one real client and implements a structured 6-week Executive Functioning intervention plan, with weekly progress documentation.",
        },
        {
          title: "Month 3 — Case Documentation",
          desc: "EF comparison analysis, clinical reasoning, full case study, and a supervisor-approved treatment plan.",
        },
      ],
      competencies:
        "Disorder identification, EF intervention delivery, treatment planning, case reasoning.",
      icon: "🌿",
      color: "from-sage-brand/20 to-sage-brand/5",
      accent: "text-sage-brand",
    },
    {
      level: "Level 3 — Master's",
      identity: "The Emerging Therapist",
      focus: "Focus: Complex presentations, trauma, and attachment",
      description:
        "This is the most advanced level of our programme. Interns work with three assigned clients, integrating multiple therapeutic modalities under weekly supervision to build a full clinical portfolio.",
      outcomes: [
        "Case formulation and treatment planning",
        "Delivery of CBT, ACT, and trauma informed modalities",
        "Attachment theory integration",
        "Process note writing and clinical portfolio building",
        "Ethical judgment and reflective depth",
      ],
      competencies:
        "Case formulation, therapeutic engagement, modality integration, ethical decision-making.",
      icon: "🌳",
      color: "from-navy-brand/10 to-navy-brand/5",
      accent: "text-navy-brand",
    },
  ];

  useGSAP(
    () => {
      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (reducedMotion) return;

      // Hero Animations
      const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });
      heroTl
        .fromTo(
          ".intern-hero-badge",
          { autoAlpha: 0, y: 15, scale: 0.95 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 },
        )
        .fromTo(
          ".intern-hero-title",
          { autoAlpha: 0, y: 30, rotationX: -10 },
          { autoAlpha: 1, y: 0, rotationX: 0, duration: 1.2 },
          "-=0.6",
        )
        .fromTo(
          ".intern-hero-subtitle",
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 1 },
          "-=0.8",
        );

      // Hero Parallax
      gsap.to(".intern-hero-bg", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: ".intern-hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Floating Blobs
      gsap.to(".intern-blob", {
        y: -20,
        rotation: 5,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.8,
      });

      // Reveal Animations
      gsap.utils.toArray<HTMLElement>(".intern-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      // Staggered lists
      gsap.utils.toArray<HTMLElement>(".stagger-group").forEach((group) => {
        const items = group.querySelectorAll(".stagger-item");
        gsap.fromTo(
          items,
          { autoAlpha: 0, x: -10 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: group,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Cards Stagger
      gsap.utils.toArray<HTMLElement>(".intern-level-card").forEach((card) => {
        const elements = card.querySelectorAll(".level-stagger");
        gsap.fromTo(
          elements,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    },
    { scope: containerRef },
  );

  return (
    <main
      ref={containerRef}
      className="-mt-32 min-h-screen bg-cream-brand/30 overflow-hidden pb-32"
    >
      {/* Hero Section */}
      <section className="hero_section relative min-h-[600px] h-[50svh] md:h-[100svh] w-full flex items-center justify-center overflow-hidden pt-20 md:pt-0">
        <InternshipHeroBackground />
        <div className="container max-w-[1240px] px-6 relative z-10 text-center mt-20">
          <div className="intern-hero-badge inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white font-bold tracking-[0.2em] uppercase text-[11px] px-5 py-2.5 rounded-full mb-8 border border-white/20 shadow-lg">
            <Milestone className="w-4 h-4" />
            Professional Training Pathway
          </div>
          <h1 className="intern-hero-title text-5xl md:text-7xl lg:text-8xl font-playfair font-bold text-white mb-8 leading-[1.1] drop-shadow-lg [perspective:1000px]">
            Train Where the <br className="hidden md:block" /> Work Is Real.
          </h1>
          <p className="intern-hero-subtitle mx-auto max-w-2xl text-lg md:text-xl text-white/85 font-nunito leading-relaxed">
            The Safe Space Internship Programme is not a passive placement. It is
            a structured, supervised, and deeply intentional training pathway
            designed to shape ethical, reflective, and practice-ready mental
            health practitioners.
          </p>
          <p className="intern-hero-subtitle mx-auto max-w-2xl text-lg md:text-xl text-white/90 font-nunito leading-relaxed mt-4 font-bold">
            We don&apos;t just give interns experience. We give them formation.
          </p>
        </div>
      </section>

      <section className="container max-w-[1240px] px-6 relative z-10 mt-20">

        {/* Intro Sections */}
        <div className="grid lg:grid-cols-3 gap-10 mb-24 md:mb-32">

          {/* Who This Is For */}
          <div className="intern-reveal bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-10 border border-amber-brand/10 shadow-lg group hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-amber-brand/10 text-amber-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-playfair font-bold text-navy-brand mb-4">Who This Is For</h3>
            <p className="text-brown-brand/80 font-nunito mb-6">Open to psychology students and early-career practitioners at three levels:</p>
            <ul className="space-y-4 stagger-group">
              <li className="stagger-item flex gap-3 text-brown-brand/90 font-nunito bg-white/50 p-3 rounded-xl border border-transparent hover:border-amber-brand/20 transition-colors">
                <span className="font-bold text-navy-brand shrink-0">Diploma</span>
                <span className="text-sm">building foundational helping skills</span>
              </li>
              <li className="stagger-item flex gap-3 text-brown-brand/90 font-nunito bg-white/50 p-3 rounded-xl border border-transparent hover:border-amber-brand/20 transition-colors">
                <span className="font-bold text-navy-brand shrink-0">Bachelor&apos;s</span>
                <span className="text-sm">developing applied clinical competency</span>
              </li>
              <li className="stagger-item flex gap-3 text-brown-brand/90 font-nunito bg-white/50 p-3 rounded-xl border border-transparent hover:border-amber-brand/20 transition-colors">
                <span className="font-bold text-navy-brand shrink-0">Master&apos;s</span>
                <span className="text-sm">stepping into the identity of an emerging therapist</span>
              </li>
            </ul>
            <p className="text-brown-brand/80 font-nunito mt-6 text-sm italic">Whether you are just starting out or deepening your clinical skills, there is structured space for you here.</p>
          </div>

          {/* Programme Philosophy */}
          <div className="intern-reveal bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-10 border border-sage-brand/20 shadow-lg group hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-sage-brand/20 text-sage-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Lightbulb className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-playfair font-bold text-navy-brand mb-4">Programme Philosophy</h3>
            <p className="text-brown-brand/80 font-nunito mb-6">Grounded in the values that guide all our work at TSSG:</p>
            <ul className="space-y-3 stagger-group">
              {[
                "Emotional literacy and trauma informed communication",
                "Reflective practice and self-awareness",
                "Neurodevelopmental science and SEL foundations",
                "Multicultural awareness and ethical integrity"
              ].map((item, i) => (
                <li key={i} className="stagger-item flex items-start gap-3 text-brown-brand/90 font-nunito text-sm">
                  <CheckCircle className="w-4 h-4 text-sage-brand shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-brown-brand/80 font-nunito mt-6 text-sm italic">Good practitioners are shaped through supervised experience, honest reflection, and the courage to engage with real human complexity.</p>
          </div>

          {/* Programme Structure */}
          <div className="intern-reveal bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-10 border border-navy-brand/10 shadow-lg group hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-navy-brand/10 text-navy-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-playfair font-bold text-navy-brand mb-4">Programme Structure</h3>
            <p className="text-brown-brand/80 font-nunito mb-6">All levels run for <strong>3 months</strong> with mandatory <strong>80% attendance</strong>. Every level includes:</p>
            <ul className="space-y-3 stagger-group">
              {[
                "Weekly theory sessions",
                "Fieldwork with real-world application",
                "Structured documentation",
                "Individual and group supervision",
                "Formal assessments"
              ].map((item, i) => (
                <li key={i} className="stagger-item flex items-start gap-3 text-brown-brand/90 font-nunito text-sm">
                  <span className="w-2 h-2 rounded-full bg-navy-brand shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* The Three Levels Header */}
        <div className="intern-reveal text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-navy-brand mb-4">The Three Levels</h2>
          <p className="text-lg text-brown-brand/70 font-nunito max-w-2xl mx-auto">
            A comprehensive, structured pathway from foundational skills to advanced clinical practice.
          </p>
        </div>

        {/* Levels Grid */}
        <div className="space-y-24 md:space-y-32 mb-24 md:mb-32">
          {levels.map((lvl, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={idx} className="intern-level-card relative grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                {/* Visual Side */}
                <div className={`w-full h-[400px] md:h-[500px] rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br ${lvl.color} border border-black/5 shadow-xl overflow-hidden relative flex flex-col items-center justify-center p-8 group ${!isEven ? 'lg:order-2' : ''}`}>
                  <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="absolute inset-0 bg-[url('/assets/images/noise.png')] opacity-[0.03] mix-blend-overlay" />
                  <div className="intern-level-icon text-7xl md:text-9xl filter drop-shadow-xl z-10 group-hover:scale-110 transition-transform duration-500">
                    {lvl.icon}
                  </div>
                  <div className="absolute bottom-8 right-8 z-10">
                    <span className="bg-white/80 backdrop-blur-sm text-navy-brand text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                      {lvl.level}
                    </span>
                  </div>
                </div>

                {/* Content Side */}
                <div className={`space-y-8 ${!isEven ? 'lg:order-1' : ''}`}>
                  <div className="level-stagger">
                    <span className={`${lvl.accent} font-bold text-[11px] uppercase tracking-[0.2em] mb-3 block`}>
                      {lvl.level}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-playfair font-bold text-navy-brand mb-4 leading-tight">
                      Identity: {lvl.identity}
                    </h2>
                    <p className="text-brown-brand/70 font-nunito text-base md:text-lg font-medium">
                      {lvl.focus}
                    </p>
                  </div>

                  <div className="level-stagger h-px w-full bg-amber-brand/10" />

                  <div className="level-stagger">
                    <p className="text-lg text-brown-brand/80 font-nunito leading-relaxed mb-6">
                      {lvl.description}
                    </p>
                  </div>

                  {lvl.months ? (
                    <div className="space-y-4">
                      {lvl.months.map((m, i) => (
                        <div
                          key={i}
                          className="level-stagger p-5 md:p-6 bg-white/60 hover:bg-white backdrop-blur-sm rounded-2xl md:rounded-3xl border border-amber-brand/10 shadow-sm transition-colors duration-300 group"
                        >
                          <h5 className="font-bold text-navy-brand text-sm md:text-base mb-2 group-hover:text-amber-brand transition-colors">
                            {m.title}
                          </h5>
                          <p className="text-brown-brand/70 text-sm md:text-base font-nunito leading-relaxed">
                            {m.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {lvl.outcomes?.map((o, i) => (
                        <li
                          key={i}
                          className="level-stagger flex gap-4 items-start text-base text-brown-brand/80 font-nunito bg-white/40 p-4 rounded-2xl border border-transparent hover:border-amber-brand/20 hover:bg-white/60 transition-all duration-300"
                        >
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-navy-brand shrink-0" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="level-stagger bg-white/80 border border-amber-brand/15 rounded-3xl p-6 md:p-8 flex flex-col justify-center shadow-md">
                    <h4 className={`text-[11px] font-bold ${lvl.accent} uppercase tracking-widest mb-3 flex items-center gap-2`}>
                      <BookOpen className="w-4 h-4" />
                      Core Competencies
                    </h4>
                    <p className="text-base md:text-lg font-playfair font-bold text-navy-brand leading-relaxed">
                      {lvl.competencies}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Standards & Supervision Grid */}
        <div className="intern-reveal mb-24 md:mb-32">

          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-navy-brand mb-4">Programme Standards</h2>
            <p className="text-lg text-brown-brand/70 font-nunito max-w-3xl mx-auto">
              Our internship is designed and delivered in alignment with APA and BPS ethical frameworks, and informed by international practicum standards. Every element has been deliberately built to prepare interns for practice at the highest level.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">

            {/* Supervision */}
            <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 border border-amber-brand/20 shadow-xl group hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-brand/10 flex items-center justify-center text-amber-brand">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-playfair font-bold text-navy-brand">Supervision</h3>
              </div>
              <p className="text-brown-brand/80 font-nunito mb-6 leading-relaxed">
                All interns are supervised by Master&apos;s-level psychologists with a minimum of 3 years clinical experience. Supervision is structured, regular, and covers:
              </p>
              <ul className="space-y-3 stagger-group">
                {[
                  "Case review and clinical reasoning",
                  "Ethical oversight and guidance",
                  "Skills correction and development",
                  "Documentation refinement",
                  "Emotional containment and professional modelling"
                ].map((item, i) => (
                  <li key={i} className="stagger-item flex items-start gap-3 text-brown-brand/90 font-nunito text-base">
                    <span className="w-2 h-2 rounded-full bg-amber-brand shrink-0 mt-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-navy-brand font-bold italic font-playfair text-lg">Supervision is not an add-on. It is the backbone of the programme.</p>
            </div>

            {/* Documentation Requirements */}
            <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 border border-sage-brand/30 shadow-xl group hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-sage-brand/20 flex items-center justify-center text-sage-brand">
                  <BookMarked className="w-6 h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-playfair font-bold text-navy-brand">Documentation</h3>
              </div>
              <p className="text-brown-brand/80 font-nunito mb-6 leading-relaxed">
                Interns develop professional habits through structured documentation throughout the programme, including:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-group mb-6">
                {[
                  "Weekly reflective journals",
                  "Supervision logs",
                  "Session documentation",
                  "Baseline & post-intervention comparisons",
                  "Case notes (where applicable)",
                  "Final portfolio or presentation"
                ].map((item, i) => (
                  <div key={i} className="stagger-item bg-white p-3 rounded-xl border border-black/5 text-sm font-nunito text-brown-brand/90">
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-brown-brand/70 font-nunito text-sm italic">This builds accountability, ethical clarity, and professional writing skills that carry forward into your career.</p>
            </div>

            {/* Assessment Framework */}
            <div className="bg-navy-brand text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-brand/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-cream-brand">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-playfair font-bold text-white">Assessment</h3>
              </div>
              <p className="text-white/80 font-nunito mb-6 leading-relaxed relative z-10">
                Interns are assessed across multiple dimensions:
              </p>
              <ul className="space-y-3 stagger-group relative z-10 mb-8">
                {[
                  "Reflective journals",
                  "Supervisor evaluations",
                  "Treatment plans and case studies",
                  "Before-and-after analyses",
                  "Final presentation or clinical portfolio"
                ].map((item, i) => (
                  <li key={i} className="stagger-item flex items-start gap-3 text-white/90 font-nunito text-base">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-brand shrink-0 mt-2.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 relative z-10">
                <p className="text-sm text-cream-brand font-nunito"><span className="font-bold text-amber-brand">Criteria:</span> accuracy, insight, ethical practice, professionalism, and competency progression across the programme.</p>
              </div>
            </div>

            {/* Ethical Standards */}
            <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 border border-black/5 shadow-xl group hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-playfair font-bold text-navy-brand">Ethical Standards</h3>
              </div>
              <p className="text-brown-brand/80 font-nunito mb-6 leading-relaxed">
                Our programme is aligned with APA and BPS ethical guidelines, including:
              </p>
              <ul className="space-y-3 stagger-group mb-8">
                {[
                  "Confidentiality and informed consent",
                  "Non-discrimination and cultural sensitivity",
                  "Professional boundaries",
                  "Data protection"
                ].map((item, i) => (
                  <li key={i} className="stagger-item flex items-center gap-3 text-brown-brand/90 font-nunito text-base">
                    <CheckCircle className="w-5 h-5 text-green-600/70 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                <p className="text-sm text-brown-brand/80 font-nunito leading-relaxed">Interns may not diagnose, practise independently, breach confidentiality, or exceed their scope of practice without supervision. <strong>Ethical practice is not optional — it is foundational.</strong></p>
              </div>
            </div>

          </div>
        </div>

        {/* Global CTA - Why Train at TSSG */}
        <div className="intern-reveal bg-navy-brand p-10 md:p-16 lg:p-20 rounded-[3rem] md:rounded-[4rem] text-white text-center relative overflow-hidden shadow-2xl">
          <div className="intern-blob absolute top-0 right-0 w-80 h-80 bg-amber-brand/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
          <div className="intern-blob absolute bottom-0 left-0 w-80 h-80 bg-sage-brand/20 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <span className="inline-block bg-white/10 backdrop-blur-md text-amber-brand font-bold tracking-widest uppercase text-[11px] px-4 py-2 rounded-full mb-6 border border-white/15">
              Why Train at TSSG?
            </span>
            <h2 className="text-4xl md:text-6xl font-playfair font-bold mb-8 leading-[1.1] text-white">
              We are building the next generation of trauma informed practitioners.
            </h2>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 mb-10 text-left w-full max-w-2xl mx-auto stagger-group">
              <p className="text-cream-brand mb-4 font-playfair text-xl italic">This is not a tick-box placement. When you train at The Safe Space, you are stepping into an environment where:</p>
              <ul className="space-y-3">
                <li className="stagger-item flex items-start gap-3 text-white/90 font-nunito text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-brand shrink-0 mt-2" />
                  <span>Theory meets real practice from day one</span>
                </li>
                <li className="stagger-item flex items-start gap-3 text-white/90 font-nunito text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-brand shrink-0 mt-2" />
                  <span>Supervision is meaningful, not minimal</span>
                </li>
                <li className="stagger-item flex items-start gap-3 text-white/90 font-nunito text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-brand shrink-0 mt-2" />
                  <span>You are challenged to grow clinically, ethically, and personally</span>
                </li>
                <li className="stagger-item flex items-start gap-3 text-white/90 font-nunito text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-brand shrink-0 mt-2" />
                  <span>Your development is taken seriously by those who built this from the ground up</span>
                </li>
              </ul>
            </div>
            <h3 className="text-3xl font-playfair font-bold text-white mb-4">Ready to apply?</h3>
            <p className="text-lg text-white/80 font-nunito mb-10">
              Applications are reviewed on a rolling basis. All levels begin with a short expression of interest.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
              <Link
                href="#internship-application"
                className="btn-primary !bg-amber-brand border-amber-brand shadow-xl shadow-amber-brand/20 inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform px-8 py-4 text-lg font-bold"
              >
                Apply for the Fellowship <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <p className="text-xs text-white/40 font-nunito mt-16 tracking-widest uppercase">
              The Safe Space | Internship Programme | Unified Academic Edition | Revised 2025
            </p>
          </div>
        </div>

        <div id="internship-application" className="container mt-16 px-0 relative z-10">
          <InternshipCvApplicationForm />
        </div>
      </section>
    </main>
  );
}
