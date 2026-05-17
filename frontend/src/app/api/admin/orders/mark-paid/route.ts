import { NextResponse } from "next/server";

function getBackendApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
}

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const body = await req.json().catch(() => ({}));
  try {
    const res = await fetch(`${getBackendApiUrl()}/admin/orders/mark-paid`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: (data as { error?: string }).error || "Could not mark order paid." },
        { status: res.status },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Could not reach backend API for payment confirmation." },
      { status: 502 },
    );
  }
}
