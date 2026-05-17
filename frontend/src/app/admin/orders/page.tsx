"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authLogout } from "@/lib/backend-api";
import { logClientError } from "@/lib/client-log";

const ADMIN_ORDERS_GENERIC = "Something went wrong. Please refresh and try again.";
const ADMIN_MARK_PAID_GENERIC =
  "We could not update that order. Please try again in a moment.";

type SnapshotItem = {
  name?: string;
  quantity?: number;
  unitPriceCents?: number;
  lineTotalCents?: number;
};

type ItemsSnapshot = {
  currency?: string;
  subtotal_cents?: number;
  shipping_cents?: number;
  total_cents?: number;
  items?: SnapshotItem[];
};

type AdminOrder = {
  id: string;
  order_code: string;
  status: string;
  total_amount_cents: number;
  currency: string;
  customer_email: string;
  created_at: string;
  items_snapshot?: ItemsSnapshot | null;
  slip_id?: string | null;
  slip_filename?: string | null;
  slip_payment_reference?: string | null;
  slip_notes?: string | null;
  slip_created_at?: string | null;
  payment_verified_at?: string | null;
  ship_full_name?: string | null;
  ship_phone?: string | null;
  ship_line1?: string | null;
  ship_line2?: string | null;
  ship_city?: string | null;
  ship_region?: string | null;
  ship_postal?: string | null;
  ship_country?: string | null;
};

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: String(currency || "LKR").toUpperCase(),
  }).format((Number(cents) || 0) / 100);
}

function formatAdminDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusHeading(status: string): string {
  const s = String(status || "").toUpperCase();
  if (s === "PAID") return "Payment verified";
  if (s === "PENDING_REVIEW") return "Awaiting verification";
  if (s === "PENDING_PAYMENT") return "Awaiting payment";
  return status || "—";
}

function AdminOrderLineItems({
  snapshot,
  orderCurrency,
}: {
  snapshot: ItemsSnapshot | null | undefined;
  orderCurrency: string;
}) {
  const items = Array.isArray(snapshot?.items) ? snapshot!.items! : [];
  if (items.length === 0) return null;
  const cur = String(snapshot?.currency || orderCurrency || "LKR").toUpperCase();
  const sub = snapshot?.subtotal_cents;
  const ship = snapshot?.shipping_cents;

  return (
    <div className="mt-4 rounded-2xl border border-amber-brand/15 bg-white/80 p-4 text-sm font-nunito text-brown-brand/90">
      <p className="text-xs font-bold uppercase tracking-widest text-amber-brand mb-3">Order items</p>
      <ul className="space-y-2">
        {items.map((it, idx) => (
          <li key={`${it.name}-${idx}`} className="flex flex-wrap justify-between gap-2 border-b border-amber-brand/10 pb-2 last:border-0 last:pb-0">
            <span className="text-navy-brand font-medium">
              {it.name || "Item"}
              {it.quantity != null && it.quantity > 1 ? ` × ${it.quantity}` : ""}
            </span>
            <span className="tabular-nums">
              {formatMoney(Number(it.lineTotalCents) || 0, cur)}
            </span>
          </li>
        ))}
      </ul>
      {typeof sub === "number" ? (
        <p className="mt-3 flex justify-between text-xs text-brown-brand/70">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatMoney(sub, cur)}</span>
        </p>
      ) : null}
      {typeof ship === "number" && ship > 0 ? (
        <p className="mt-1 flex justify-between text-xs text-brown-brand/70">
          <span>Delivery / handling</span>
          <span className="tabular-nums">{formatMoney(ship, cur)}</span>
        </p>
      ) : null}
    </div>
  );
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [authChecking, setAuthChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [confirmMeta, setConfirmMeta] = useState<Record<string, { reference: string; notes: string }>>({});

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        orders?: AdminOrder[];
      };
      if (!res.ok) {
        logClientError("admin-orders-load", new Error("api not ok"), {
          status: res.status,
          body: data,
        });
        setError(ADMIN_ORDERS_GENERIC);
        setOrders([]);
        return;
      }
      setOrders(data.orders || []);
    } catch (e) {
      logClientError("admin-orders-load", e);
      setError(ADMIN_ORDERS_GENERIC);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const meRes = await fetch("/api/admin/me", { cache: "no-store" });
        const meData = (await meRes.json().catch(() => ({}))) as {
          admin?: { email?: string };
        };
        if (!meRes.ok || !meData.admin?.email) {
          router.replace("/admin/login?next=/admin/orders");
          return;
        }
        setAdminEmail(meData.admin.email);
        await loadOrders();
      } finally {
        setAuthChecking(false);
      }
    };
    void bootstrap();
  }, [router]);

  const signOut = async () => {
    try {
      await authLogout();
    } catch {
      // ignore
    }
    router.replace("/admin/login");
  };

  const markPaid = async (order: AdminOrder) => {
    setBusyOrderId(order.id);
    setError(null);
    try {
      const meta = confirmMeta[order.id] || { reference: "", notes: "" };
      const res = await fetch("/api/admin/orders/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          orderCode: order.order_code,
          paymentReference: meta.reference.trim() || undefined,
          notes: meta.notes.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        logClientError("admin-orders-mark-paid", new Error("api not ok"), {
          status: res.status,
          body: data,
        });
        setError(ADMIN_MARK_PAID_GENERIC);
        return;
      }
      await loadOrders();
    } catch (e) {
      logClientError("admin-orders-mark-paid", e);
      setError(ADMIN_MARK_PAID_GENERIC);
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <main className="bg-cream-brand/30 min-h-screen pt-40 px-6 pb-32">
      <div className="mx-auto max-w-[1240px]">
        <h1 className="text-4xl md:text-5xl font-playfair font-bold text-navy-brand mb-3">
          Admin Payment Portal
        </h1>
        <p className="text-brown-brand/70 font-nunito mb-10">
          Review uploaded slips and confirm payments.
        </p>
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-brown-brand/60 font-nunito">
            {adminEmail ? `Logged in as ${adminEmail}` : ""}
          </p>
          <button type="button" className="btn-secondary" onClick={signOut}>
            Sign out
          </button>
        </div>
        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}
        {authChecking || loading ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-amber-brand/10">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-amber-brand/10">
            No orders to show yet.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const meta = confirmMeta[order.id] || { reference: "", notes: "" };
              const isPaid = String(order.status || "").toUpperCase() === "PAID";
              const verifiedLabel = formatAdminDate(order.payment_verified_at);
              return (
                <div
                  key={order.id}
                  className={`rounded-[2rem] bg-white p-6 border shadow-sm ${
                    isPaid ? "border-emerald-200/80 ring-1 ring-emerald-100/80" : "border-amber-brand/10"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p
                        className={`text-xs uppercase tracking-widest font-bold ${
                          isPaid ? "text-emerald-700" : "text-amber-brand"
                        }`}
                      >
                        {statusHeading(order.status)}
                      </p>
                      <h2 className="text-2xl font-playfair font-bold text-navy-brand">
                        {order.order_code}
                      </h2>
                      <p className="text-sm text-brown-brand/70 font-nunito">
                        {order.customer_email} • {formatMoney(order.total_amount_cents, order.currency)}
                      </p>
                      <p className="text-xs text-brown-brand/50 font-nunito mt-1">
                        Placed {formatAdminDate(order.created_at)}
                      </p>
                    </div>
                    <a
                      href={`/api/admin/orders/${order.id}/slip`}
                      target="_blank"
                      rel="noreferrer"
                      className={isPaid ? "btn-outline" : "btn-secondary"}
                    >
                      {order.slip_id ? "View Uploaded Slip" : "No Slip Uploaded"}
                    </a>
                  </div>
                  <AdminOrderLineItems
                    snapshot={order.items_snapshot ?? undefined}
                    orderCurrency={order.currency}
                  />
                  {(order.slip_payment_reference || order.slip_notes) && (
                    <div className="mt-4 rounded-2xl border border-amber-brand/15 bg-amber-brand/5 p-4 text-sm font-nunito text-brown-brand/90">
                      <p className="text-xs font-bold uppercase tracking-widest text-amber-brand mb-2">
                        Customer slip details
                      </p>
                      {order.slip_payment_reference ? (
                        <p>
                          <span className="text-brown-brand/60">Reference: </span>
                          {order.slip_payment_reference}
                        </p>
                      ) : null}
                      {order.slip_notes ? (
                        <p className={order.slip_payment_reference ? "mt-2" : ""}>
                          <span className="text-brown-brand/60">Note: </span>
                          {order.slip_notes}
                        </p>
                      ) : null}
                    </div>
                  )}
                  {order.ship_line1 && (
                    <div className="mt-4 rounded-2xl border border-amber-brand/15 bg-cream-brand/30 p-4 text-sm font-nunito text-brown-brand/90">
                      <p className="text-xs font-bold uppercase tracking-widest text-amber-brand mb-2">
                        Ship to
                      </p>
                      <p className="font-semibold text-navy-brand">{order.ship_full_name}</p>
                      <p>{order.ship_phone}</p>
                      <p className="mt-2">
                        {order.ship_line1}
                        {order.ship_line2 ? <>, {order.ship_line2}</> : null}
                        <br />
                        {order.ship_city}
                        {order.ship_region ? `, ${order.ship_region}` : ""}{" "}
                        {order.ship_postal || ""}
                        <br />
                        {order.ship_country}
                      </p>
                    </div>
                  )}
                  {isPaid ? (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm font-nunito text-emerald-900">
                      This order is complete. All details above stay on file for your records.
                      {verifiedLabel ? ` Verified ${verifiedLabel}.` : ""}
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 grid md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          className="rounded-xl border border-amber-brand/20 p-3 text-sm"
                          placeholder="Payment reference"
                          value={meta.reference}
                          onChange={(e) =>
                            setConfirmMeta((prev) => ({
                              ...prev,
                              [order.id]: { ...meta, reference: e.target.value },
                            }))
                          }
                        />
                        <input
                          type="text"
                          className="rounded-xl border border-amber-brand/20 p-3 text-sm"
                          placeholder="Notes"
                          value={meta.notes}
                          onChange={(e) =>
                            setConfirmMeta((prev) => ({
                              ...prev,
                              [order.id]: { ...meta, notes: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          className="btn-primary"
                          disabled={busyOrderId === order.id}
                          onClick={() => markPaid(order)}
                        >
                          {busyOrderId === order.id
                            ? "Confirming..."
                            : "Mark payment verified (complete order)"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
