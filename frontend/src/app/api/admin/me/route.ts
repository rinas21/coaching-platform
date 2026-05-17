import { NextResponse } from "next/server";

function getBackendApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
}

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const res = await fetch(`${getBackendApiUrl()}/admin/me`, {
      method: "GET",
      headers: { cookie },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: (data as { error?: string }).error || "Admin auth failed." },
        { status: res.status },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Could not verify admin login." }, { status: 502 });
  }
}
