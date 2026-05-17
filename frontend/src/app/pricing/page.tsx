import Link from "next/link";

export const metadata = {
  title: "Pricing | The Safe Space Global",
  description:
    "Transparent starting prices for executive advisory, business scaling, and corporate leadership masterclasses.",
};

const PRICING_ROWS = [
  {
    type: "Executive Leadership Coaching",
    price: "Starting from LKR 25,000",
    includes: "60-minute executive advisory, strategic roadblock removal, executive presence refinement.",
  },
  {
    type: "Business Scaling & Strategy",
    price: "Starting from LKR 35,000",
    includes: "60-minute intensive strategy, operational bottleneck analysis, growth framework alignment.",
  },
  {
    type: "Co-Founder & Partnership Alignment",
    price: "Starting from LKR 40,000",
    includes: "90-minute facilitated session with a structured co-founder alignment and execution plan.",
  },
  {
    type: "Corporate Leadership Masterclass",
    price: "Starting from LKR 150,000",
    includes: "Masterclass planning, C-suite facilitation, and leadership framework implementation per module.",
  },
  {
    type: "Enterprise Team Alignment Workshop",
    price: "Starting from LKR 250,000",
    includes: "Custom corporate workshop design, organizational health assessment, and executive team delivery.",
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
            <p className="store-muted">For enterprise clients and corporate boards, custom retainer and workshop pricing is available after a strategic needs review.</p>
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
