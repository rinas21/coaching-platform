import Link from "next/link";

export function CrisisSafetyBlock() {
  return (
    <section
      className="card"
      style={{
        border: "1px solid #fecaca",
        background: "#fff5f5",
        marginTop: "1.5rem",
      }}
      aria-label="Crisis and safety information"
    >
      <p
        style={{
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#b91c1c",
          marginBottom: "0.55rem",
        }}
      >
        Not for emergencies
      </p>
      <h2 className="card-title" style={{ marginBottom: "0.55rem" }}>
        If you are in danger, call emergency services now
      </h2>
      <p style={{ color: "var(--text-2)", marginBottom: "0.8rem" }}>
        The Safe Space Global is an outpatient and scheduled support service. If there is immediate
        risk of harm to yourself or others, call emergency numbers in Sri Lanka right away.
      </p>
      <ul style={{ marginLeft: "1.25rem", color: "var(--text-2)", lineHeight: 1.8 }}>
        <li>
          Ambulance (Suwaseriya): <a href="tel:1990">1990</a>
        </li>
        <li>
          Police emergency: <a href="tel:119">119</a>
        </li>
        <li>
          Fire and rescue: <a href="tel:110">110</a>
        </li>
      </ul>
      <p style={{ color: "var(--text-2)", marginTop: "0.8rem", marginBottom: 0 }}>
        If you are supporting someone in crisis, stay with them and contact emergency services
        immediately. For non-urgent support, use our <Link href="/contact">contact form</Link> or{" "}
        <Link href="/booking">book a consultation</Link>.
      </p>
    </section>
  );
}
