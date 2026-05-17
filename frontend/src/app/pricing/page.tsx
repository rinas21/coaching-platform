import Link from "next/link";

export const metadata = {
  title: "Pricing | The Safe Space Global",
  description:
    "Transparent starting prices for consultations, school programmes, and workplace support.",
};

const PRICING_ROWS = [
  {
    type: "Adult individual session",
    price: "Starting from LKR 8,000",
    includes: "50-minute consultation, goal setting, next-step recommendations.",
  },
  {
    type: "Children & adolescents session",
    price: "Starting from LKR 9,500",
    includes: "50-minute session plus brief caregiver guidance where appropriate.",
  },
  {
    type: "Couples session",
    price: "Starting from LKR 12,000",
    includes: "60-minute facilitated session with a structured action plan.",
  },
  {
    type: "School wellbeing programme",
    price: "Starting from LKR 45,000",
    includes: "Programme planning, facilitation, and educator guidance per module.",
  },
  {
    type: "Workplace wellbeing workshop",
    price: "Starting from LKR 65,000",
    includes: "Needs-based workshop design and team delivery session.",
  },
];

export default function PricingPage() {
  return (
    <main className="section container">
      <header style={{ maxWidth: 760, margin: "0 auto 2rem", textAlign: "center" }}>
        <span className="section-eyebrow">Fees</span>
        <h1 className="section-title">Pricing</h1>
        <p className="section-subtitle" style={{ marginBottom: 0 }}>
          Clear starting rates so you can plan with confidence before booking.
        </p>
      </header>

      <section className="card" style={{ maxWidth: 920, margin: "0 auto 1.25rem" }}>
        <div style={{ display: "grid", gap: "0.85rem" }}>
          {PRICING_ROWS.map((row) => (
            <article
              key={row.type}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                padding: "0.95rem 1rem",
                background: "var(--surface)",
              }}
            >
              <h2 className="card-title" style={{ marginBottom: "0.3rem", fontSize: "1.05rem" }}>
                {row.type}
              </h2>
              <p style={{ color: "var(--primary-d)", fontWeight: 700, marginBottom: "0.2rem" }}>{row.price}</p>
              <p className="store-muted" style={{ marginBottom: 0 }}>{row.includes}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card" style={{ maxWidth: 920, margin: "0 auto" }}>
        <h2 className="card-title">Pricing FAQ</h2>
        <div style={{ display: "grid", gap: "0.8rem" }}>
          <div>
            <p style={{ fontWeight: 700 }}>Are these final prices?</p>
            <p className="store-muted">These are indicative starting rates. Final fees depend on service scope and format.</p>
          </div>
          <div>
            <p style={{ fontWeight: 700 }}>Do you offer packages?</p>
            <p className="store-muted">For schools and workplaces, custom programme pricing is available after needs review.</p>
          </div>
          <div>
            <p style={{ fontWeight: 700 }}>How do I confirm the exact fee?</p>
            <p className="store-muted">Book a consultation or contact us and we will confirm the exact service fee in advance.</p>
          </div>
        </div>
      </section>

      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <Link href="/booking" className="btn-primary" style={{ marginRight: "0.65rem" }}>
          Book consultation
        </Link>
        <Link href="/contact" className="btn-secondary">
          Request a custom quote
        </Link>
      </div>
    </main>
  );
}
