import Link from "next/link";

export const metadata = {
  title: "How It Works | The Safe Space Global",
  description:
    "What to expect before you book: strategic onboarding, executive confidentiality, cancellation policy, and online vs boardroom advisory.",
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
        <h2 className="card-title">What happens in the strategic onboarding session?</h2>
        <p className="card-desc" style={{ marginBottom: 0 }}>
          Your onboarding session focuses on understanding your business bottlenecks, organizational goals, current executive stressors, and
          what advisory structure would be most high-impact. You can ask questions about our frameworks, pacing, and
          advisor fit. Together, we establish an executive execution plan.
        </p>
      </section>

      <section className="card" style={{ maxWidth: 860, margin: "0 auto 1rem" }}>
        <h2 className="card-title">Executive Confidentiality</h2>
        <p className="card-desc" style={{ marginBottom: 0 }}>
          All boardroom advisory and coaching sessions are strictly confidential. We maintain absolute NDA-level discretion regarding corporate strategy, internal organizational dynamics, and executive performance.
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
          We support C-suite executives, business owners, corporate leaders, ambitious professionals, and enterprise organizations. If
          you are unsure which coaching package fits your growth objectives, we can guide you before you commit.
        </p>
      </section>

      <section className="card" style={{ maxWidth: 860, margin: "0 auto" }}>
        <h2 className="card-title">Online vs Boardroom Advisory</h2>
        <p className="card-desc" style={{ marginBottom: 0 }}>
          We offer both secure online advisory and in-person boardroom support depending on availability and your preference.
          Online sessions are encrypted and flexible for busy executives; in-person sessions are ideal for team alignment and intensive strategy. We can help you choose.
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
