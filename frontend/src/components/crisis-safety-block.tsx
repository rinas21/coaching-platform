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
        Corporate Escalation Notice
      </p>
      <h2 className="card-title" style={{ marginBottom: "0.55rem" }}>
        For urgent corporate escalation, contact your designated senior advisor
      </h2>
      <p style={{ color: "var(--text-2)", marginBottom: "0.8rem" }}>
        Apex Executive Advisory operates on a scheduled executive advisory basis. If your enterprise is experiencing an immediate operational crisis or high-stakes boardroom conflict, please contact our corporate escalation desk directly.
      </p>
      <ul style={{ marginLeft: "1.25rem", color: "var(--text-2)", lineHeight: 1.8 }}>
        <li>
          Corporate Crisis Desk: <a href="tel:+94112345678">+94 11 234 5678</a>
        </li>
        <li>
          Executive Advisory Escalation: <a href="mailto:escalation@apexexecutiveadvisory.com">escalation@apexexecutiveadvisory.com</a>
        </li>
        <li>
          Senior Boardroom Support: <a href="tel:+94771234567">+94 77 123 4567</a>
        </li>
      </ul>
      <p style={{ color: "var(--text-2)", marginTop: "0.8rem", marginBottom: 0 }}>
        If your executive team requires urgent strategic intervention, please reach out via our escalation channels. For standard advisory inquiries, use our <Link href="/contact">contact form</Link> or{" "}
        <Link href="/booking">book a consultation</Link>.
      </p>
    </section>
  );
}
