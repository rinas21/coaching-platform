import GsapSplitText from "@/components/GsapSplitText";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import GsapReveal from "@/components/GsapReveal";
import PinnedServicePillars from "@/components/PinnedServicePillars";
import StorybookHero from "@/components/StorybookHero";
import ThemeScrollTracker from "@/components/ThemeScrollTracker";
import Bbr1 from "@/../public/assets/images/homepage_bbr-section_children-playing.png";
import Bbr2 from "@/../public/assets/images/homepage_bbr-section_tree-of-skills.png";
import Team from "@/../public/assets/images/team_avatar-placeholder.png";
import TestimonialSlider from "@/components/TestimonialSlider";
import { fetchStrapi, getStrapiCollection } from "@/lib/strapi";
import HomeHero from '@/../public/assets/images/homepage_storybook-atmosphere-section.png'

import LazyInstagramFeed from "@/components/LazyInstagramFeed";

export const revalidate = 60;

const FALLBACK_TESTIMONIALS = [
  {
    quote: "The Safe Space has completely changed how I approach my daily stress. The BBR programme for my daughter was exactly what she needed.",
    attribution: "Mother of a BBR participant, Colombo",
  },
  {
    quote: "Rooted in neuroscience but delivered with such heart. I've never felt more understood in a clinical setting.",
    attribution: "Adult Client",
  },
  {
    quote: "The workshops gave our team tools they went home and used that week. The shift in how we handle pressure together has been real.",
    attribution: "HR Lead, financial services firm, Colombo",
  },
];

export default async function Home() {


  const testimonialResult = await fetchStrapi<{ data?: { Name?: string; testimonials?: string }[] }>(
    "/testimonials?publicationState=preview&fields[0]=Name&fields[1]=testimonials&sort[0]=Date:desc&pagination[limit]=6",
    { next: { revalidate: 60 } }
  );

  const testimonialItems = testimonialResult.ok
    ? getStrapiCollection<{ Name?: string; testimonials?: string }>(testimonialResult.data)
    : [];

  const testimonials = testimonialItems.length > 0
    ? testimonialItems.map((item: { Name?: string; testimonials?: string }) => ({
      quote: item.testimonials || "",
      attribution: item.Name || "Anonymous",
    })).filter(t => t.quote)
    : FALLBACK_TESTIMONIALS;

  return (
    <main className="-mt-32 overflow-x-clip w-full relative font-body">
      {/* <HeroCarousel /> */}
      <StorybookHero />
      <ThemeScrollTracker sectionIds={["our-approach", "bbr-programme", "internship"]} />

      <section
        id="intro"
        className="section mx-auto max-w-[1240px] px-6 relative"
      >
        <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-24">
          <GsapReveal delay={0.3} className="w-full lg:w-1/2">
            <span className="text-amber-brand font-bold tracking-widest uppercase text-sm mb-6 block">
              Why we do this differently
            </span>
            <GsapSplitText
              text="Most struggles have a pattern beneath them. We help you find it and change it."
              elementType="h2"
              className="mb-8 text-4xl md:text-5xl font-playfair font-bold text-navy-brand leading-tight"
            />
            <div className="space-y-6 text-xl text-brown-brand/80 font-nunito leading-relaxed">
              <GsapSplitText
                text="We do not just treat symptoms. We work with the patterns beneath them."
                elementType="p"
                className="font-bold text-sm md:text-xl"
              />
              <p className="text-lg md:text-xl">
                At The Safe Space, we believe that lasting change happens when people feel safe enough to engage, supported enough to try, and equipped with the skills to respond differently. Our work spans the full arc of human development: from building resilience in young children, to supporting adults through complex trauma, to training the next generation of mental health practitioners.
              </p>
              <p className="text-lg md:text-xl">Whatever brings you here you are in the right place.</p>
            </div>
            <Link href="/about" className="btn-primary mt-6">
              Read our story
            </Link>
          </GsapReveal>

          <GsapReveal
            direction="left"
            delay={0.5}
            className="w-full lg:w-1/2 relative"
          >
            <div className="absolute -inset-4 bg-amber-brand/5 rounded-[4rem] blur-2xl -z-10" />
            <Image
              src={HomeHero}
              alt="Storybook atmosphere"
              className="object-cover rounded-[3rem] shadow-2xl border-8 border-white"
              width={700}
              height={800}
              sizes="(max-width: 1024px) 100vw, 700px"
            />
            <div className="absolute -bottom-8 -left-8 md:-left-4 bg-white p-8 rounded-[2rem] shadow-xl border border-amber-brand/10 max-w-[280px] hidden md:block">
              <p className="italic font-playfair text-navy-brand text-lg">
                &quot;We are here to build, to prevent, and to heal.&quot;
              </p>
              <p className="mt-4 text-sm font-bold text-amber-brand uppercase tracking-widest">
                The Safe Space Team
              </p>
            </div>
          </GsapReveal>
        </div>
      </section>

      {/* Service Pillars Section */}
      <section className="section bg-cream-brand/50">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-[700px]">
              <span className="text-amber-brand font-bold tracking-widest uppercase text-sm mb-4 block">
                What We Offer
              </span>
              <GsapSplitText
                text="Care that holds the whole person."
                elementType="h2"
                className="mb-6 text-4xl md:text-6xl font-playfair font-bold text-navy-brand"
              />
              <p className="text-lg md:text-xl text-brown-brand/70 font-nunito leading-relaxed">
                Whether you are a parent seeking support for your child, a school building a trauma aware culture, or an adult working through something long held there is a pathway here for you.
              </p>
            </div>
            <Link href="/services" className="btn-outline">
              Find the right service for you
            </Link>
          </div>

          <PinnedServicePillars />
        </div>
      </section>

      {/* Our Approach Section */}
      <section id="our-approach" className="section relative" style={{ background: 'url("assets/images/homepage_rooted-neuroscience-clinical-approach-section.png")', backgroundPosition: "center", backgroundSize: "cover", backgroundRepeat: "no-repeat" }}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="mx-auto max-w-[1240px] px-6 relative">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <GsapReveal direction="up">
              <div className="services-hero-badge mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/05 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
                Our Approach
              </div>
              <h2 className="text-2xl md:text-5xl font-playfair font-bold text-white mb-8">
                Rooted in neuroscience. Guided by compassion. Built for real life.
              </h2>
              <p className="text-sm md:text-xl text-white/70 font-nunito leading-relaxed mb-8">
                Every programme and session at TSSG is grounded in
                trauma informed principles, evidence-based practice, and a deep
                respect for the individual. We integrate cognitive, somatic, and
                creative approaches working with both the mind and the body to
                create change that lasts.
              </p>
            </GsapReveal>
          </div>
        </div>
      </section>

      {/* BBR Programme Section */}
      <section id="bbr-programme" className="section bg-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="bg-white rounded-[4rem] px-6 py-10 md:p-12 shadow-sm border border-amber-brand/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-brand/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <GsapReveal direction="up" className="relative z-10">
                <span className="text-amber-brand font-bold tracking-widest uppercase text-xs mb-6 block">
                  Sri Lanka&apos;s first programme of its kind
                </span>
                <GsapSplitText
                  text="Building Blocks of Resilience (BBR)"
                  elementType="h2"
                  className="text-2xl md:text-5xl font-playfair font-bold text-navy-brand mb-8"
                />
                <p className="text-sm md:text-xl text-brown-brand/70 font-nunito leading-relaxed mb-10">
                  Sri Lanka&apos;s first neuroscience-integrated social-emotional learning curriculum. Designed by Zahra Iram Masud, BBR helps children aged 5 to 12 recognise their emotions, regulate their responses, and build skills they carry into every classroom, friendship, and challenge ahead. Delivered through play, creativity, and structured learning.
                </p>
                <Link
                  href="/services#bbr"
                  className="btn-primary bg-sage-brand hover:bg-navy-brand hover:text-white"
                >
                  Explore BBR
                </Link>
              </GsapReveal>
              <GsapReveal direction="left" delay={0.2} className="hidden md:grid grid-cols-2 gap-4">
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-lg">
                  <Image
                    src={Bbr1}
                    alt="BBR 1"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
                  />
                </div>
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-lg mt-12">
                  <Image
                    src={Bbr2}
                    alt="BBR 2"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
                  />
                </div>
              </GsapReveal>
            </div>
          </div>
        </div>
      </section>

      <section id="internship" className="section bg-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <GsapReveal direction="up" className="relative z-10">
            <span className="text-amber-brand font-bold tracking-widest uppercase text-xs mb-6 block">
              Train With Us
            </span>
            <GsapSplitText
              text="The TSSG Internship Programme For psychology students and early career practitioners."
              elementType="h2"
              className="text-2xl md:text-5xl font-playfair font-bold text-navy-brand mb-8 max-w-4xl"
            />
            <p className="text-sm md:text-xl text-brown-brand/70 font-nunito leading-relaxed mb-10">
              Our internship is not a passive placement. It is a structured, supervised, and transformative training pathway open to Diploma,
              Bachelor&apos;s, and Master&apos;s level students designed to shape ethical, reflective, and practice-ready mental health practitioners.
            </p>
            <Link href="/internship" className="btn-primary mt-6">
              Explore the Internship
            </Link>
          </GsapReveal>
        </div>
      </section>

      {/* Meet Our Founder Section */}
      <section className="section">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <GsapReveal direction="left" className="w-full lg:w-1/3">
              <div className="relative aspect-[3/4] rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src={Team}
                  alt="Zahra Iram Masud"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
            </GsapReveal>
            <GsapReveal direction="right" className="w-full lg:w-2/3">
              <span className="text-amber-brand font-bold tracking-widest uppercase text-xs mb-6 block">
                Meet Our Founder
              </span>
              <h2 className="text-4xl md:text-6xl font-playfair font-bold text-navy-brand mb-8 leading-tight">
                Zahra Iram Masud
              </h2>
              <p className="text-lg md:text-2xl font-playfair italic text-brown-brand/80 leading-relaxed mb-10">
                &quot;This work did not begin with a model or a programme. It
                began with a pattern and the belief that when patterns change
                in one person, the impact extends far beyond them.&quot;
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/team" className="btn-primary">
                  Meet the Team
                </Link>
              </div>
            </GsapReveal>
          </div>
        </div>
      </section>

      <section className="section overflow-hidden">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="text-center">
            <span className="text-amber-brand font-bold tracking-widest uppercase text-sm mb-8 block">
              Voices of Healing
            </span>
            <GsapSplitText
              text="In their own words."
              elementType="h2"
              className="mb-6 text-4xl md:text-7xl font-playfair font-bold text-navy-brand"
            />
          </div>
          {testimonials.length > 0 ? (
            <TestimonialSlider testimonials={testimonials} />
          ) : (
            <GsapReveal delay={0.15}>
              <div className="mx-auto max-w-2xl rounded-[2.5rem] border border-amber-brand/10 bg-white/70 px-10 py-14 text-center backdrop-blur-sm">
                <p className="text-lg text-brown-brand/80 font-nunito leading-relaxed">
                  Client stories will appear here once they are published. Until
                  then, you can read more about our approach or reach out with
                  questions.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/testimonials" className="btn-outline">
                    Client Stories
                  </Link>
                  <Link href="/contact" className="btn-primary">
                    Ask Us a Question
                  </Link>
                </div>
              </div>
            </GsapReveal>
          )}
        </div>
      </section>

      <LazyInstagramFeed />

      {/* Community + CTA strip */}
      <section className="section relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-amber-brand/5 -z-10 rounded-l-[10rem] hidden lg:block" />

        <div className="mx-auto max-w-[1240px] px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-amber-brand font-bold tracking-widest uppercase text-sm mb-6 block">
                Building Resilience
              </span>
              <GsapSplitText
                text="Growing with the communities we serve."
                elementType="h2"
                className="mb-8 text-4xl md:text-5xl font-playfair font-bold text-navy-brand"
              />
              <p className="mb-10 text-xl text-brown-brand/80 font-nunito leading-relaxed">
                We exist for, and because of, the people we serve extending
                evidence-based care, training, and community initiatives that
                strengthen resilience at every life stage.
              </p>
              <Link
                href="/about"
                className="font-bold text-amber-brand flex items-center gap-3 text-lg group"
              >
                Our story{" "}
                <MoveRight
                  size={20}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </Link>
            </div>

            <GsapReveal
              direction="left"
              delay={0.3}
              className="bg-navy-brand p-12 md:p-16 rounded-[4rem] text-cream-brand relative overflow-hidden shadow-2xl"
            >
              <div className="relative z-10">
                <h3 className="mb-6 text-3xl md:text-4xl font-playfair font-bold text-white">
                  Ready when you are.
                </h3>
                <p className="mb-12 text-lg text-cream-brand/70 font-nunito max-w-md">
                  Whether you are exploring options, ready to book, or not sure where to start we will help you find the right path.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/booking" className="btn-primary">
                    Book a Session
                  </Link>
                  <Link
                    href="/contact"
                    className="btn-outline !text-cream-brand !border-cream-brand hover:!bg-cream-brand hover:!text-navy-brand"
                  >
                    Ask Us a Question
                  </Link>
                </div>
              </div>

              {/* Decorative elements inside CTA */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-brand/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-orange-brand/10 rounded-full blur-3xl" />
            </GsapReveal>
          </div>
        </div>
      </section>
    </main>
  );
}
