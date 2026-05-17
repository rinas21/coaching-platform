import { NextResponse } from "next/server";

type IgChild = { media_url?: string };
type IgRaw = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string;
  like_count?: number;
  comments_count?: number;
  children?: { data?: IgChild[] };
};

const FIELDS =
  "id,caption,media_type,media_url,permalink,thumbnail_url,like_count,comments_count,children{media_url}";

function pickImageUrl(m: IgRaw): string | null {
  if (m.media_url) return m.media_url;
  if (m.media_type === "VIDEO" && m.thumbnail_url) return m.thumbnail_url;
  const first = m.children?.data?.[0]?.media_url;
  if (first) return first;
  return null;
}

function buildUrl(token: string): string | null {
  const graphUserId = process.env.INSTAGRAM_GRAPH_USER_ID?.trim();
  if (graphUserId) {
    return `https://graph.facebook.com/v21.0/${encodeURIComponent(graphUserId)}/media?fields=${encodeURIComponent(FIELDS)}&limit=3&access_token=${encodeURIComponent(token)}`;
  }
  return `https://graph.instagram.com/me/media?fields=${encodeURIComponent(FIELDS)}&limit=3&access_token=${encodeURIComponent(token)}`;
}

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!token) {
    return NextResponse.json(
      { ok: false, reason: "not_configured", posts: [] as unknown[] },
      { headers: { "Cache-Control": "public, s-maxage=60" } },
    );
  }

  try {
    const url = buildUrl(token);
    if (!url) {
      return NextResponse.json({ ok: false, reason: "bad_config", posts: [] });
    }

    const res = await fetch(url, { next: { revalidate: 900 } });
    const body = (await res.json()) as { data?: IgRaw[]; error?: { message?: string } };

    if (!res.ok || body.error) {
      console.warn("[api/instagram] upstream error", res.status, body.error?.message);
      return NextResponse.json(
        { ok: false, reason: "upstream_error", detail: body.error?.message, posts: [] },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const raw = body.data || [];
    const posts = raw
      .map((m) => {
        const image = pickImageUrl(m);
        if (!image || !m.permalink) return null;
        return {
          id: m.id,
          image,
          likes: m.like_count != null ? String(m.like_count) : "—",
          comments: m.comments_count != null ? String(m.comments_count) : "—",
          permalink: m.permalink,
          caption: (m.caption || "").split("\n")[0]?.slice(0, 140) || "",
        };
      })
      .filter(Boolean);

    return NextResponse.json(
      { ok: true, posts: posts.slice(0, 3) },
      { headers: { "Cache-Control": "public, s-maxage=900" } },
    );
  } catch (e) {
    console.warn("[api/instagram] fetch failed", e);
    return NextResponse.json(
      { ok: false, reason: "fetch_failed", posts: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
