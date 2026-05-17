import {
  fetchStrapi,
  getStrapiCollection,
  getStrapiMediaUrl,
  getStrapiSingle,
} from "@/lib/strapi";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Video, ArrowLeft, Share2, Users, Bookmark } from "lucide-react";
import GsapReveal from "@/components/GsapReveal";

const btnPrimary =
  "bg-amber-brand text-white rounded-2xl px-8 py-4 font-bold transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] inline-flex items-center justify-center gap-2 w-full sm:w-auto";

/** Same as /events — avoid caching stale empty Strapi responses */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const strapiEventsFetchInit = { cache: "no-store" as const, next: { revalidate: 0 } };

type EventTextChild = { text?: string };
type EventDescriptionBlock = {
  type?: string;
  children?: EventTextChild[];
};

type EventRecord = {
  documentId?: string;
  id?: string | number;
  title?: string;
  date_time?: string;
  location?: string;
  type?: string;
  featured_image?: { url?: string };
  description?: EventDescriptionBlock[];
  registration_link?: string;
};

type EventListJson = { data?: EventRecord[] };

function blockText(block: EventDescriptionBlock): string {
  return (block.children ?? []).map((c) => c.text ?? "").join("");
}

export async function generateStaticParams() {
  const result = await fetchStrapi<EventListJson>(
    "/events?publicationState=preview&fields[0]=documentId&fields[1]=id",
    strapiEventsFetchInit,
  );
  if (!result.ok) return [];
  const events = getStrapiCollection<EventRecord>(result.data);
  return events.flatMap((event) => {
    const ids: string[] = [];
    if (event.documentId) ids.push(String(event.documentId));
    if (event.id != null && String(event.id).length > 0) ids.push(String(event.id));
    return [...new Set(ids)].map((id) => ({ id }));
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const routeId = resolvedParams.id;

  const byDoc = await fetchStrapi<EventListJson>(
    `/events?publicationState=preview&filters[documentId][$eq]=${encodeURIComponent(routeId)}&populate[0]=featured_image`,
    strapiEventsFetchInit,
  );
  let event = byDoc.ok ? getStrapiSingle<EventRecord>(byDoc.data) : null;

  if (!event && /^\d+$/.test(routeId)) {
    const byPk = await fetchStrapi<EventListJson>(
      `/events?publicationState=preview&filters[id][$eq]=${encodeURIComponent(routeId)}&populate[0]=featured_image`,
      strapiEventsFetchInit,
    );
    event = byPk.ok ? getStrapiSingle<EventRecord>(byPk.data) : null;
  }

  if (!event) {
    notFound();
  }

  const attrs = event;
  const imageSrc = getStrapiMediaUrl(attrs.featured_image) ?? "/assets/placeholder-event.jpg";
  const formattedDate = attrs.date_time
    ? new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(attrs.date_time))
    : "To be announced";

  return (
    <main className="min-h-screen bg-cream-brand/20 pb-24">
      {/* Back Header */}
      <div className="bg-white/50 backdrop-blur-md sticky top-[80px] z-30 border-b border-amber-brand/5">
        <div className="mx-auto max-w-[1240px] px-6 py-4 flex items-center justify-between">
          <Link
            href="/events"
            className="flex items-center gap-2 font-bold text-navy-brand hover:text-amber-brand transition-colors group"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Back to Events
          </Link>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-full bg-white border border-amber-brand/10 text-navy-brand hover:bg-amber-brand/5 transition-colors">
              <Share2 size={18} />
            </button>
            <button className="p-2.5 rounded-full bg-white border border-amber-brand/10 text-navy-brand hover:bg-amber-brand/5 transition-colors">
              <Bookmark size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <GsapReveal>
              <div className="mb-8">
                <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-wider uppercase bg-amber-brand/10 text-amber-brand rounded-full">
                  {attrs.type || "Community Event"}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-navy-brand mb-6 leading-tight">
                  {attrs.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-brown-brand/70 font-semibold">
                  <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-amber-brand" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {attrs.type === "Physical" ? (
                      <MapPin size={20} className="text-amber-brand" />
                    ) : (
                      <Video size={20} className="text-amber-brand" />
                    )}
                    <span>{attrs.location || (attrs.type === "Physical" ? "The Safe Space Global Studio" : "Online via Zoom")}</span>
                  </div>
                </div>
              </div>

              <div className="relative aspect-[16/9] w-full mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <Image
                  src={imageSrc}
                  alt={attrs.title || "Event image"}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="prose prose-lg max-w-none prose-headings:font-playfair prose-headings:text-navy-brand text-brown-brand/80 font-nunito leading-relaxed">
                {Array.isArray(attrs.description) ? (
                  attrs.description.map((block, i) => {
                    if (block.type === "paragraph") {
                      return (
                        <p key={i} className="mb-6">
                          {blockText(block)}
                        </p>
                      );
                    }
                    return null;
                  })
                ) : (
                  <p>No description available.</p>
                )}
              </div>
            </GsapReveal>
          </div>

          {/* Sidebar / Register */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <GsapReveal delay={0.2} direction="up">
                <div className="bg-white rounded-[2.5rem] p-8 border border-amber-brand/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)]">
                  <h3 className="text-2xl font-playfair font-bold text-navy-brand mb-6">
                    Reserve Your Spot
                  </h3>

                  <div className="space-y-6 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-brand/10 flex items-center justify-center shrink-0">
                        <Users size={20} className="text-amber-brand" />
                      </div>
                      <div>
                        <p className="font-bold text-navy-brand">Limited Capacity</p>
                        <p className="text-sm text-brown-brand/60">Guided intimate session for better interaction.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-brand/10 flex items-center justify-center shrink-0">
                        <Bookmark size={20} className="text-amber-brand" />
                      </div>
                      <div>
                        <p className="font-bold text-navy-brand">Materials Provided</p>
                        <p className="text-sm text-brown-brand/60">All workshop materials will be shared post-session.</p>
                      </div>
                    </div>
                  </div>

                  {attrs.registration_link ? (
                    <a
                      href={attrs.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={btnPrimary}
                    >
                      Register Now
                    </a>
                  ) : (
                    <Link href="/booking" className={btnPrimary}>
                      Book via Calendar
                    </Link>
                  )}

                  <p className="mt-6 text-center text-xs text-brown-brand/40 font-semibold px-4">
                    By registering, you agree to our terms and community guidelines focused on mental safety.
                  </p>
                </div>

                <div className="mt-8 p-8 bg-navy-brand rounded-[2.5rem] text-white">
                  <h4 className="text-xl font-playfair font-bold mb-4">Have Questions?</h4>
                  <p className="text-white/70 text-sm mb-6">
                    Not sure if this event is right for you? Feel free to reach out to our team.
                  </p>
                  <Link href="/contact" className="text-amber-brand font-bold hover:underline">
                    Talk to us &rarr;
                  </Link>
                </div>
              </GsapReveal>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
