import CalendlyInlineEmbed from "@/components/CalendlyInlineEmbed";
import GsapReveal from "@/components/GsapReveal";

const DEFAULT_CALENDLY_URL =
  "https://calendly.com/mohomadrinas00/30min?hide_event_type_details=1&hide_gdpr_banner=1";

export default function BookingPage() {
  const calendlyUrl =
    process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() || DEFAULT_CALENDLY_URL;

  return (
    <main className="bg-cream-brand/30 min-h-screen pt-40 px-6">
      <section className="container max-w-[1240px]">
        <GsapReveal delay={0.1}>
          <div className="text-center mb-16">
            <span className="text-amber-brand font-bold tracking-widest uppercase text-xs mb-4 block">Reservations</span>
            <h1 className="text-5xl md:text-6xl font-playfair font-bold text-navy-brand mb-6 leading-tight">
              Finding Time to Heal.
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-brown-brand/60 font-nunito leading-relaxed">
              Choose a moment for yourself. Our calendar below is always open for those seeking a safe space to talk.
            </p>
          </div>
        </GsapReveal>

        <GsapReveal delay={0.3} direction="up">
          <div className="max-w-4xl mx-auto bg-white rounded-[4rem] shadow-xl shadow-navy-brand/5 border border-amber-brand/10 overflow-hidden mb-32">
            <div className="p-10 md:p-12 border-b border-amber-brand/5 bg-navy-brand text-cream-brand relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-2xl font-playfair font-bold mb-2">Schedule a Consultation</h3>
                 <p className="text-cream-brand/60 font-nunito italic">Please select your timezone and preferred slot below.</p>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-brand/10 rounded-full blur-3xl -mr-16 -mt-16" />
            </div>
            
            <div className="min-h-[700px] w-full bg-white px-4 py-4">
              <CalendlyInlineEmbed url={calendlyUrl} />
            </div>
            
            <div className="p-8 bg-cream-brand/20 text-center border-t border-amber-brand/5">
               <p className="text-xs text-brown-brand/40 font-bold uppercase tracking-[0.2em]">Our team will confirm your appointment via email.</p>
            </div>
          </div>
        </GsapReveal>
      </section>
    </main>
  );
}
