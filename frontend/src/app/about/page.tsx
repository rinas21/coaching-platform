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
            Beyond basic management. Beyond ordinary growth.
          </span>
          <GsapSplitText
            text="The leadership strategies that change how you operate and lead."
            elementType="h1"
            className="relative z-10 text-4xl max-w-4xl md:text-7xl font-playfair font-bold text-white mb-8 leading-tight mx-auto"
          />

          <p className="relative z-10 mt-10 mx-auto max-w-3xl text-lg sm:text-xl text-white font-nunito leading-relaxed">
            Most leaders who find us are not looking for generic advice. They are looking for strategic breakthroughs.
          </p>
          <p className="relative mt-10 z-10 mx-auto max-w-3xl text-lg sm:text-xl text-white font-nunito leading-relaxed">
            Apex Executive Advisory is a premier executive and business coaching firm based in Sri Lanka, working with leaders, entrepreneurs, and organizations across the world.
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
              text="Every business challenge has a strategic solution beneath it."
              elementType="h2"
              className="text-4xl font-playfair font-bold text-navy-brand mb-8 leading-tight"
            />
            <div className="space-y-6 text-lg text-brown-brand/70 font-nunito leading-relaxed">
              <p>
                Our story begins with a recognition that the same growth bottlenecks appear across leaders, teams, and enterprises: difficulties with
                organizational alignment, strategic communication, execution scaling, and leadership presence. Over time, it became clear these were not isolated challenges. They were
                patterns. Often systemic. Often invisible. Always shapeable.
              </p>
              <p>
                At Apex Executive Advisory, we do not just support leaders in the present. We help them recognize, understand, and optimize the strategic patterns that influence how they
                lead their teams and scale their enterprises. When those patterns begin to change, the impact extends beyond the
                individual into teams, entire organizations, and future industry leadership.
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
              We provide high-impact coaching across the full spectrum of professional and organizational growth, including:
            </p>

            <div className="flex justify-center gap-6 mb-12 text-navy-brand/20">
              <span className="text-xs">●</span>
              <span className="text-xs">●</span>
              <span className="text-xs">●</span>
            </div>

            <ul className="space-y-6 mb-16 max-w-md mx-auto lg:mx-0">
              {[
                "C-suite executive leadership",
                "Business scaling & strategy",
                "High-performance team alignment",
                "Executive career advancement",
                "Workplace productivity & stress mastery",
                "Organizational culture transformation"
              ].map((item) => (
                <li key={item} className="flex gap-4 items-start text-[11px] md:text-xs font-bold text-navy-brand/80 uppercase tracking-widest leading-relaxed">
                  <span className="text-amber-brand mt-1.5 text-[8px] md:text-[10px]">●</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <hr className="border-navy-brand/10 mb-8" />
            <p className="text-lg md:text-xl text-navy-brand/80 font-playfair italic leading-relaxed">
              All work is grounded in strategic clarity, operational alignment, and leadership capacity building—paced, structured, and aligned with your enterprise goals.
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
              Strategic Approach
            </h3>
            <hr className="border-white/10 mb-8" />
            <p className="text-lg md:text-xl text-white/80 font-playfair italic mb-12 leading-relaxed">
              Our work integrates evidence-based business frameworks, advanced leadership methodologies, and high-performance mindset coaching:
            </p>

            <ul className="space-y-6 mb-16 max-w-md mx-auto lg:mx-0">
              {[
                "Strategic Execution Frameworks helping you align vision with measurable results",
                "Executive Presence Mastery working with your communication and leadership impact",
                "Organizational Alignment processing operational bottlenecks at the source",
                "High-Performance Mindset understanding how decision-making patterns shape your success"
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
                <span><strong className="font-semibold text-white">Strategic decision-making</strong> business models, market positioning, competitive advantage</span>
              </li>
              <li className="flex gap-4 items-start text-sm text-white/70 font-nunito leading-relaxed">
                <span className="text-amber-brand mt-1.5 text-[10px]">●</span>
                <span><strong className="font-semibold text-white">Leadership communication</strong> executive presence, stakeholder management, boardroom influence</span>
              </li>
              <li className="flex gap-4 items-start text-sm text-white/70 font-nunito leading-relaxed">
                <span className="text-amber-brand mt-1.5 text-[10px]">●</span>
                <span><strong className="font-semibold text-white">Operational execution</strong> scaling processes, team alignment, accountability frameworks</span>
              </li>
            </ul>
            <p className="text-lg md:text-xl text-white/80 font-playfair italic leading-relaxed mt-10">This integrated approach allows us to work not only with immediate business challenges, but with the systemic organizational patterns that drive long-term enterprise success.</p>
          </GsapReveal>
        </div>

        {/* Founder's Note */}
        <GsapReveal delay={0.2}>
          <div className="max-w-4xl mx-auto mb-40">
            <div className="relative bg-white p-12 md:p-20 rounded-[3rem] shadow-xl border border-amber-brand/10 bg-[url('https://www.transparenttextures.com/patterns/old-mathematics.png')] bg-opacity-5">
              <span className="text-amber-brand font-bold text-[10px] uppercase tracking-[0.2em] mb-12 block text-center">
                A Note from Sophia
              </span>
              <div className="space-y-8 text-xl md:text-2xl font-playfair text-navy-brand leading-relaxed italic text-center">
                <p>
                  &quot;The work at Apex Executive Advisory did not begin with generic theories. It began with a commitment to strategic excellence.&quot;
                </p>
                <p>
                  &quot;Across leaders, teams, and enterprises, the same growth bottlenecks appeared: difficulties with organizational alignment, strategic communication, and execution scaling.&quot;
                </p>
                <p>
                  &quot;Meaningful business growth occurs when leaders gain strategic clarity, align their executive teams, and commit to bold execution. Our role is to create those conditions.&quot;
                </p>
              </div>
              <div className="mt-16 flex flex-col items-center">
                <div className="w-20 h-[1px] bg-amber-brand/30 mb-6" />
                <p className="font-playfair font-bold text-navy-brand text-lg">
                  Zahra Iram Masud
                </p>
                <p className="text-[10px] font-bold text-amber-brand uppercase tracking-widest mt-1">
                  Founder & Master Executive Coach
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
                Talent & Career Development
              </span>
              <h3 className="text-4xl md:text-5xl font-playfair font-bold text-navy-brand mb-8 text-center">
                Emerging Leaders & Professional Development
              </h3>
              <p className="text-lg md:text-xl text-brown-brand/80 font-playfair italic leading-relaxed mb-12 text-center">
                For ambitious professionals and emerging leaders, our approach is structured, career-focused, and highly actionable. Clients are supported through:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {[
                  "Targeted leadership skill acquisition",
                  "Career trajectory mapping and promotion strategy",
                  "Advanced communication and executive presence training",
                  "Strategic decision-making frameworks embedded in daily workflow"
                ].map((item) => (
                  <div key={item} className="bg-white p-6 rounded-2xl shadow-sm border border-amber-brand/10 flex gap-4 items-start hover:shadow-md transition-shadow">
                    <span className="text-amber-brand mt-1.5 text-[10px]">●</span>
                    <span className="text-navy-brand/80 font-nunito font-semibold leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-6 text-lg text-brown-brand/80 font-nunito leading-relaxed p-8 md:p-10 bg-white/60 backdrop-blur-sm rounded-3xl border border-amber-brand/10 text-center">
                <p>
                  These methods allow emerging leaders to accelerate their professional growth while actively building skills in strategic execution, team leadership, and cognitive flexibility.
                </p>
                <hr className="border-amber-brand/10 w-24 mx-auto" />
                <p>
                  <strong className="text-navy-brand">All coaching programs are strategically guided and intentionally designed.</strong> Every session is used as a springboard for measurable professional advancement.
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
              Progress that stays in the coaching session is not enough. Our work is
              designed to generate measurable ROI across boardroom discussions, executive decisions, team leadership, and enterprise scaling.
            </p>
            <div className="p-8 bg-sage-brand/5 rounded-3xl border border-sage-brand/10">
              <h4 className="text-xs font-bold text-sage-brand uppercase tracking-widest mb-4">
                Our Vision
              </h4>
              <p className="text-sm text-brown-brand/70 font-nunito leading-relaxed mb-4">
                To contribute to a model of professional leadership and business growth that is:
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Strategic as well as actionable",
                  "Results-based and growth-oriented",
                  "Premium, structured, and scalable"
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start text-sm text-brown-brand/70 font-nunito leading-relaxed">
                    <span className="text-sage-brand mt-1.5 text-[10px]">●</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-brown-brand/70 font-nunito leading-relaxed pt-6 border-t border-sage-brand/10">
                Our vision is to close the gap between business strategy and daily execution: offering executive coaching, business advisory, and elite professional training, all under one roof.
              </p>
            </div>
          </GsapReveal>
        </div>

        <div className="text-center pt-24 border-t border-amber-brand/10">
          <h3 className="text-3xl font-playfair font-bold text-navy-brand mb-6">
            Ready to take the next step?
          </h3>
          <p className="text-lg text-brown-brand/70 font-nunito leading-relaxed mb-10 max-w-2xl mx-auto">
            Whether you are looking for executive coaching for yourself, strategic alignment for your team, or growth advisory for your business, we are here to help you find the right pathway.
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
