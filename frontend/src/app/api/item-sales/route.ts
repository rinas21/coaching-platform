import { NextResponse } from "next/server";
import {
  fetchStrapi,
  getStrapiBaseUrl,
  getStrapiCollection,
  getStrapiMediaUrl,
} from "@/lib/strapi";

type StrapiItemSale = {
  // after unwrap, Strapi attributes are merged onto the object
  id?: string | number;
  documentId?: string;
  title?: string;
  amount?: number | string;
  description?: string;
  available_qty?: number;
  cta_label?: string;
  cta_link?: string;
  display_order?: number;
  cover?: unknown;
  gallery?: unknown;
};

function toAbsoluteUrl(baseUrl: string, url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
}

function extractMediaUrls(baseUrl: string, media: unknown): string[] {
  if (!media) return [];

  // already normalized string
  if (typeof media === "string") {
    const abs = toAbsoluteUrl(baseUrl, media);
    return abs ? [abs] : [];
  }

  // Strapi often returns { data: [...] } for media fields
  if (typeof media === "object" && media && "data" in media) {
    const d = (media as { data?: unknown }).data;
    if (Array.isArray(d)) {
      const urls = d
        .map((x) => getStrapiMediaUrl(x as unknown))
        .filter((x): x is string => !!x);
      // getStrapiMediaUrl may already prefix via /api/image-proxy; keep only non-empty.
      return urls;
    }
    const single = getStrapiMediaUrl(d as unknown);
    return single ? [single] : [];
  }

  // helper can normalize relative urls when media.url exists
  const maybeSingle = getStrapiMediaUrl(media as unknown);
  if (maybeSingle) return [maybeSingle];

  return [];
}

export async function GET() {
  try {
    const baseUrl = getStrapiBaseUrl();

    const result = await fetchStrapi<{ data?: unknown[] }>(
      "/item-sales?populate=*&sort=display_order:asc",
      { cache: "no-store" },
    );

    if (!result.ok) {
      return NextResponse.json(
        { items: [], error: `Could not load Strapi item-sales` },
        { status: result.status ?? 502 },
      );
    }

    const rawItems = getStrapiCollection<StrapiItemSale>(result.data);
    const items = rawItems.map((item) => {
      const rawAmount = item.amount ?? 0;
      const amountRaw =
        typeof rawAmount === "string" ? Number.parseFloat(rawAmount) : rawAmount;
      const safeAmount = Number.isFinite(amountRaw) ? amountRaw : 0;

      const availableQty: number | null =
        typeof item.available_qty === "number" ? item.available_qty : null;

      const status: "available" | "sold_out" =
        availableQty !== null && availableQty <= 0 ? "sold_out" : "available";

      const id = String(item.documentId ?? item.id ?? "");

      const coverUrls = extractMediaUrls(baseUrl, item.cover);

      const galleryUrls = extractMediaUrls(baseUrl, item.gallery);

      return {
        id,
        name: item.title || "Untitled item",
        description: item.description || null,
        price_cents: Math.round(safeAmount * 100),
        created_at: new Date().toISOString(),
        available_qty: availableQty, // null = unlimited, number = tracked quantity
        status,
        cta_label: item.cta_label || "Add to cart",
        cta_link: item.cta_link || "/checkout",
        cover_url: coverUrls[0] ?? null,
        gallery_urls: galleryUrls,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ items: [], error: message }, { status: 500 });
  }
}
