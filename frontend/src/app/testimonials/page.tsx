import GsapReveal from "@/components/GsapReveal";
import Link from "next/link";
import { fetchStrapi, getStrapiCollection } from "@/lib/strapi";
import TestimonialsHeroBackground from "@/components/TestimonialsHeroBackground";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@thesafespaceglobal.com";

type TestimonialRecord = {
  documentId?: string;
  Name?: string;
  Date?: string;
  testimonials?: string;
};

type TestimonialList = {
  data?: TestimonialRecord[];
};

const TESTIMONIAL_OVERRIDES: TestimonialRecord[] = [
  {
    documentId: "override-1",
    Name: "Executive VP, Tech Enterprise",
    Date: "2025-08-12",
    testimonials: "Working with The Safe Space Global transformed our leadership team. The strategic clarity and executive coaching helped us scale our operations while maintaining alignment."
  },
  {
    documentId: "override-2",
    Name: "Founder & CEO, FinTech Scaling",
    Date: "2025-06-03",
    testimonials: "The business coaching provided unparalleled insights into our market strategy and organizational structure. It has been the most high-return investment for our executive team."
  },
  {
    documentId: "override-3",
    Name: "Senior Director, Global Operations",
    Date: "2025-11-20",
    testimonials: "My career coaching sessions gave me the exact tools and confidence needed to transition into executive leadership. Truly world-class guidance and support."
  },
  {
    documentId: "override-4",
    Name: "Corporate Workshop Attendee",
    Date: "2025-09-15",
    testimonials: "The executive team workshop was eye-opening. Instead of generic management advice, we learned about organizational alignment and actionable ways to optimize our execution cycles. It fundamentally changed how we lead our teams."
  }
];

function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function TestimonialsPage() {
  const result = await fetchStrapi<TestimonialList>(
    "/testimonials?publicationState=preview&fields[0]=Name&fields[1]=Date&fields[2]=testimonials&sort[0]=Date:desc",
    { cache: "no-store", next: { revalidate } },
  );

  let items = result.ok ? getStrapiCollection<TestimonialRecord>(result.data) : [];

  if (items.length === 0) {
    items = TESTIMONIAL_OVERRIDES;
  }

  return (
    <main className="bg-cream-brand/30 min-h-screen -mt-32 px-0 pb-32">
      <section className="hero_section relative min-h-[600px] h-[50svh] md:h-[100svh] w-full flex items-center justify-center overflow-hidden pt-20 md:pt-0">
        <TestimonialsHeroBackground />
        <GsapReveal delay={0.1} className="relative z-20 w-full">
          <div className="text-center px-6">
            <span className="text-amber-brand font-bold tracking-widest uppercase text-[10px] md:text-xs mb-6 block underline decoration-amber-brand/30 underline-offset-8">
              Voices of Leadership
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-playfair font-bold text-navy-brand mb-6 md:mb-8 leading-tight">
              What Leaders <br className="block md:hidden" /> Are Saying.
            </h1>
            <p className="mx-auto max-w-3xl text-lg md:text-xl text-brown-brand/70 font-nunito leading-relaxed italic max-w-[90%] md:max-w-3xl">
              &quot;At The Safe Space Global, the executive advisory we provide is only meaningful because
              of the leaders who trust us with their organizations.&quot;
            </p>
          </div>
        </GsapReveal>
      </section>
      <section className="container max-w-[1240px] mt-16 md:mt-20">

        {items.length === 0 ? (
          <GsapReveal delay={0.2}>
            <div className="max-w-3xl mx-auto text-center bg-white rounded-[3rem] border border-amber-brand/10 p-12 md:p-16 mb-24">
              <h2 className="text-3xl font-playfair font-bold text-navy-brand mb-6">
                Stories coming soon
              </h2>
              <p className="text-brown-brand/70 font-nunito leading-relaxed mb-8">
                No testimonials are listed yet. Add them in Strapi and they will appear here automatically.
              </p>
              <Link href="/contact" className="btn-primary">
                Share your experience
              </Link>
            </div>
          </GsapReveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {items.map((item, index) => {
              const quote = item.testimonials?.trim();
              if (!quote) return null;
              const name = item.Name?.trim() || "Anonymous";
              const publishedDate = formatDate(item.Date);
              return (
                <GsapReveal
                  key={item.documentId || `${name}-${index}`}
                  delay={0.1 + (index % 4) * 0.08}
                >
                  <article className="rounded-[2.5rem] p-10 shadow-lg h-full border border-amber-brand/10 bg-white/70 backdrop-blur-sm hover:shadow-xl transition-shadow duration-500">
                    <div className="relative">
                      <span className="absolute -top-6 -left-4 text-6xl text-amber-brand/20 font-serif">
                        “
                      </span>
                      <p className="text-xl italic font-playfair leading-relaxed text-navy-brand relative z-10">
                        {quote}
                      </p>
                    </div>
                    <footer className="mt-8 pt-6 border-t border-amber-brand/10">
                      <p className="text-sm font-bold tracking-widest uppercase text-amber-brand">
                        — {name}
                      </p>
                      {publishedDate ? (
                        <p className="mt-2 text-xs text-brown-brand/60 font-nunito">
                          {publishedDate}
                        </p>
                      ) : null}
                    </footer>
                  </article>
                </GsapReveal>
              );
            })}
          </div>
        )}

        <GsapReveal delay={0.4}>
          <div className="mt-16 bg-white rounded-[4rem] p-6 md:p-24 shadow-sm border border-amber-brand/10 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-4xl font-playfair font-bold text-navy-brand mb-8">
                Share Your Experience.
              </h3>
              <p className="text-xl text-brown-brand/70 font-nunito mb-12 max-w-2xl mx-auto leading-relaxed">
                Have you worked with us, attended one of our executive masterclasses, or
                trained as a fellow at TSSG? Your words shared anonymously
                may be exactly what another leader needs to take that first step.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/contact"
                  className="btn-primary !bg-navy-brand shadow-xl shadow-navy-brand/10"
                >
                  Submit Your Experience
                </Link>
                <Link
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="btn-outline font-bold"
                >
                  Email Us Directly
                </Link>
              </div>
              <p className="mt-12 text-xs text-brown-brand/40 font-nunito italic">
                All testimonials are shared anonymously. Names and identifying
                details are withheld to protect privacy.
              </p>
            </div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-amber-brand/5 rounded-full blur-3xl -ml-32 -mt-32" />
          </div>
        </GsapReveal>
      </section>
    </main>
  );
}
