"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  fetchStrapiItemSales,
  type CatalogItem,
} from "@/lib/backend-api";
import { logClientError } from "@/lib/client-log";
import { addToCart, getCart, type CartLine } from "@/lib/cart";
import GsapReveal from "@/components/GsapReveal";

const CURRENCY = process.env.NEXT_PUBLIC_PAYHERE_CURRENCY || "LKR";

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: CURRENCY,
  }).format(cents / 100);
}

type StoreKind = "all" | "therapy" | "course" | "material" | "bundle";

const KIND_META: Record<
  Exclude<StoreKind, "all">,
  { label: string; color: string; bg: string }
> = {
  therapy: { label: "Coaching", color: "#6d28d9", bg: "#ede9fe" },
  course: { label: "Course", color: "#0369a1", bg: "#e0f2fe" },
  material: { label: "Material", color: "#065f46", bg: "#d1fae5" },
  bundle: { label: "Bundle", color: "#92400e", bg: "#fef3c7" },
};

/* Placeholder SVG covers per category when no cover photo is set */
const PLACEHOLDER_COVERS: Record<Exclude<StoreKind, "all">, string> = {
  therapy: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" fill="none">
      <rect width="400" height="260" fill="#ede9fe"/>
      <circle cx="200" cy="110" r="55" fill="#a78bfa" opacity=".4"/>
      <path d="M172 110c0-15.464 12.536-28 28-28s28 12.536 28 28" stroke="#7c3aed" stroke-width="4" stroke-linecap="round"/>
      <circle cx="200" cy="120" r="16" fill="#7c3aed" opacity=".7"/>
      <path d="M155 170h90M165 185h70" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" opacity=".4"/>
    </svg>`,
  course: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" fill="none">
      <rect width="400" height="260" fill="#e0f2fe"/>
      <rect x="110" y="65" width="180" height="130" rx="10" fill="#38bdf8" opacity=".3"/>
      <rect x="125" y="85" width="150" height="10" rx="5" fill="#0284c7" opacity=".7"/>
      <rect x="125" y="105" width="110" height="8" rx="4" fill="#0284c7" opacity=".5"/>
      <rect x="125" y="123" width="130" height="8" rx="4" fill="#0284c7" opacity=".4"/>
      <circle cx="270" cy="175" r="28" fill="#0ea5e9" opacity=".7"/>
      <path d="M263 175l10-6v12l-10-6z" fill="white"/>
    </svg>`,
  material: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" fill="none">
      <rect width="400" height="260" fill="#d1fae5"/>
      <rect x="130" y="55" width="140" height="160" rx="8" fill="#6ee7b7" opacity=".5"/>
      <rect x="145" y="80" width="110" height="8" rx="4" fill="#059669"/>
      <rect x="145" y="100" width="90" height="6" rx="3" fill="#059669" opacity=".7"/>
      <rect x="145" y="118" width="100" height="6" rx="3" fill="#059669" opacity=".6"/>
      <rect x="145" y="136" width="80" height="6" rx="3" fill="#059669" opacity=".5"/>
      <path d="M155 161h90" stroke="#059669" stroke-width="2" stroke-dasharray="6 4"/>
    </svg>`,
  bundle: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" fill="none">
      <rect width="400" height="260" fill="#fef3c7"/>
      <rect x="90" y="100" width="100" height="120" rx="6" fill="#fbbf24" opacity=".5"/>
      <rect x="110" y="80" width="100" height="120" rx="6" fill="#f59e0b" opacity=".5"/>
      <rect x="130" y="60" width="100" height="120" rx="6" fill="#d97706" opacity=".6"/>
      <path d="M145 95l8 8 16-16" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
};

function inferKind(item: CatalogItem): Exclude<StoreKind, "all"> {
  const text = `${item.name} ${item.description || ""}`.toLowerCase();
  if (/(course|workshop|training|internship|program)/.test(text))
    return "course";
  if (/(material|resource|worksheet|guide|ebook|bundle kit)/.test(text))
    return "material";
  if (/(bundle|package|pack)/.test(text)) return "bundle";
  return "therapy";
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

// ── Components ───────────────────────────────────────────────────────────
function StoreCard({
  item,
  isAdded,
  onAdd,
}: {
  item: CatalogItem;
  isAdded: boolean;
  onAdd: (item: CatalogItem) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const kind = inferKind(item);
  const meta = KIND_META[kind];
  const isSoldOut =
    item.status === "sold_out" ||
    (typeof item.available_qty === "number" && item.available_qty <= 0);
  const coverSrc = item.cover_url ?? svgToDataUrl(PLACEHOLDER_COVERS[kind]);
  const hoverSrc =
    item.gallery_urls && item.gallery_urls.length > 0
      ? item.gallery_urls[0]
      : coverSrc;

  return (
    <article
      className="bg-white rounded-[2rem] p-2.5 shadow-sm hover:shadow-lg transition-all duration-500 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/store/${item.id}`}
        className="block relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-gray-100/80"
      >
        <Image
          src={isHovered ? hoverSrc : coverSrc}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />

        <span className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-amber-brand text-white text-[11px] font-bold tracking-wide shadow-sm">
          {meta.label}
        </span>

        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-gray-900 font-bold px-6 py-2 rounded-full text-sm uppercase tracking-widest">
              Restock Coming
            </span>
          </div>
        )}
      </Link>

      <div className="pt-5 pb-3 px-3 flex flex-col gap-2">
        <Link href={`/store/${item.id}`}>
          <h2 className="text-xl font-bold font-nunito text-gray-900 group-hover:text-gray-600 transition-colors leading-tight">
            {item.name}
          </h2>
        </Link>
        <p className="text-[0.95rem] text-gray-500 leading-relaxed line-clamp-2 font-nunito">
          {item.description ||
            "A curated executive resource from our boardroom to yours."}
        </p>

        <div className="flex items-center justify-between mt-4 font-nunito">
          <span className="text-[1.35rem] font-black text-gray-900">
            {formatMoney(item.price_cents)}
          </span>
          <button
            type="button"
            onClick={() => onAdd(item)}
            disabled={isSoldOut}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${isAdded
              ? "bg-[#34d399] text-white"
              : isSoldOut
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#222] text-white hover:bg-black"
              }`}
          >
            {isAdded ? "Added" : isSoldOut ? "Soon" : "Add To Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function StorePage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [cartSnap, setCartSnap] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogLoadFailed, setCatalogLoadFailed] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<StoreKind>("all");

  const refreshCart = useCallback(() => setCartSnap(getCart()), []);

  useEffect(() => {
    refreshCart();
    const onCart = () => refreshCart();
    window.addEventListener("safespace-cart-change", onCart);
    return () => window.removeEventListener("safespace-cart-change", onCart);
  }, [refreshCart]);

  useEffect(() => {
    fetchStrapiItemSales()
      .then((rows) => setItems(rows))
      .catch((err) => {
        logClientError("store-catalog", err);
        setCatalogLoadFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (row: CatalogItem) => {
    // Guests can add to cart; checkout will force login.
    if (
      row.status === "sold_out" ||
      (typeof row.available_qty === "number" && row.available_qty <= 0)
    )
      return;
    addToCart({
      serviceId: row.id,
      name: row.name,
      description: row.description,
      priceCents: row.price_cents,
      quantity: 1,
    });
    setAddedId(row.id);
    window.setTimeout(
      () => setAddedId((id) => (id === row.id ? null : id)),
      2200,
    );
  };

  const visibleItems = items
    .filter((item) => {
      const q = query.trim().toLowerCase();
      return (
        !q || `${item.name} ${item.description || ""}`.toLowerCase().includes(q)
      );
    })
    .filter((item) => kind === "all" || inferKind(item) === kind)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="bg-cream-brand/20 min-h-screen -mt-32">
      {/* Premium Hero */}
      <section className="relative overflow-hidden pt-40 pb-32 bg-navy-brand">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-amber-brand/5 -z-0 rounded-l-[20rem] hidden lg:block" />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-amber-brand font-bold tracking-widest uppercase text-xs mb-6 block px-4 py-1.5 rounded-full bg-amber-brand/10 inline-block">
                Executive Store
              </span>
              <h1 className="text-5xl md:text-7xl font-playfair font-bold text-cream-brand mb-8 leading-[1.1]">
                Curated Tools <br />
                For Enterprise Growth.
              </h1>
              <p className="text-xl text-cream-brand/70 font-nunito mb-10 max-w-lg leading-relaxed">
                Explore executive-curated resources, strategic frameworks, and practical
                materials that support enterprise scaling, leadership presence, and professional growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link
                  href="/waitlist"
                  className="btn-primary !bg-amber-brand border-amber-brand hover:!bg-orange-brand"
                >
                  Join the Waitlist
                </Link>
                <Link
                  href="/checkout"
                  className="btn-outline !border-cream-brand/20 !text-cream-brand flex items-center justify-center gap-3"
                >
                  View Your Cart{" "}
                  <span className="bg-white/10 px-2 py-1 rounded-md text-xs">
                    {cartSnap.length}
                  </span>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-10 bg-amber-brand/10 rounded-full blur-3xl" />
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-[4rem] rotate-3 shadow-2xl relative aspect-[4/3] w-full max-w-lg mx-auto lg:ml-auto">
                <Image
                  src="/assets/images/store.png"
                  alt="Curated Collection"
                  fill
                  className="rounded-[3rem] w-full h-auto"
                  sizes="(max-width: 1024px) 100vw, 512px"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-amber-brand text-white p-8 rounded-full shadow-2xl font-playfair font-bold text-center animate-bounce">
                Coming <br />
                Soon
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="section">
        <div className="container">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-16">
            <div className="relative w-full md:w-96">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full bg-white border border-amber-brand/10 rounded-full py-4 px-8 pl-14 outline-none focus:ring-2 ring-amber-brand/20 font-nunito transition-all shadow-sm"
              />
              <span className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30">
                🔍
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {["all", "therapy", "course", "material", "bundle"].map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setKind(v as StoreKind)}
                  className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${kind === v
                    ? "bg-navy-brand text-white shadow-lg"
                    : "bg-white text-navy-brand/60 hover:text-navy-brand"
                    }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {catalogLoadFailed && (
            <div className="mb-10 rounded-[2rem] border border-red-200 bg-red-50 px-8 py-6 text-red-700">
              <p className="font-bold uppercase tracking-widest text-xs mb-2">
                Could not load the store
              </p>
              <p className="font-nunito text-sm">
                Please refresh the page in a moment. If this keeps happening, try again later.
              </p>
            </div>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-96 bg-white/50 rounded-[2.5rem] animate-pulse"
                />
              ))}
            </div>
          ) : visibleItems.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {visibleItems.map((item) => (
                <StoreCard
                  key={item.id}
                  item={item}
                  isAdded={addedId === item.id}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white/40 rounded-[4rem] border border-dashed border-amber-brand/20">
              <span className="text-6xl mb-8 block opacity-30">✨</span>
              <h3 className="text-3xl font-playfair font-bold text-navy-brand mb-4">
                Something wonderful is brewing.
              </h3>
              <p className="text-brown-brand/60 font-nunito mb-10">
                We couldn&apos;t find exactly that, but our digital shelves are
                constantly being restocked with premium business growth resources.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setKind("all");
                }}
                className="btn-outline"
              >
                Show All Items
              </button>
            </div>
          )}
          {/* Additional Coming Soon Sections */}
          <div className="grid md:grid-cols-2 gap-12 mt-20">
            <GsapReveal direction="up" delay={0.2}>
              <div className="p-12 bg-white rounded-[3.5rem] border border-amber-brand/10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-brand/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-amber-brand/10 transition-colors" />
                <h3 className="text-2xl font-playfair font-bold text-navy-brand mb-6">
                  TSSG Executive Collection
                </h3>
                <p className="text-sm text-brown-brand/60 font-nunito leading-relaxed mb-8">
                  Carry elite professionalism. Premium notebooks, executive leather
                  folios, and structured planners featuring original designs rooted in
                  high-performance leadership and business mastery. No clichés. Just meaningful,
                  professional utility.
                </p>
                <span className="text-[10px] font-bold text-amber-brand uppercase tracking-widest border border-amber-brand/20 px-4 py-2 rounded-full">
                  In Development
                </span>
              </div>
            </GsapReveal>
            <GsapReveal direction="up" delay={0.3}>
              <div className="p-12 bg-white rounded-[3.5rem] border border-amber-brand/10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sage-brand/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-sage-brand/10 transition-colors" />
                <h3 className="text-2xl font-playfair font-bold text-navy-brand mb-6">
                  Strategic Planners & Workbooks
                </h3>
                <p className="text-sm text-brown-brand/60 font-nunito leading-relaxed mb-8">
                  For elite execution. Guided planners rooted in organizational alignment,
                  quarterly milestone tracking, and executive energy management. Tools
                  you can use to scale your business at your own pace.
                </p>
                <span className="text-[10px] font-bold text-sage-brand uppercase tracking-widest border border-sage-brand/20 px-4 py-2 rounded-full">
                  Coming Soon
                </span>
              </div>
            </GsapReveal>
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="pb-32 px-6">
        <div className="container max-w-5xl">
          <div className="grid sm:grid-cols-3 gap-12 text-center border-t border-amber-brand/10 pt-20">
            <div>
              <h4 className="font-playfair font-bold text-navy-brand text-lg mb-3">
                Secure Payment
              </h4>
              <p className="text-sm text-brown-brand/60 font-nunito">
                Checkout gives you a bank reference; you transfer with your bank, then submit your slip for our team to verify.
              </p>
            </div>
            <div>
              <h4 className="font-playfair font-bold text-navy-brand text-lg mb-3">
                Digital Delivery
              </h4>
              <p className="text-sm text-brown-brand/60 font-nunito">
                Downloads are delivered instantly to your inbox.
              </p>
            </div>
            <div>
              <h4 className="font-playfair font-bold text-navy-brand text-lg mb-3">
                Executive Quality
              </h4>
              <p className="text-sm text-brown-brand/60 font-nunito">
                Curated by our team of Master Certified Coaches and C-suite advisors.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
