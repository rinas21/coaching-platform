"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { use } from "react";
import { fetchStrapiItemSales, type CatalogItem } from "@/lib/backend-api";
import { logClientError } from "@/lib/client-log";
import { addToCart } from "@/lib/cart";
import GsapReveal from "@/components/GsapReveal";
import { ShoppingBag, ArrowLeft, ShieldCheck, Mail, Sparkles, RefreshCcw } from "lucide-react";
import Image from "next/image";

const CURRENCY = process.env.NEXT_PUBLIC_PAYHERE_CURRENCY || "LKR";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-LK", { style: "currency", currency: CURRENCY }).format(cents / 100);
}

type StoreKind = "therapy" | "course" | "material" | "bundle";

const KIND_META: Record<StoreKind, { label: string; color: string; bg: string }> = {
  therapy: { label: "Therapy", color: "text-navy-brand", bg: "bg-sage-brand/10" },
  course: { label: "Course", color: "text-amber-brand", bg: "bg-amber-brand/10" },
  material: { label: "Material", color: "text-brown-brand", bg: "bg-brown-brand/10" },
  bundle: { label: "Bundle", color: "text-orange-brand", bg: "bg-orange-brand/10" },
};

function inferKind(item: CatalogItem): StoreKind {
  const text = `${item.name} ${item.description || ""}`.toLowerCase();
  if (/(course|workshop|training|internship|program)/.test(text)) return "course";
  if (/(material|resource|worksheet|guide|ebook|bundle kit)/.test(text)) return "material";
  if (/(bundle|package|pack)/.test(text)) return "bundle";
  return "therapy";
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [item, setItem] = useState<CatalogItem | null>(null);
  const [related, setRelated] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [catalogFetchFailed, setCatalogFetchFailed] = useState(false);

  useEffect(() => {
    async function load() {
      const all = await fetchStrapiItemSales();

      const found = all.find((i) => i.id === id);
      if (found) {
        setItem(found);
        setRelated(all.filter((i) => i.id !== id).slice(0, 3));
      }
      setCatalogFetchFailed(false);
      setLoading(false);
    }
    load().catch((err) => {
      logClientError("store-product-catalog", err, { id });
      setCatalogFetchFailed(true);
      setLoading(false);
    });
  }, [id]);

  // Intentionally do not block cart additions for logged-out users.

  const handleAddToCart = () => {
    if (!item || item.status === "sold_out") return;
    for (let i = 0; i < qty; i++) {
      addToCart({
        serviceId: item.id,
        name: item.name,
        description: item.description,
        priceCents: item.price_cents,
        quantity: 1,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream-brand/30">
      <div className="animate-pulse text-amber-brand font-playfair text-xl italic">Unfolding your story...</div>
    </div>
  );

  if (!item) return (
    <main className="min-h-screen pt-40 flex flex-col items-center gap-8 bg-cream-brand/30">
      <h1 className="text-4xl font-playfair font-bold text-navy-brand">A missing chapter.</h1>
      <p className="text-brown-brand/60 font-nunito">
        {catalogFetchFailed
          ? "We couldn&apos;t load this product right now. Please go back to the store and try again in a moment."
          : "We couldn&apos;t find the product you were looking for."}
      </p>
      <Link href="/store" className="btn-primary !bg-navy-brand">Return to Store</Link>
    </main>
  );

  const kind = inferKind(item);
  const meta = KIND_META[kind];
  const isSoldOut = item.status === "sold_out" || (typeof item.available_qty === "number" && item.available_qty <= 0);
  const coverSrc = item.cover_url || "/assets/hero_painted.jpg";
  const displayImage = activeImage || coverSrc;

  return (
    <main className="bg-cream-brand/30 min-h-screen pt-40 pb-32 px-6">
      <div className="container max-w-[1240px]">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brown-brand/40 mb-12">
          <Link href="/store" className="hover:text-amber-brand transition-colors">Store</Link>
          <span>/</span>
          <span className="text-navy-brand">{item.name}</span>
        </nav>

        <section className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start mb-32">
          {/* Left: Product Visuals */}
          <GsapReveal direction="left" delay={0.1}>
            <div className="space-y-8">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-sm bg-gray-100/80">
                <Image
                  src={displayImage}
                  alt={item.name}
                  width={1000}
                  height={1200}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6 py-2 px-5 rounded-full bg-[#34d399] text-white font-bold text-xs shadow-md">
                  {meta.label}
                </div>
              </div>

              {item.gallery_urls && item.gallery_urls.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {[coverSrc, ...item.gallery_urls].map((url, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setActiveImage(url)}
                      className={`w-24 h-24 rounded-3xl overflow-hidden border-2 transition-all flex-shrink-0 ${displayImage === url ? 'border-amber-brand scale-95 shadow-inner' : 'border-white shadow-sm'}`}
                    >
                      <Image src={url} alt="Gallery" width={160} height={160} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </GsapReveal>

          {/* Right: Product Details */}
          <GsapReveal direction="right" delay={0.2}>
            <div className="space-y-10">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {item.name}
                </h1>
                <div className="text-3xl font-bold text-gray-900">
                  {formatMoney(item.price_cents)}
                </div>
              </div>

              <div className="h-[1px] w-full bg-gray-200" />

              <p className="text-lg text-gray-500 leading-relaxed">
                {item.description || "Lightweight, durable, and built for peak performance every step of the way."}
              </p>

              <div className="space-y-6">
                {!isSoldOut && (
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-bold text-navy-brand uppercase tracking-widest">Quantity</span>
                    <div className="flex items-center bg-white rounded-2xl border border-amber-brand/10 overflow-hidden shadow-sm">
                      <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 hover:bg-cream-brand transition-colors text-xl">–</button>
                      <span className="w-12 text-center font-bold text-navy-brand">{qty}</span>
                      <button type="button" onClick={() => setQty(qty + 1)} className="w-12 h-12 hover:bg-cream-brand transition-colors text-xl">+</button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isSoldOut}
                    className={`py-4 px-8 rounded-full font-medium text-lg flex items-center justify-center gap-3 transition-all ${
                      added
                        ? "bg-[#34d399] text-white"
                        : isSoldOut
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-[#222] text-white hover:bg-black"
                    }`}
                  >
                    <ShoppingBag size={20} />
                    {added ? "Added To Cart" : isSoldOut ? "Awaiting Restock" : `Add To Cart • ${formatMoney(item.price_cents * qty)}`}
                  </button>

                  {!isSoldOut && (
                    <Link href="/checkout" className="py-4 px-8 rounded-full font-medium text-lg border-2 border-gray-200 text-gray-900 hover:border-gray-900 hover:bg-gray-50 flex items-center justify-center gap-3 transition-all">
                      Go to Checkout
                    </Link>
                  )}
                </div>
              </div>

              {/* Perks Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Mail size={18} />, text: "Instant Digital Delivery" },
                  { icon: <ShieldCheck size={18} />, text: "Bank transfer + slip verification" },
                  { icon: <Sparkles size={18} />, text: "Evidence-Based Tools" },
                  { icon: <RefreshCcw size={18} />, text: "Always Evolving Content" },
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-3xl border border-amber-brand/5">
                    <div className="text-amber-brand shrink-0">{perk.icon}</div>
                    <span className="text-[10px] font-bold text-navy-brand uppercase tracking-widest leading-tight">{perk.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </GsapReveal>
        </section>

        {/* Related Section */}
        {related.length > 0 && (
          <GsapReveal delay={0.4}>
            <div className="pt-24 border-t border-amber-brand/10">
              <div className="flex items-center justify-between mb-16">
                <h2 className="text-3xl font-playfair font-bold text-navy-brand">Complete the Collection</h2>
                <Link href="/store" className="text-amber-brand font-bold text-sm uppercase tracking-widest flex items-center gap-2 group">
                  Visit Store <ArrowLeft className="rotate-180 group-hover:translate-x-2 transition-transform" size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                {related.map((rel) => {
                  const rKind = inferKind(rel);
                  const rMeta = KIND_META[rKind];
                  return (
                    <article key={rel.id} className="bg-white rounded-[2rem] p-2.5 shadow-sm hover:shadow-lg transition-all duration-500 group">
                      <Link href={`/store/${rel.id}`} className="block relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-gray-100/80">
                        <Image
                          src={rel.cover_url || coverSrc}
                          alt={rel.name}
                          width={800}
                          height={600}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />
                        
                        <span className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-[#34d399] text-white text-[11px] font-bold tracking-wide shadow-sm">
                          {rMeta.label}
                        </span>

                        <button 
                          className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm text-red-500 hover:scale-110 transition-transform"
                          aria-label="Add to wishlist"
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </button>
                      </Link>

                      <div className="pt-5 pb-3 px-3 flex flex-col gap-2">
                        <Link href={`/store/${rel.id}`}>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors leading-tight">
                            {rel.name}
                          </h3>
                        </Link>
                        <p className="text-[0.95rem] text-gray-500 leading-relaxed line-clamp-2">
                          {rel.description || "A curated wellness resource from our space to yours."}
                        </p>

                        <div className="flex items-center justify-between mt-4">
                          <span className="text-[1.35rem] font-bold text-gray-900">
                            {formatMoney(rel.price_cents)}
                          </span>
                          <Link
                            href={`/store/${rel.id}`}
                            className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#222] text-white hover:bg-black transition-all"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </GsapReveal>
        )}
      </div>
    </main>
  );
}
