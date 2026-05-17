import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  fetchStrapi,
  getStrapiCollection,
  getStrapiMediaUrl,
} from "@/lib/strapi";
import {
  SERVICE_AUDIENCES,
  audienceLabelFromSlug,
  matchServiceAudience,
  type ServiceAudienceSlug,
} from "@/lib/service-audiences";

/** Request-time only: no Strapi fetch during `next build`; catalog may be empty until CMS is online. */
export const dynamic = "force-dynamic";

type StrapiService = {
  documentId: string;
  title?: string;
  slug?: string;
  short_description?: string;
  audience_category?: string;
  images?: { url?: string }[];
  display_order?: number;
  is_active?: boolean;
  cta_label?: string;
  cta_link?: string;
};

export async function generateMetadata({ params }: { params: Promise<{ audience: string }> }) {
  const resolved = await params;
  const label = audienceLabelFromSlug(resolved.audience) || "Services";
  return {
    title: `${label} Services | The Safe Space Global`,
    description: `${label} support services from The Safe Space Global.`,
  };
}

export default async function ServicesAudiencePage({
  params,
}: {
  params: Promise<{ audience: string }>;
}) {
  const resolved = await params;
  const audienceSlug = resolved.audience as ServiceAudienceSlug;
  const label = audienceLabelFromSlug(audienceSlug);
  if (!label) notFound();

  const result = await fetchStrapi<{ data?: StrapiService[] }>(
    "/services?publicationState=preview&populate=*&sort=display_order:asc",
  );
  const missingEndpointOrEmpty =
    result.ok === false &&
    result.kind === "http" &&
    (result.status === 404 || result.status === 410);

  if (!result.ok && !missingEndpointOrEmpty) {
    return (
      <main className="section container">
        <section className="card" style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h2 className="card-title">Services are temporarily unavailable</h2>
          <p className="card-desc">
            We could not load the service catalog. Please try again in a moment.
          </p>
          <Link href="/contact" className="btn-primary">
            Contact our team
          </Link>
        </section>
      </main>
    );
  }

  // 404/410 from API: treat like an empty catalog (no Strapi route or type yet), not a user-facing error.
  const payload = result.ok ? result.data : { data: [] as StrapiService[] };
  const allServices = getStrapiCollection<StrapiService>(payload)
    .filter((service) => service.is_active !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const services = allServices.filter(
    (service) => matchServiceAudience(service.audience_category) === audienceSlug,
  );

  return (
    <main className="section container">
      <header style={{ maxWidth: 760, margin: "0 auto 2rem", textAlign: "center" }}>
        <span className="section-eyebrow">Services</span>
        <h1 className="section-title">{label}</h1>
        <p className="section-subtitle" style={{ marginBottom: 0 }}>
          Structured support options for {label.toLowerCase()}.
        </p>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginBottom: "1.2rem" }}>
        {SERVICE_AUDIENCES.map((audience) => (
          <Link
            key={audience.slug}
            href={`/services/${audience.slug}`}
            className={audience.slug === audienceSlug ? "btn-primary" : "btn-secondary"}
          >
            {audience.label}
          </Link>
        ))}
      </div>

      {services.length === 0 ? (
        <section className="card" style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h2 className="card-title">No published services yet</h2>
          <p className="card-desc">
            When offerings for {label} are published, they will appear here. You can still reach us below.
          </p>
          <Link href="/contact" className="btn-primary">
            Contact our team
          </Link>
        </section>
      ) : (
        <section className="card-grid">
          {services.map((service) => {
            const imageUrl = getStrapiMediaUrl(service.images);
            const ctaLabel = service.cta_label || "Book now";
            const ctaLink = service.cta_link || "/booking";
            return (
              <article key={service.documentId} className="card">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={service.title || "Service"}
                    width={720}
                    height={420}
                    className="post-image"
                    style={{ borderRadius: "var(--r-md)", marginBottom: "1rem" }}
                  />
                )}
                <span className="service-label">{service.audience_category || label}</span>
                <h2 className="card-title">{service.title || "Service"}</h2>
                <p className="card-desc">
                  {service.short_description || "Support details are being added."}
                </p>
                <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
                  <Link href={ctaLink} className="btn-primary">
                    {ctaLabel}
                  </Link>
                  <Link href="/contact" className="btn-secondary">
                    Ask about this service
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
