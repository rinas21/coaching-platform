import GsapReveal from "@/components/GsapReveal";
import GsapSplitText from "@/components/GsapSplitText";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="-mt-32 bg-cream-brand/30 min-h-screen pb-32 relative">
      <div className="text-center mb-24 relative py-48 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('/assets/images/about-page_hero-header.png')] bg-cover bg-center bg-no-repeat">
          <div className="bg-black/50 absolute inset-0 pointer-events-none" />
        </div>
        <div className="px-6">
          <span className="relative z-10 text-amber-brand tracking-widest lowercase text-xs mb-6 block underline decoration-amber-brand/30 underline-offset-8">
            Beyond behaviour. Beyond coping.
          </span>
          <GsapSplitText
            text="The skills that change how you move through the world."
            elementType="h1"
            className="relative z-10 text-4xl max-w-4xl md:text-7xl font-playfair font-bold text-white mb-8 leading-tight mx-auto"
          />

          <p className="relative z-10 mt-10 mx-auto max-w-3xl text-lg sm:text-xl text-white font-nunito leading-relaxed">
            Most people who find us are not looking for a label or a diagnosis. They are looking for a way through.
          </p>
          <p className="relative mt-10 z-10 mx-auto max-w-3xl text-lg sm:text-xl text-white font-nunito leading-relaxed">
            The Safe Space is a trauma informed psychology practice based in Sri Lanka, working with individuals, families, and schools across the world.
          </p>
        </div>
      </div>
      <section className="container max-w-[1240px] px-6">
        {/* Who We Are */}
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-40">
          <GsapReveal direction="left">
            <span className="text-xs font-bold text-amber-brand uppercase tracking-widest mb-6 block">
              Who We Are
            </span>
            <GsapSplitText
              text="Every struggle has a pattern beneath it."
              elementType="h2"
              className="text-4xl font-playfair font-bold text-navy-brand mb-8 leading-tight"
            />
            <div className="space-y-6 text-lg text-brown-brand/70 font-nunito leading-relaxed">
              <p>
                Our story begins with a recognition that the same struggles appear across individuals, families, and environments diﬃculties with
                regulation, communication, confidence, and connection. Over time, it became clear these were not isolated challenges. They were
                patterns. Often intergenerational. Often invisible. Always shapeable.
              </p>
              <p>
                At The Safe Space, we do not just support people in the present. We help them recognise, understand, and shift the patterns that influence how they
                respond to themselves, others, and the world around them. When those patterns begin to change, the impact extends beyond the
                individual into relationships, environments, and future generations.
              </p>
            </div>
          </GsapReveal>
          <GsapReveal direction="right" delay={0.2}>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/assets/images/impact.png"
                alt="Our vision"
                fill
                className="w-full h-auto"
              />
            </div>
          </GsapReveal>
        </div>

        {/* Clinical Scope & Approach */}
        <div className="flex flex-col lg:flex-row mb-40 rounded-[2rem] overflow-hidden shadow-2xl">
          <GsapReveal
            direction="left"
            delay={0.2}
            className="flex-1 p-12 md:p-16 lg:p-20 relative bg-[#FDFBF7]"
          >
            <span className="text-amber-brand font-bold text-xs uppercase tracking-[0.2em] mb-4 block">
              Chapter I
            </span>
            <h3 className="text-4xl md:text-5xl font-playfair text-navy-brand mb-8">
              Who we work with
            </h3>
            <hr className="border-navy-brand/10 mb-8" />
            <p className="text-lg md:text-xl text-navy-brand/80 font-playfair italic mb-12 leading-relaxed">
              We provide psychological support across the full spectrum of mental health presentations, including:
            </p>

            <div className="flex justify-center gap-6 mb-12 text-navy-brand/20">
              <span className="text-xs">●</span>
              <span className="text-xs">●</span>
              <span className="text-xs">●</span>
            </div>

            <ul className="space-y-6 mb-16 max-w-md mx-auto lg:mx-0">
              {[
                "Anxiety and mood difficulties",
                "Complex trauma and PTSD",
                "Emotional dysregulation",
                "Relationship and communication difficulties",
                "Burnout and occupational stress",
                "Child and adolescent development"
              ].map((item) => (
                <li key={item} className="flex gap-4 items-start text-[11px] md:text-xs font-bold text-navy-brand/80 uppercase tracking-widest leading-relaxed">
                  <span className="text-amber-brand mt-1.5 text-[8px] md:text-[10px]">●</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <hr className="border-navy-brand/10 mb-8" />
            <p className="text-lg md:text-xl text-navy-brand/80 font-playfair italic leading-relaxed">
              All work is grounded in stabilisation, regulation, and capacity building paced, structured, and aligned with each individual&apos;s level of readiness.
            </p>
          </GsapReveal>

          <GsapReveal
            direction="right"
            delay={0.3}
            className="flex-1 p-12 md:p-16 lg:p-20 bg-navy-brand relative"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-amber-brand font-bold text-xs uppercase tracking-[0.2em] block">
                Chapter II
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-playfair text-white mb-8 italic">
              Clinical Approach
            </h3>
            <hr className="border-white/10 mb-8" />
            <p className="text-lg md:text-xl text-white/80 font-playfair italic mb-12 leading-relaxed">
              Our work integrates evidence based, neuroscience-informed, and somatic approaches:
            </p>

            <ul className="space-y-6 mb-16 max-w-md mx-auto lg:mx-0">
              {[
                "Cognitive Behavioural Therapy helping you recognise and shift thought patterns that keep you stuck",
                "Working with your body's stress responses, not just your thoughts",
                "Processing difficult experiences at the source, not just managing the symptoms",
                "Understanding how early relationships shape how you connect today"
              ].map((item) => (
                <li key={item} className="flex gap-4 items-start text-[11px] md:text-xs font-bold text-white uppercase tracking-widest leading-relaxed">
                  <span className="text-amber-brand mt-1.5 text-[8px] md:text-[10px]">●</span>
                  <span className="capitalize">{item}</span>
                </li>
              ))}
            </ul>

            <span className="text-amber-brand font-bold text-xs uppercase tracking-[0.2em] mb-8 block">
              We Work With
            </span>

            <ul className="space-y-6">
              <li className="flex gap-4 items-start text-sm text-white/70 font-nunito leading-relaxed">
                <span className="text-amber-brand mt-1.5 text-[10px]">●</span>
                <span><strong className="font-semibold text-white">Physiological regulation</strong> nervous system states, sensory processing, interoceptive awareness</span>
              </li>
              <li className="flex gap-4 items-start text-sm text-white/70 font-nunito leading-relaxed">
                <span className="text-amber-brand mt-1.5 text-[10px]">●</span>
                <span><strong className="font-semibold text-white">Cognitive and behavioural skills</strong> attention, planning, emotional awareness, decision-making</span>
              </li>
              <li className="flex gap-4 items-start text-sm text-white/70 font-nunito leading-relaxed">
                <span className="text-amber-brand mt-1.5 text-[10px]">●</span>
                <span><strong className="font-semibold text-white">Experiential and somatic processing</strong> body based cues, movement, grounding, and felt experience</span>
              </li>
            </ul>
            <p className="text-lg md:text-xl text-white/80 font-playfair italic leading-relaxed mt-10">This integrated approach allows us to work not only with thoughts and behaviours, but with the body-based patterns that so often
              underlie them particularly in trauma related and complex presentations.</p>
          </GsapReveal>
        </div>

        {/* Founder's Note */}
        <GsapReveal delay={0.2}>
          <div className="max-w-4xl mx-auto mb-40">
            <div className="relative bg-white p-12 md:p-20 rounded-[3rem] shadow-xl border border-amber-brand/10 bg-[url('https://www.transparenttextures.com/patterns/old-mathematics.png')] bg-opacity-5">
              <span className="text-amber-brand font-bold text-[10px] uppercase tracking-[0.2em] mb-12 block text-center">
                A Note from Zahra
              </span>
              <div className="space-y-8 text-xl md:text-2xl font-playfair text-navy-brand leading-relaxed italic text-center">
                <p>
                  &quot;The work at The Safe Space did not begin with a model or
                  a programme. It began with a pattern.&quot;
                </p>
                <p>
                  &quot;Across individuals, families, and environments, the same
                  struggles appeared: difficulties with regulation,
                  communication, and connection. This shaped everything.&quot;
                </p>
                <p>
                  &quot;Meaningful change occurs when individuals feel safe
                  enough to engage, supported enough to try, and equipped with
                  the skills to respond differently. Our role is to create those
                  conditions.&quot;
                </p>
              </div>
              <div className="mt-16 flex flex-col items-center">
                <div className="w-20 h-[1px] bg-amber-brand/30 mb-6" />
                <p className="font-playfair font-bold text-navy-brand text-lg">
                  Zahra Iram Masud
                </p>
                <p className="text-[10px] font-bold text-amber-brand uppercase tracking-widest mt-1">
                  Founder & Clinical Lead
                </p>
              </div>
            </div>
          </div>
        </GsapReveal>

        {/* Developmental & Child-Focused Work */}
        <GsapReveal delay={0.2} className="mb-40">
          <div className="bg-[#FDFBF7] p-12 md:p-16 lg:p-20 rounded-[3rem] shadow-xl border border-amber-brand/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-brand/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="max-w-4xl mx-auto relative z-10">
              <span className="text-amber-brand font-bold text-xs uppercase tracking-[0.2em] mb-4 block text-center">
                Child & Adolescent Care
              </span>
              <h3 className="text-4xl md:text-5xl font-playfair font-bold text-navy-brand mb-8 text-center">
                Developmental & Child Focused Work
              </h3>
              <p className="text-lg md:text-xl text-brown-brand/80 font-playfair italic leading-relaxed mb-12 text-center">
                For children and adolescents, our approach is developmentally adapted and play-informed. Younger clients are supported through:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {[
                  "Play based and activity based interventions",
                  "Creative modalities art, storytelling, role play",
                  "Guided interaction and real time coaching",
                  "Executive functioning tasks embedded within play"
                ].map((item) => (
                  <div key={item} className="bg-white p-6 rounded-2xl shadow-sm border border-amber-brand/10 flex gap-4 items-start hover:shadow-md transition-shadow">
                    <span className="text-amber-brand mt-1.5 text-[10px]">●</span>
                    <span className="text-navy-brand/80 font-nunito font-semibold leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-6 text-lg text-brown-brand/80 font-nunito leading-relaxed p-8 md:p-10 bg-white/60 backdrop-blur-sm rounded-3xl border border-amber-brand/10 text-center">
                <p>
                  These methods allow children to safely express internal experiences while actively building skills in emotional regulation, communication, attention, and cognitive flexibility.
                </p>
                <hr className="border-amber-brand/10 w-24 mx-auto" />
                <p>
                  <strong className="text-navy-brand">All interventions are clinically guided and intentionally designed.</strong> Play is used as a medium for targeted skill development never unstructured activity.
                </p>
              </div>
            </div>
          </div>
        </GsapReveal>

        {/* Vision & Application */}
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-20">
          <GsapReveal direction="left" duration={0.5}>
            <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl skew-y-1">
              <Image
                src="/assets/images/vision.png"
                alt="Impact"
                fill
                className="w-full h-auto"
              />
            </div>
          </GsapReveal>
          <GsapReveal direction="right">
            <h3 className="text-3xl font-playfair font-bold text-navy-brand mb-8">
              Real World Application
            </h3>
            <p className="text-lg text-brown-brand/70 font-nunito leading-relaxed mb-10">
              Progress that stays in the therapy room is not enough. Our work is
              designed to generalise across home environments, school settings,
              peer interactions, and workplace functioning.
            </p>
            <div className="p-8 bg-sage-brand/5 rounded-3xl border border-sage-brand/10">
              <h4 className="text-xs font-bold text-sage-brand uppercase tracking-widest mb-4">
                Our Vision
              </h4>
              <p className="text-sm text-brown-brand/70 font-nunito leading-relaxed mb-4">
                To contribute to a model of mental health and development that is:
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Preventative as well as responsive",
                  "Skills-based and function-oriented",
                  "Accessible, structured, and scalable"
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start text-sm text-brown-brand/70 font-nunito leading-relaxed">
                    <span className="text-sage-brand mt-1.5 text-[10px]">●</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-brown-brand/70 font-nunito leading-relaxed pt-6 border-t border-sage-brand/10">
                Our vision is to close the gap between psychological knowledge and real life: offering clinical therapy, creative therapies, and evidence-led professional training, all under one roof.
              </p>
            </div>
          </GsapReveal>
        </div>

        <div className="text-center pt-24 border-t border-amber-brand/10">
          <h3 className="text-3xl font-playfair font-bold text-navy-brand mb-6">
            Ready to take the next step?
          </h3>
          <p className="text-lg text-brown-brand/70 font-nunito leading-relaxed mb-10 max-w-2xl mx-auto">
            Whether you are looking for support for yourself, your child, or your school we are here to help you find the right pathway.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/booking" className="btn-primary">
              Book a Consultation
            </Link>
            <Link href="/team" className="btn-outline">
              Meet Our Team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
