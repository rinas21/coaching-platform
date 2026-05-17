import { NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  captchaToken?: string;
};

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as ContactPayload | null;
  if (!body) return badRequest("Invalid request body.");

  const name = body.name?.trim() || "";
  const email = body.email?.trim() || "";
  const phone = body.phone?.trim() || "";
  const subject = body.subject?.trim() || "";
  const message = body.message?.trim() || "";
  const captchaToken = body.captchaToken?.trim() || "";

  if (name.length < 2) return badRequest("Name is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest("Valid email is required.");
  if (subject.length < 3) return badRequest("Subject is required.");
  if (message.length < 15) return badRequest("Message must be at least 15 characters.");

  const backendBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const payload = {
    name,
    email,
    phone,
    subject,
    message,
    source: "website_contact_form",
    captchaToken,
  };

  try {
    // Primary persistence path: application API (PostgreSQL table).
    const apiRes = await fetch(`${backendBase}/contact-inquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (apiRes.ok) {
      return NextResponse.json({ ok: true });
    }

    const apiData = (await apiRes.json().catch(() => null)) as
      | { error?: string; details?: unknown }
      | null;
    const apiDetails =
      apiData?.error ||
      (typeof apiData?.details === "string" ? apiData.details : "") ||
      `status ${apiRes.status}`;
    // Backend can return 502 when inquiry is already stored but email delivery fails.
    // Treat this as success so users are not blocked from submitting the form.
    if (
      apiRes.status === 502 &&
      /message was saved|saved/i.test(String(apiData?.error || ""))
    ) {
      return NextResponse.json({ ok: true, warning: "EMAIL_DELIVERY_FAILED" });
    }
    return NextResponse.json(
      {
        error:
          "We could not submit your message right now. Please retry in a moment.",
        details: {
          api: apiDetails,
        },
      },
      { status: 502 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Could not submit contact request. Please retry.", details: message },
      { status: 500 },
    );
  }
}
