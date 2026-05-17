import Link from "next/link";

export const metadata = {
  title: "How It Works | The Safe Space Global",
  description:
    "What to expect before you book: first session, confidentiality, cancellation policy, and online vs in-person support.",
};

export default function HowItWorksPage() {
  return (
    <main className="section container">
      <header style={{ maxWidth: 760, margin: "0 auto 2rem", textAlign: "center" }}>
        <span className="section-eyebrow">Before you book</span>
        <h1 className="section-title">How it works</h1>
        <p className="section-subtitle" style={{ marginBottom: 0 }}>
          Clear answers to the most common questions so you can decide with confidence.
        </p>
      </header>

      <section className="card" style={{ maxWidth: 860, margin: "0 auto 1rem" }}>
        <h2 className="card-title">What happens in the first session?</h2>
        <p className="card-desc" style={{ marginBottom: 0 }}>
          Your first session focuses on understanding your concerns, goals, current stressors, and
          what support would feel most useful. You can ask questions about approach, pacing, and
          therapist fit. Together, we agree on next steps.
        </p>
      </section>

      <section className="card" style={{ maxWidth: 860, margin: "0 auto 1rem" }}>
        <h2 className="card-title">Confidentiality basics</h2>
        <p className="card-desc" style={{ marginBottom: 0 }}>
          Sessions are private and confidential. We only share information with your permission,
          except where there is serious risk of harm, legal obligation, or safeguarding concerns.
          If any limit applies, we explain it clearly.
        </p>
      </section>

      <section className="card" style={{ maxWidth: 860, margin: "0 auto 1rem" }}>
        <h2 className="card-title">Cancellation policy</h2>
        <p className="card-desc" style={{ marginBottom: 0 }}>
          Please cancel or reschedule at least 24 hours in advance. Late cancellations and missed
          sessions may be charged in full. If an emergency affects attendance, contact us and we
          will review case-by-case.
        </p>
      </section>

      <section className="card" style={{ maxWidth: 860, margin: "0 auto 1rem" }}>
        <h2 className="card-title">Who is this for?</h2>
        <p className="card-desc" style={{ marginBottom: 0 }}>
          We support children, adolescents, adults, parents, couples, schools, and workplaces. If
          you are unsure what service fits your situation, we can guide you before you commit.
        </p>
      </section>

      <section className="card" style={{ maxWidth: 860, margin: "0 auto" }}>
        <h2 className="card-title">Online vs in-person</h2>
        <p className="card-desc" style={{ marginBottom: 0 }}>
          We offer both online and in-person support depending on availability and your preference.
          Online sessions are secure and convenient; in-person sessions may be better for some
          assessments or personal comfort. We can help you choose.
        </p>
      </section>

      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <Link href="/booking" className="btn-primary" style={{ marginRight: "0.65rem" }}>
          Book consultation
        </Link>
        <Link href="/contact" className="btn-secondary">
          Ask a question
        </Link>
      </div>
    </main>
  );
}
