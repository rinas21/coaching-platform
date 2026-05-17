import GsapReveal from "@/components/GsapReveal";
import GsapSplitText from "@/components/GsapSplitText";
import { fetchStrapi, getStrapiCollection, getStrapiMediaUrl } from "@/lib/strapi";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Video, Users, ArrowRight } from "lucide-react";

const btnPrimary =
  "bg-amber-brand text-white rounded-xl px-6 py-3 font-bold transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] inline-flex items-center gap-2";

/** Always fetch fresh events from Strapi (same pattern as /blog). Default fetch caching can freeze an empty build-time response. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

type EventTextChild = { text?: string };
type EventDescriptionBlock = {
  type?: string;
  children?: EventTextChild[];
};

type EventListItem = {
  documentId?: string;
  id?: string | number;
  title?: string;
  date_time?: string;
  description?: string | EventDescriptionBlock[];
  location?: string;
  type?: "Physical" | "Webinar" | "Zoom Meeting" | "Workshop";
  featured_image?: { url?: string };
};

type EventListJson = { data?: EventListItem[] };

function getEventDescription(description?: string | EventDescriptionBlock[]): string {
  if (!description) return "Join us for this transformative session. Experience healing and growth in a safe, guided space.";
  if (typeof description === "string") return description;

  if (Array.isArray(description)) {
    return description
      .map((block) => (block.children ?? []).map((c) => c.text ?? "").join(""))
      .join(" ");
  }

  return "Join us for this transformative session.";
}

export default async function EventsPage() {
  const result = await fetchStrapi<EventListJson>(
    "/events?publicationState=preview&populate[0]=featured_image&sort[0]=date_time:asc",
    { cache: "no-store", next: { revalidate: 0 } },
  );
  const events = result.ok ? getStrapiCollection<EventListItem>(result.data) : [];

  return (
    <main className="min-h-screen bg-cream-brand/30">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 blur-3xl opacity-20">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-brand rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-navy-brand rounded-full" />
        </div>

        <div className="mx-auto max-w-[1240px] px-6 text-center">
          <GsapReveal delay={0.1}>
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider uppercase bg-amber-brand/10 text-amber-brand rounded-full">
              Growth & Community
            </span>
            <GsapSplitText
              elementType="h1"
              className="text-5xl md:text-6xl font-playfair font-bold text-navy-brand mb-6"
              text="Events & Workshops"
            />
            <p className="mx-auto max-w-[700px] text-lg md:text-xl text-brown-brand/70 font-nunito leading-relaxed mb-10">
              Join our safe, supportive environment for healing circles, professional training, and community gatherings designed to nurture your mental well-being.
            </p>
          </GsapReveal>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="mx-auto max-w-[1240px]">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-amber-brand/10 shadow-sm">
              <Calendar size={48} className="text-amber-brand/30 mb-4" />
              <p className="text-xl text-brown-brand/60 font-semibold text-center">
                We&apos;re planning something special.<br />Stay tuned for upcoming events.
              </p>
            </div>
          ) : (
            <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event, index) => {
                const imageSrc = getStrapiMediaUrl(event.featured_image) || "/assets/placeholder-event.jpg";
                const id =
                  event.documentId != null && String(event.documentId).length > 0
                    ? String(event.documentId)
                    : event.id != null
                      ? String(event.id)
                      : "";
                const formattedDate = event.date_time
                  ? new Intl.DateTimeFormat('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(new Date(event.date_time))
                  : "To be announced";

                if (!id) return null;

                const displayDescription = getEventDescription(event.description);

                return (
                  <GsapReveal key={id} delay={0.2 + (index * 0.1)} direction="up">
                    <div className="group h-full flex flex-col bg-white rounded-[2rem] overflow-hidden border border-amber-brand/5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-2">
                      {/* Image Container */}
                      <div className="relative h-64 w-full overflow-hidden">
                        <Image
                          src={imageSrc}
                          alt={event.title || "Event"}
                          fill
                          className="object-contain transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-navy-brand text-xs font-bold rounded-full shadow-sm flex items-center gap-2">
                            {event.type === "Physical" ? <MapPin size={14} /> : <Video size={14} />}
                            {event.type || "Event"}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col flex-grow p-8">
                        <div className="flex items-center gap-2 text-amber-brand mb-3">
                          <Calendar size={16} />
                          <span className="text-sm font-bold uppercase tracking-wide">
                            {formattedDate}
                          </span>
                        </div>

                        <h3 className="text-2xl font-playfair font-bold text-navy-brand mb-4 group-hover:text-amber-brand transition-colors line-clamp-2">
                          <Link href={`/events/${id}`}>{event.title}</Link>
                        </h3>

                        <p className="text-brown-brand/70 font-nunito leading-relaxed mb-6 line-clamp-3">
                          {displayDescription}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-amber-brand/5">
                          <div className="flex items-center gap-2 text-sm text-brown-brand/50 font-semibold">
                            <Users size={16} />
                            <span>Limited Slots</span>
                          </div>
                          <Link
                            href={`/events/${id}`}
                            className="text-amber-brand font-bold inline-flex items-center gap-1 group/btn"
                          >
                            Explore <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </GsapReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter / CTA Section */}
      <section className="bg-navy-brand py-20 px-6">
        <div className="mx-auto max-w-[1240px] flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-white mb-6">
              Never miss an opportunity to connect.
            </h2>
            <p className="text-white/70 font-nunito text-lg mb-0">
              Subscribe to our newsletter to receive early bird invites and updates about our upcoming webinars and community gatherings.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link href="/contact" className={btnPrimary}>
              Get Notified
            </Link>
            <Link href="/about" className="px-8 py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-colors text-center">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

