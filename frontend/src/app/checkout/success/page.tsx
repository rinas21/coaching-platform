"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  slipUploadConfirmationMessage,
  uploadOrderPaymentSlip,
  verifyCheckoutSession,
  type CheckoutVerifyResponse,
  type CheckoutVerifyStatus,
} from "@/lib/backend-api";
import { PaymentSlipFileInput } from "@/components/PaymentSlipFileInput";
import { logClientError } from "@/lib/client-log";

function SuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<CheckoutVerifyStatus>("pending");
  const [details, setDetails] = useState<CheckoutVerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentReference, setPaymentReference] = useState("");
  const [notes, setNotes] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipFileInputKey, setSlipFileInputKey] = useState(0);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipMessage, setSlipMessage] = useState<string | null>(null);
  const [cardVerifyExhausted, setCardVerifyExhausted] = useState(false);

  const canVerify = useMemo(() => Boolean(sessionId), [sessionId]);

  useEffect(() => {
    if (!canVerify || !sessionId) {
      logClientError("checkout-success-verify", new Error("missing session_id"));
      setStatus("failed");
      setLoading(false);
      return;
    }

    let cancelled = false;
    let pollCount = 0;
    const maxPollsPayHere = 8;

    const poll = async () => {
      try {
        const next = await verifyCheckoutSession(sessionId);
        if (cancelled) return;
        setStatus(next.status);
        setDetails(next);
        setLoading(false);
        if (next.status !== "pending") return;
        if (next.manualPayment) {
          return;
        }
        if (pollCount < maxPollsPayHere) {
          pollCount += 1;
          window.setTimeout(poll, 2500);
        } else {
          setCardVerifyExhausted(true);
        }
      } catch (e) {
        if (cancelled) return;
        logClientError("checkout-success-verify", e, { sessionId });
        setLoading(false);
        setStatus("failed");
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [canVerify, sessionId]);

  const onSubmitSlip = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!slipFile) {
      setSlipMessage("Please choose your payment slip file.");
      return;
    }
    if (!details?.orderCode && !sessionId) {
      logClientError("checkout-success-slip", new Error("missing order/session"));
      setSlipMessage("We could not attach your slip right now. Please refresh and try again.");
      return;
    }
    setUploadingSlip(true);
    setSlipMessage(null);
    try {
      const res = await uploadOrderPaymentSlip({
        orderCode: details?.orderCode,
        sessionId: sessionId || undefined,
        paymentReference: paymentReference.trim() || undefined,
        notes: notes.trim() || undefined,
        slipFile,
      });
      setSlipMessage(slipUploadConfirmationMessage(res.orderCode));
      setSlipFile(null);
      setSlipFileInputKey((k) => k + 1);
      setNotes("");
    } catch (err) {
      logClientError("checkout-success-slip-upload", err);
      setSlipMessage(
        err instanceof Error && err.message.trim()
          ? err.message.trim()
          : "We could not upload your slip. Please try again in a moment.",
      );
    } finally {
      setUploadingSlip(false);
    }
  };

  return (
    <main className="section checkout-success">
      <div className="container" style={{ maxWidth: 560, textAlign: "center" }}>
        <div className="card" style={{ padding: "2.5rem" }}>
          {loading ? (
            <>
              <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
                Loading order…
              </h1>
              <div
                aria-label="Loading"
                className="mx-auto my-4 h-10 w-10 rounded-full border-4 border-amber-brand/25 border-t-amber-brand animate-spin"
              />
            </>
          ) : status === "pending" && !details?.manualPayment && !cardVerifyExhausted ? (
            <>
              <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
                Verifying card payment…
              </h1>
              <div
                aria-label="Verifying payment"
                className="mx-auto my-4 h-10 w-10 rounded-full border-4 border-amber-brand/25 border-t-amber-brand animate-spin"
              />
              <p className="section-subtitle" style={{ marginBottom: "1.5rem" }}>
                We are waiting for confirmation from PayHere. This can take a few moments.
              </p>
            </>
          ) : status === "pending" && !details?.manualPayment && cardVerifyExhausted ? (
            <>
              <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
                Payment still pending
              </h1>
              <p className="section-subtitle" style={{ marginBottom: "1.5rem" }}>
                We could not confirm your card payment automatically yet. Check your PayHere receipt or contact support with your order ID below.
              </p>
            </>
          ) : status === "success" ? (
            <>
              <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
                Payment confirmed
              </h1>
              <p className="section-subtitle" style={{ marginBottom: "1.5rem" }}>
                Thank you. Your payment is confirmed and will appear under <strong>My account</strong>.
              </p>
            </>
          ) : status === "pending" && details?.manualPayment ? (
            <>
              <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
                Order placed — bank transfer
              </h1>
              <p className="section-subtitle" style={{ marginBottom: "1.5rem" }}>
                Complete your transfer using the bank details below. Uploading proof is optional; an administrator will mark your order complete after verifying payment.
              </p>
            </>
          ) : (
            <>
              <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
                Payment not confirmed
              </h1>
              <p className="section-subtitle" style={{ marginBottom: "1.5rem" }}>
                We could not confirm this payment yet. Please retry checkout or contact support.
              </p>
            </>
          )}
          {sessionId && (
            <p className="store-muted" style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>
              Reference: {sessionId}
            </p>
          )}
          {details?.orderCode && (
            <p className="store-muted" style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
              Order ID: <strong>{details.orderCode}</strong>
            </p>
          )}
          {status === "pending" &&
          details?.bankInstructions &&
          (details.manualPayment || cardVerifyExhausted) ? (
            <div
              style={{
                marginTop: "1rem",
                textAlign: "left",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                borderRadius: "1rem",
                padding: "1rem",
                background: "rgba(245, 158, 11, 0.06)",
              }}
            >
              <p className="store-muted" style={{ marginBottom: "0.5rem", fontWeight: 700 }}>
                Waiting for payment
              </p>
              <p className="store-muted" style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                {details.bankInstructions}
              </p>
              {details.whatsappLink && (
                <a
                  href={details.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  Send Slip via WhatsApp
                </a>
              )}
              <form onSubmit={onSubmitSlip} style={{ marginTop: "1rem" }}>
                <p className="store-muted" style={{ marginBottom: "0.5rem", fontWeight: 700 }}>
                  Upload payment slip
                </p>
                <input
                  type="text"
                  placeholder="Payment reference (optional)"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full rounded-xl border border-amber-brand/30 bg-white p-3 text-sm mb-2"
                />
                <textarea
                  placeholder="Note for admin (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-amber-brand/30 bg-white p-3 text-sm mb-2"
                  rows={2}
                />
                <PaymentSlipFileInput
                  inputKey={slipFileInputKey}
                  file={slipFile}
                  disabled={uploadingSlip}
                  compact
                  className="mb-3"
                  onFileChange={(f) => {
                    setSlipFile(f);
                    if (f) setSlipMessage(null);
                  }}
                />
                <button type="submit" className="btn-primary" disabled={uploadingSlip}>
                  {uploadingSlip ? "Uploading..." : "Submit Slip"}
                </button>
                {slipMessage && (
                  <p className="store-muted" style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
                    {slipMessage}
                  </p>
                )}
              </form>
            </div>
          ) : null}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.5rem" }}>
            {status === "success" ? (
              <>
                <Link href="/account" className="btn-primary">
                  View my account
                </Link>
                <Link href="/store" className="btn-secondary">
                  Back to store
                </Link>
              </>
            ) : (
              <>
                <Link href="/checkout" className="btn-primary">
                  Retry checkout
                </Link>
                <Link href="/contact" className="btn-secondary">
                  Contact support
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<main className="section"><div className="container"><p>Loading…</p></div></main>}>
      <SuccessInner />
    </Suspense>
  );
}
