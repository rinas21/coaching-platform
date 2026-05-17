import { NextResponse } from "next/server";

type CommunityVoicesPayload = {
  name?: string;
  email?: string;
  story?: string;
};

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as CommunityVoicesPayload | null;
  if (!body) return badRequest("Invalid request body.");

  const name = body.name?.trim() || "";
  const email = body.email?.trim() || "";
  const story = body.story?.trim() || "";

  if (name.length < 2) return badRequest("Name is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest("Valid email is required.");
  if (story.length < 20) return badRequest("Story must be at least 20 characters.");

  const backendBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  try {
    const apiRes = await fetch(`${backendBase}/community-voices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, story }),
      cache: "no-store",
    });

    if (apiRes.ok) {
      return NextResponse.json({ ok: true });
    }

    const details = await apiRes.text().catch(() => "");
    return NextResponse.json(
      { error: details || "Could not submit your story right now." },
      { status: apiRes.status || 502 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Could not submit your story right now.", details: message },
      { status: 500 },
    );
  }
}

