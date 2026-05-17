"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  ApiHttpError,
  createCheckoutSession,
  getMe,
  slipUploadConfirmationMessage,
  uploadOrderPaymentSlip,
  type CheckoutSessionResponse,
  type CheckoutShippingPayload,
} from "@/lib/backend-api";
import {
  cartTotalCents,
  getCart,
  removeLine,
  setCart,
  type CartLine,
} from "@/lib/cart";
import { PaymentSlipFileInput } from "@/components/PaymentSlipFileInput";
import { logClientError } from "@/lib/client-log";
import { randomUuidV4 } from "@/lib/random-uuid";

const CHECKOUT_GENERIC_ERROR =
  "We could not start checkout. Please try again in a moment.";

/** Must match API `CHECKOUT_SHIPPING_CENTS` (server recomputes; this is display-only). */
function checkoutShippingFeeCents(): number {
  const n = Number.parseInt(
    process.env.NEXT_PUBLIC_CHECKOUT_SHIPPING_CENTS || "0",
    10,
  );
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, 50_000_000);
}

function emptyShipping(): CheckoutShippingPayload {
  return {
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "LK",
  };
}

function validateShippingLocal(s: CheckoutShippingPayload): string | null {
  if (!s.fullName.trim()) return "Enter the recipient’s full name.";
  if (s.fullName.length > 120) return "Name is too long.";
  if (s.phone.replace(/\D/g, "").length < 8) return "Enter a valid phone number.";
  if (!s.addressLine1.trim()) return "Enter street address (line 1).";
  if (!s.city.trim()) return "Enter city or town.";
  if (!s.country.trim()) return "Enter country.";
  return null;
}

function checkoutCurrency(): string {
  return process.env.NEXT_PUBLIC_PAYHERE_CURRENCY || "LKR";
}

function formatMoney(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: checkoutCurrency(),
  }).format(cents / 100);
}

export default function CheckoutPage() {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [shipping, setShipping] = useState<CheckoutShippingPayload>(emptyShipping);
  const checkoutAttemptKeyRef = useRef<string | null>(null);
  const [bankOrder, setBankOrder] = useState<CheckoutSessionResponse | null>(null);
  const [reservingRef, setReservingRef] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPaymentRef, setSlipPaymentRef] = useState("");
  const [slipNotes, setSlipNotes] = useState("");
  const [slipMessage, setSlipMessage] = useState<string | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  /** Reset file input after successful upload (React keeps native value until remounted). */
  const [slipFileInputKey, setSlipFileInputKey] = useState(0);
  const shipFee = checkoutShippingFeeCents();

  const refresh = useCallback(() => setLines(getCart()), []);

  useEffect(() => {
    refresh();
    const onCart = () => refresh();
    window.addEventListener("safespace-cart-change", onCart);
    return () => window.removeEventListener("safespace-cart-change", onCart);
  }, [refresh]);

  useEffect(() => {
    getMe()
      .then((me) => {
        setLoggedIn(true);
        setShipping((prev) => ({
          ...prev,
          fullName:
            prev.fullName.trim() ||
            (me.user.displayName && me.user.displayName.trim()) ||
            "",
        }));
      })
      .catch((e) => {
        if (!(e instanceof ApiHttpError && e.status === 401)) {
          logClientError("checkout-auth-check", e);
        }
        setLoggedIn(false);
      });
  }, []);

  useEffect(() => {
    checkoutAttemptKeyRef.current = null;
  }, [lines]);

  const subtotal = cartTotalCents(lines);
  const orderTotalCents = subtotal + shipFee;

  const updateQty = (serviceId: string, delta: number) => {
    const cart = getCart();
    const line = cart.find((l) => l.serviceId === serviceId);
    if (!line) return;
    const next = line.quantity + delta;
    if (next < 1) {
      removeLine(serviceId);
    } else {
      const nextCart = cart.map((l) =>
        l.serviceId === serviceId ? { ...l, quantity: Math.min(99, next) } : l
      );
      setCart(nextCart);
    }
    refresh();
  };

  const buildShippingPayload = (): CheckoutShippingPayload | null => {
    const shippingPayload: CheckoutShippingPayload = {
      fullName: shipping.fullName.trim(),
      phone: shipping.phone.trim(),
      addressLine1: shipping.addressLine1.trim(),
      addressLine2: shipping.addressLine2?.trim() || undefined,
      city: shipping.city.trim(),
      region: shipping.region?.trim() || undefined,
      postalCode: shipping.postalCode?.trim() || undefined,
      country: shipping.country.trim(),
    };
    const shipErr = validateShippingLocal(shippingPayload);
    if (shipErr) {
      setError(shipErr);
      return null;
    }
    return shippingPayload;
  };

  /** Creates the order and shows bank reference + instructions; never redirects to PayHere automatically. */
  const generateBankTransferReference = async () => {
    if (!loggedIn) {
      router.push("/login?next=/checkout");
      return;
    }
    if (lines.length === 0) return;
    const shippingPayload = buildShippingPayload();
    if (!shippingPayload) return;
    setError(null);
    setSlipMessage(null);
    setReservingRef(true);
    try {
      const origin = window.location.origin;
      if (!checkoutAttemptKeyRef.current) {
        checkoutAttemptKeyRef.current = randomUuidV4();
      }
      const items = lines.map((l) => ({
        itemId: l.serviceId,
        quantity: l.quantity,
      }));
      const res = await createCheckoutSession({
        idempotencyKey: checkoutAttemptKeyRef.current,
        items,
        successUrl: `${origin}/checkout/success`,
        cancelUrl: `${origin}/checkout`,
        shipping: shippingPayload,
      });
      setBankOrder(res);
    } catch (e) {
      const trace =
        e instanceof ApiHttpError && e.traceId
          ? { checkoutTraceId: e.traceId }
          : undefined;
      logClientError("checkout-bank-ref", e, trace);
      if (e instanceof ApiHttpError) {
        const m = e.message?.trim();
        setError(m || CHECKOUT_GENERIC_ERROR);
      } else {
        setError(CHECKOUT_GENERIC_ERROR);
      }
    } finally {
      setReservingRef(false);
    }
  };

  const onSubmitSlipCheckout = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bankOrder?.sessionId && !bankOrder?.orderCode) {
      setSlipMessage("Generate an order reference first.");
      return;
    }
    if (!slipFile) {
      setSlipMessage("Attach a PDF or image of your bank payment slip, then submit.");
      return;
    }
    setUploadingSlip(true);
    setSlipMessage(null);
    try {
      const res = await uploadOrderPaymentSlip({
        orderCode: bankOrder.orderCode,
        sessionId: bankOrder.sessionId,
        paymentReference: slipPaymentRef.trim() || undefined,
        notes: slipNotes.trim() || undefined,
        slipFile,
      });
      setSlipMessage(slipUploadConfirmationMessage(res.orderCode));
      setSlipFile(null);
      setSlipNotes("");
      setSlipPaymentRef("");
      setSlipFileInputKey((k) => k + 1);
    } catch (err) {
      logClientError("checkout-slip-upload", err);
      const msg =
        err instanceof Error && err.message.trim()
          ? err.message.trim()
          : "Upload failed. Please try again.";
      setSlipMessage(msg);
    } finally {
      setUploadingSlip(false);
    }
  };

  return (
    <main className="section bg-cream-brand/30 min-h-screen pt-40">
      <div className="container max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <span className="text-amber-brand font-bold tracking-widest uppercase text-xs mb-4 block">Your Basket</span>
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-navy-brand mb-12">Review your selection.</h1>

            {lines.length === 0 ? (
              <div className="p-16 bg-white rounded-[3rem] text-center border border-amber-brand/10 shadow-sm">
                <p className="text-xl text-brown-brand/60 font-nunito italic mb-8">Your cart is currently empty.</p>
                <Link href="/store" className="btn-primary">
                  Explore Wellness Resources
                </Link>
              </div>
            ) : (
              <ul className="space-y-6">
                {lines.map((line) => (
                  <li key={line.serviceId} className="p-8 bg-white rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 border border-amber-brand/5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1 w-full">
                      <h3 className="text-xl font-playfair font-bold text-navy-brand mb-2">{line.name}</h3>
                      {line.description && <p className="text-sm text-brown-brand/60 font-nunito line-clamp-1">{line.description}</p>}
                    </div>
                    
                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex items-center bg-cream-brand/50 rounded-full px-4 py-2 border border-amber-brand/10">
                        <button 
                          type="button" 
                          onClick={() => updateQty(line.serviceId, -1)}
                          className="w-8 h-8 flex items-center justify-center text-navy-brand/40 hover:text-amber-brand transition-colors text-xl"
                        >
                          −
                        </button>
                        <span className="mx-4 font-bold text-navy-brand w-4 text-center">{line.quantity}</span>
                        <button 
                          type="button" 
                          onClick={() => updateQty(line.serviceId, 1)}
                          className="w-8 h-8 flex items-center justify-center text-navy-brand/40 hover:text-amber-brand transition-colors text-xl"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-navy-brand">{formatMoney(line.priceCents * line.quantity)}</span>
                        <button
                          type="button"
                          className="text-xs text-red-400 hover:text-red-600 font-bold uppercase tracking-widest mt-1"
                          onClick={() => {
                            removeLine(line.serviceId);
                            refresh();
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            <Link href="/store" className="inline-block mt-8 text-amber-brand font-bold uppercase tracking-widest text-xs hover:text-navy-brand transition-colors">
              ← Continue Exploring
            </Link>

            {lines.length > 0 && loggedIn && (
              <section className="mt-16 p-8 md:p-10 bg-white rounded-[2.5rem] border border-amber-brand/10 shadow-sm">
                <h2 className="text-2xl font-playfair font-bold text-navy-brand mb-2">
                  Delivery &amp; contact
                </h2>
                <p className="text-sm text-brown-brand/70 font-nunito mb-8 max-w-xl">
                  We store this with your order for bank-transfer verification and shipping. It is only visible to you and authorised staff.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5 text-sm font-nunito text-navy-brand">
                    <span>Full name *</span>
                    <input
                      className="rounded-xl border border-amber-brand/20 px-4 py-3"
                      value={shipping.fullName}
                      onChange={(e) =>
                        setShipping((s) => ({ ...s, fullName: e.target.value }))
                      }
                      autoComplete="name"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-nunito text-navy-brand">
                    <span>Phone *</span>
                    <input
                      className="rounded-xl border border-amber-brand/20 px-4 py-3"
                      value={shipping.phone}
                      onChange={(e) =>
                        setShipping((s) => ({ ...s, phone: e.target.value }))
                      }
                      autoComplete="tel"
                    />
                  </label>
                  <label className="sm:col-span-2 flex flex-col gap-1.5 text-sm font-nunito text-navy-brand">
                    <span>Address line 1 *</span>
                    <input
                      className="rounded-xl border border-amber-brand/20 px-4 py-3"
                      value={shipping.addressLine1}
                      onChange={(e) =>
                        setShipping((s) => ({ ...s, addressLine1: e.target.value }))
                      }
                      autoComplete="address-line1"
                    />
                  </label>
                  <label className="sm:col-span-2 flex flex-col gap-1.5 text-sm font-nunito text-navy-brand">
                    <span>Address line 2</span>
                    <input
                      className="rounded-xl border border-amber-brand/20 px-4 py-3"
                      value={shipping.addressLine2 || ""}
                      onChange={(e) =>
                        setShipping((s) => ({ ...s, addressLine2: e.target.value }))
                      }
                      autoComplete="address-line2"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-nunito text-navy-brand">
                    <span>City *</span>
                    <input
                      className="rounded-xl border border-amber-brand/20 px-4 py-3"
                      value={shipping.city}
                      onChange={(e) =>
                        setShipping((s) => ({ ...s, city: e.target.value }))
                      }
                      autoComplete="address-level2"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-nunito text-navy-brand">
                    <span>Region / state</span>
                    <input
                      className="rounded-xl border border-amber-brand/20 px-4 py-3"
                      value={shipping.region || ""}
                      onChange={(e) =>
                        setShipping((s) => ({ ...s, region: e.target.value }))
                      }
                      autoComplete="address-level1"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-nunito text-navy-brand">
                    <span>Postal code</span>
                    <input
                      className="rounded-xl border border-amber-brand/20 px-4 py-3"
                      value={shipping.postalCode || ""}
                      onChange={(e) =>
                        setShipping((s) => ({ ...s, postalCode: e.target.value }))
                      }
                      autoComplete="postal-code"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-nunito text-navy-brand">
                    <span>Country *</span>
                    <input
                      className="rounded-xl border border-amber-brand/20 px-4 py-3"
                      value={shipping.country}
                      onChange={(e) =>
                        setShipping((s) => ({ ...s, country: e.target.value }))
                      }
                      autoComplete="country-name"
                    />
                  </label>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={reservingRef}
                    onClick={() => void generateBankTransferReference()}
                  >
                    {reservingRef ? "Creating order…" : "Generate bank transfer reference"}
                  </button>
                  <p className="text-xs text-brown-brand/60 font-nunito sm:max-w-[220px] sm:self-center">
                    Saves your delivery details and issues an order ID for your bank transfer. You can upload proof below (optional).
                  </p>
                </div>
              </section>
            )}

            {bankOrder?.orderCode && loggedIn && (
              <section className="mt-16 p-8 md:p-10 bg-white rounded-[2.5rem] border border-amber-brand/10 shadow-sm">
                <h3 className="text-lg font-playfair font-bold text-navy-brand mb-2">
                  Your order reference
                </h3>
                <p className="text-sm text-brown-brand/80 font-nunito mb-4">
                  Use this reference in your bank transfer narration. Amount:{" "}
                  <strong>
                    {formatMoney(
                      typeof bankOrder.totalCents === "number"
                        ? bankOrder.totalCents
                        : orderTotalCents,
                    )}
                  </strong>
                </p>
                <p className="font-mono text-lg font-bold text-navy-brand mb-1">{bankOrder.orderCode}</p>
                {bankOrder.sessionId ? (
                  <p className="text-xs text-brown-brand/50 font-nunito break-all mb-4">
                    Payment session: {bankOrder.sessionId}
                  </p>
                ) : null}
                {bankOrder.bankInstructions && (
                  <div className="rounded-xl border border-amber-brand/20 bg-white/80 p-4 text-sm text-brown-brand/90 font-nunito whitespace-pre-wrap mb-4">
                    {bankOrder.bankInstructions}
                  </div>
                )}
                {bankOrder.whatsappLink && (
                  <a
                    href={bankOrder.whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline inline-block mb-4"
                  >
                    Message us on WhatsApp
                  </a>
                )}
                <div className="mt-8 border-t border-amber-brand/15 pt-8">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-navy-brand mb-2">
                    Submit payment slip
                  </h4>
                  <p className="text-xs text-brown-brand/65 font-nunito mb-4">
                    After you pay the bank, choose a file below — you should see its name under the picker, then submit. Our team will see your slip in the admin dashboard.
                  </p>
                  <form onSubmit={onSubmitSlipCheckout} className="space-y-3">
                    <input
                      type="text"
                      className="w-full rounded-xl border border-amber-brand/20 px-4 py-3 text-sm"
                      placeholder="Bank reference / narration (optional)"
                      value={slipPaymentRef}
                      onChange={(e) => setSlipPaymentRef(e.target.value)}
                    />
                    <textarea
                      className="w-full rounded-xl border border-amber-brand/20 px-4 py-3 text-sm"
                      placeholder="Note for admin (optional)"
                      rows={2}
                      value={slipNotes}
                      onChange={(e) => setSlipNotes(e.target.value)}
                    />
                    <PaymentSlipFileInput
                      inputKey={slipFileInputKey}
                      file={slipFile}
                      disabled={uploadingSlip}
                      onFileChange={(f) => {
                        setSlipFile(f);
                        if (f) setSlipMessage(null);
                      }}
                    />
                    {slipMessage ? (
                      <p
                        className="text-sm text-navy-brand font-nunito rounded-xl border border-amber-brand/30 bg-amber-brand/10 px-4 py-3"
                        role="status"
                      >
                        {slipMessage}
                      </p>
                    ) : null}
                    <button type="submit" className="btn-secondary" disabled={uploadingSlip}>
                      {uploadingSlip ? "Sending…" : "Submit payment slip"}
                    </button>
                  </form>
                </div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-navy-brand rounded-[3rem] p-10 text-cream-brand shadow-2xl overflow-hidden lg:sticky lg:top-40">
              <div className="relative z-10">
                <h2 className="text-2xl font-playfair font-bold mb-8">Summary</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-cream-brand/60 font-nunito">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-cream-brand/60 font-nunito">
                    <span>Delivery / handling</span>
                    <span>{shipFee > 0 ? formatMoney(shipFee) : "Included"}</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xl font-playfair font-bold">Total</span>
                    <span className="text-3xl font-playfair font-bold text-amber-brand">
                      {formatMoney(orderTotalCents)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-cream-brand/40 font-nunito mb-10 leading-relaxed italic">
                  Payments are not processed on this site. Use <strong>Generate bank transfer reference</strong> to save your order and see bank details, then submit your slip in the same section so we can verify your transfer.
                </p>

                {!loggedIn && (
                  <div className="bg-white/5 p-6 rounded-2xl mb-8 border border-white/10">
                    <p className="text-sm font-nunito">
                      <Link href="/login?next=/checkout" className="text-amber-brand font-bold underline">Sign in</Link> to complete your journey. Your resources will be saved to your dashboard.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm mb-8 font-nunito">
                    {error}
                  </div>
                )}

              </div>

              {/* Decorative background elements for aside */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-brand/10 rounded-full blur-3xl shadow-inner" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-brand/5 rounded-full blur-3xl" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
