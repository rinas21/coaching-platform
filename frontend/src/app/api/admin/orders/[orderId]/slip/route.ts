import { NextResponse } from "next/server";

function getBackendApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
}

export async function GET(
  req: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const cookie = req.headers.get("cookie") || "";
  const { orderId } = await context.params;
  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }
  try {
    const res = await fetch(`${getBackendApiUrl()}/admin/orders/${encodeURIComponent(orderId)}/slip`, {
      method: "GET",
      headers: {
        cookie,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: (data as { error?: string }).error || "Could not load slip." },
        { status: res.status },
      );
    }
    const bytes = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "content-type": contentType,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach backend API for slip preview." },
      { status: 502 },
    );
  }
}
