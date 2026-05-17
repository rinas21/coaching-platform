"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiHttpError, deleteUserOrder, getMe, type MeResponse } from "@/lib/backend-api";
import { logClientError } from "@/lib/client-log";
import { PurchaseSlipUploadBlock } from "@/components/PurchaseSlipUploadInline";
import Link from "next/link";
import {
  Mail,
  ShoppingBag,
  Calendar,
  ChevronRight,
  Package,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react";

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: (currency || "USD").toUpperCase(),
  }).format(cents / 100);
}

/** Normalize API row (snake_case from Postgres; tolerate camelCase if ever proxied). */
function coercePurchase(row: MeResponse["purchases"][number]): MeResponse["purchases"][number] {
  const r = row as Record<string, unknown>;
  return {
    ...row,
    order_id: (row.order_id ?? r.orderId) as MeResponse["purchases"][number]["order_id"],
    stripe_session_id: (row.stripe_session_id ?? r.stripeSessionId ?? null) as string | null,
    order_code: (row.order_code ?? r.orderCode) as string | null | undefined,
    order_status: (row.order_status ?? r.orderStatus) as string | null | undefined,
  };
}

/** Order UUID when the customer may delete this purchase; null if tied to no order or already PAID. */
function removableOrderId(item: MeResponse["purchases"][number]): string | null {
  const oid = String(item.order_id || "").trim();
  if (!oid) return null;
  if (String(item.order_status || "").toUpperCase() === "PAID") return null;
  return oid;
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let colors = "bg-gray-100 text-gray-600";

  if (s.includes("paid") || s.includes("succeeded") || s.includes("confirmed")) {
    colors = "bg-emerald-50 text-emerald-700 border-emerald-100";
  } else if (s.includes("pending")) {
    colors = "bg-amber-50 text-amber-700 border-amber-100";
  } else if (s.includes("failed") || s.includes("cancelled")) {
    colors = "bg-red-50 text-red-700 border-red-100";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${colors}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

/** Prefer order lifecycle over raw payment row status so “pending” is not confused with slip-in-review. */
function purchaseStatusDisplay(item: MeResponse["purchases"][number]): {
  label: string;
  badgeClass: string;
  hint?: string;
} {
  const os = String(item.order_status || "").toUpperCase();
  const pay = String(item.status || "").toLowerCase();

  if (os === "PAID") {
    return {
      label: "Completed",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    };
  }
  if (os === "EXPIRED") {
    return {
      label: "Expired",
      badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
    };
  }
  if (os === "PENDING_REVIEW") {
    return {
      label: "Verifying payment",
      badgeClass: "bg-sky-50 text-sky-900 border-sky-200",
      hint: "Your slip is with our team. Payment may still show as processing until we confirm the transfer.",
    };
  }
  if (os === "PENDING_PAYMENT" || pay.includes("pending")) {
    return {
      label: "Awaiting payment",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }
  return {
    label: String(item.status || "Unknown").replace(/_/g, " "),
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
  };
}

function PurchaseStatusBadge({ item }: { item: MeResponse["purchases"][number] }) {
  const { label, badgeClass, hint } = purchaseStatusDisplay(item);
  return (
    <div className="flex flex-col items-start sm:items-end gap-1">
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeClass}`}
      >
        {label}
      </span>
      {hint ? (
        <span className="text-[10px] text-brown-brand/65 font-nunito max-w-[220px] sm:text-right leading-snug">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [removingOrderId, setRemovingOrderId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const refreshAccount = useCallback(async () => {
    try {
      const r = await getMe();
      setData(r);
    } catch (e) {
      logClientError("account-refresh", e);
    }
  }, []);

  const removeOrder = useCallback(
    async (orderId: string) => {
      if (
        !window.confirm(
          "Remove this order from your account? This cannot be undone. You can do this until the order is marked complete by our team.",
        )
      ) {
        return;
      }
      setRemoveError(null);
      setRemovingOrderId(orderId);
      try {
        await deleteUserOrder(orderId);
        await refreshAccount();
      } catch (e) {
        logClientError("account-remove-order", e, { orderId });
        const msg =
          e instanceof Error && e.message.trim()
            ? e.message.trim()
            : "Could not remove this order.";
        setRemoveError(msg);
      } finally {
        setRemovingOrderId(null);
      }
    },
    [refreshAccount],
  );

  useEffect(() => {
    getMe()
      .then((res) => setData(res))
      .catch((e) => {
        if (e instanceof ApiHttpError && e.status === 401) {
          setRedirecting(true);
          router.replace(`/login?next=${encodeURIComponent("/account")}`);
          return;
        }
        logClientError("account-page", e);
        const msg = String(e?.message || "");
        if (msg.includes("401") || msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("unauthenticated")) {
          router.push("/login");
        } else {
          setLoadFailed(true);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || redirecting) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-amber-brand animate-spin" />
        <p className="text-brown-brand/60 font-medium animate-pulse">
          {redirecting ? "Redirecting to sign in…" : "Loading your account..."}
        </p>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="container section">
        <div className="max-w-md mx-auto card p-10 text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-brand">
            <AlertCircle size={32} />
          </div>
          <div>
            <h2 className="text-2xl mb-2">We couldn&apos;t load your account</h2>
            <p className="text-brown-brand/70 mb-6">
              Something went wrong while loading your details. Please try again in a moment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Link href="/login?next=%2Faccount" className="btn-secondary w-full sm:w-auto">
                Sign in
              </Link>
              <button
                type="button"
                className="btn-primary w-full sm:w-auto"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cream-brand/30 pb-20">
      <div className="container pt-12 md:pt-20">
        <header className="mb-12">
          <h1 className="section-title mb-2">My Account</h1>
          <p className="text-brown-brand/60">Manage your profile, view purchases, and track your sessions.</p>
        </header>

        {data && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar: Profile */}
            <aside className="lg:col-span-4 space-y-6">
              <section className="card p-8 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-2 bg-amber-brand"></div>
                <div className="w-24 h-24 bg-navy-brand text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl text-3xl font-playfair font-bold">
                  {data.user.displayName?.[0] || data.user.email[0].toUpperCase()}
                </div>
                <h2 className="text-2xl mb-1">{data.user.displayName || "Safe Space Member"}</h2>
                <p className="text-brown-brand/60 flex items-center justify-center gap-2 mb-8">
                  <Mail size={14} /> {data.user.email}
                </p>
                <div className="pt-6 border-t border-amber-brand/10 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-widest font-bold text-amber-brand/60 mb-1">Meetings</p>
                    <p className="text-xl font-bold text-navy-brand">{data.meetings.length}</p>
                  </div>
                  <div className="text-center border-l border-amber-brand/10">
                    <p className="text-xs uppercase tracking-widest font-bold text-amber-brand/60 mb-1">Orders</p>
                    <p className="text-xl font-bold text-navy-brand">{data.purchases.length}</p>
                  </div>
                </div>
              </section>

              <div className="card p-6 bg-navy-brand text-white border-none">
                <h3 className="text-white text-lg mb-4 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-amber-brand" />
                  Executive Store
                </h3>
                <p className="text-white/70 text-sm mb-6 leading-relaxed">
                  Explore our curated selection of executive tools, leadership frameworks, and business scaling resources.
                </p>
                <Link href="/store" className="btn-primary w-full py-3 text-sm">
                  Visit Store <ChevronRight size={16} />
                </Link>
              </div>
            </aside>

            {/* Main Content: History */}
            <div className="lg:col-span-8 space-y-8">
              {/* Meeting History */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl flex items-center gap-3">
                    <Calendar className="text-amber-brand" /> Meeting History
                  </h3>
                </div>

                {data.meetings.length === 0 ? (
                  <div className="card p-12 text-center border-dashed bg-transparent">
                    <div className="w-16 h-16 bg-cream-brand rounded-full flex items-center justify-center mx-auto mb-4 text-brown-brand/30">
                      <Calendar size={32} />
                    </div>
                    <p className="text-brown-brand/60 font-medium">No meetings scheduled yet.</p>
                    <Link href="/booking" className="text-amber-brand font-bold mt-2 inline-block hover:underline">Book your first session →</Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {data.meetings.map((meeting) => (
                      <div key={meeting.id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-white transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-amber-brand/10 rounded-2xl flex items-center justify-center text-amber-brand shrink-0">
                            <Package size={24} />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-navy-brand group-hover:text-amber-brand transition-colors">
                              {meeting.service_name}
                            </h4>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                              <p className="text-sm text-brown-brand/60 flex items-center gap-1.5">
                                <Clock size={14} />
                                {meeting.starts_at
                                  ? new Date(meeting.starts_at).toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                                  : "Schedule pending"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={meeting.status} />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Purchase History */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl flex items-center gap-3">
                    <Package className="text-amber-brand" /> Purchase History
                  </h3>
                </div>

                {data.purchases.length === 0 ? (
                  <div className="card p-12 text-center border-dashed bg-transparent">
                    <div className="w-16 h-16 bg-cream-brand rounded-full flex items-center justify-center mx-auto mb-4 text-brown-brand/30">
                      <ShoppingBag size={32} />
                    </div>
                    <p className="text-brown-brand/60 font-medium">Your purchase history is empty.</p>
                    <Link href="/store" className="text-amber-brand font-bold mt-2 inline-block hover:underline">Explore the store →</Link>
                  </div>
                ) : (
                  <div className="card overflow-hidden">
                    {removeError ? (
                      <p className="px-6 py-3 text-sm text-red-600 font-nunito border-b border-amber-brand/10 bg-red-50/50">
                        {removeError}
                      </p>
                    ) : null}
                    <div className="divide-y divide-amber-brand/10">
                      {data.purchases.map((raw) => {
                        const item = coercePurchase(raw);
                        const rid = removableOrderId(item);
                        const refShort =
                          item.stripe_session_id?.slice(0, 12) || item.id.slice(0, 12);
                        return (
                          <div
                            key={item.id}
                            className="p-6 sm:p-8 space-y-5 bg-white hover:bg-cream-brand/[0.15] transition-colors"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <p className="font-bold text-navy-brand text-lg font-playfair">
                                  Order #{item.order_code?.trim() || item.id.slice(0, 8)}
                                </p>
                                <p className="text-xs text-brown-brand/60 mt-1 font-nunito">
                                  {new Date(item.created_at).toLocaleDateString(undefined, {
                                    dateStyle: "medium",
                                  })}
                                </p>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-6">
                                <div className="text-left sm:text-right">
                                  <p className="text-[10px] uppercase tracking-widest text-brown-brand/50 font-bold">
                                    Amount
                                  </p>
                                  <p className="font-bold text-navy-brand">
                                    {formatMoney(item.amount_cents, item.currency)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-brown-brand/50 font-bold mb-1">
                                    Status
                                  </p>
                                  <PurchaseStatusBadge item={item} />
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-brown-brand/50 font-bold mb-1">
                                    Reference
                                  </p>
                                  <div
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-brown-brand/60 bg-gray-100/80 px-2 py-1 rounded font-mono select-all"
                                    title="Payment session reference"
                                  >
                                    {refShort}…
                                    <ExternalLink size={12} className="shrink-0 opacity-50" />
                                  </div>
                                </div>
                                <div className="sm:ml-auto">
                                  <p className="text-[10px] uppercase tracking-widest text-brown-brand/50 font-bold mb-1">
                                    Remove
                                  </p>
                                  {rid ? (
                                    <button
                                      type="button"
                                      className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 disabled:opacity-40"
                                      disabled={removingOrderId === rid}
                                      onClick={() => void removeOrder(rid)}
                                    >
                                      {removingOrderId === rid ? "…" : "Remove order"}
                                    </button>
                                  ) : (
                                    <span
                                      className="text-xs text-brown-brand/35"
                                      title="Completed orders stay on file"
                                    >
                                      —
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <PurchaseSlipUploadBlock
                              paymentId={item.id}
                              sessionId={item.stripe_session_id}
                              orderCode={item.order_code}
                              orderStatus={item.order_status}
                              paymentStatus={item.status}
                              onUploaded={refreshAccount}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
