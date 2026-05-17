"use client";

import { useState, type FormEvent } from "react";
import { PaymentSlipFileInput } from "@/components/PaymentSlipFileInput";
import { slipUploadConfirmationMessage, uploadOrderPaymentSlip } from "@/lib/backend-api";
import { logClientError } from "@/lib/client-log";

function canUploadBankSlip(p: {
  status: string;
  order_status?: string | null;
  stripe_session_id?: string | null;
  order_code?: string | null;
}): boolean {
  const pay = String(p.status || "").toLowerCase();
  if (pay === "succeeded" || pay === "paid") return false;
  const os = String(p.order_status || "").toUpperCase();
  if (os === "PAID") return false;
  if (os === "EXPIRED") return false;
  if (os === "PENDING_REVIEW") return false;
  const sid = String(p.stripe_session_id ?? "").trim();
  const code = String(p.order_code ?? "").trim();
  return Boolean(sid || code);
}

type Props = {
  paymentId: string;
  sessionId: string | null;
  orderCode?: string | null;
  orderStatus?: string | null;
  paymentStatus: string;
  onUploaded: () => void;
};

/**
 * Visible slip upload (or status text) for account / purchase history — not tied to table rows.
 */
export function PurchaseSlipUploadBlock({
  paymentId,
  sessionId,
  orderCode,
  orderStatus,
  paymentStatus,
  onUploaded,
}: Props) {
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fileKey, setFileKey] = useState(0);

  const pay = String(paymentStatus || "").toLowerCase();
  const os = String(orderStatus || "").toUpperCase();
  const eligible = canUploadBankSlip({
    status: paymentStatus,
    order_status: orderStatus,
    stripe_session_id: sessionId,
    order_code: orderCode,
  });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!slipFile) {
      setMessage("Choose your bank slip (PDF or image), then submit.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const uploadRes = await uploadOrderPaymentSlip({
        orderCode: orderCode?.trim() || undefined,
        sessionId: sessionId?.trim() || undefined,
        paymentReference: paymentRef.trim() || undefined,
        notes: notes.trim() || undefined,
        slipFile,
      });
      setMessage(
        slipUploadConfirmationMessage(uploadRes.orderCode),
      );
      setSlipFile(null);
      setPaymentRef("");
      setNotes("");
      setFileKey((k) => k + 1);
      onUploaded();
    } catch (err) {
      logClientError("account-slip-upload", err, { paymentId });
      const msg =
        err instanceof Error && err.message.trim()
          ? err.message.trim()
          : "Upload failed. Please try again.";
      setMessage(msg);
    } finally {
      setBusy(false);
    }
  };

  if (pay === "succeeded" || pay === "paid" || os === "PAID") {
    return null;
  }

  if (os === "EXPIRED") {
    return (
      <div className="rounded-xl border border-amber-brand/15 bg-white/60 px-4 py-3 text-sm text-brown-brand/80 font-nunito">
        This order has expired. Start a new checkout if you still need these items.
      </div>
    );
  }

  if (os === "PENDING_REVIEW") {
    return (
      <div className="rounded-xl border border-sky-200 bg-sky-50/90 px-4 py-3 text-sm text-navy-brand font-nunito">
        <p className="font-bold text-xs uppercase tracking-widest text-sky-900 mb-1">
          Slip received
        </p>
        <p className="text-brown-brand/85">
          We have your payment proof and are verifying your transfer. No need to upload again. The
          status above shows <strong>Verifying payment</strong> until we confirm.
        </p>
      </div>
    );
  }

  if (!eligible) {
    return (
      <div className="rounded-xl border border-amber-brand/20 bg-amber-brand/5 px-4 py-3 text-sm text-brown-brand/90 font-nunito">
        <p className="font-bold text-xs uppercase tracking-widest text-navy-brand mb-1">
          Payment slip
        </p>
        We couldn&apos;t attach an upload to this payment (missing order reference). Please contact
        support with your payment reference, or complete slip upload from checkout after placing an
        order.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-brand/25 bg-amber-brand/10 px-4 py-4 sm:px-5">
      <p className="text-xs font-bold uppercase tracking-widest text-navy-brand mb-1">
        Submit payment slip
      </p>
      <p className="text-xs text-brown-brand/75 font-nunito mb-3">
        Upload a screenshot or PDF of your bank transfer. Use the same order as above.
      </p>
      <form onSubmit={(ev) => void onSubmit(ev)} className="flex flex-col gap-2 max-w-lg">
        <input
          type="text"
          className="rounded-lg border border-amber-brand/25 px-3 py-2 text-sm bg-white"
          placeholder="Bank narration (optional)"
          value={paymentRef}
          onChange={(ev) => setPaymentRef(ev.target.value)}
        />
        <textarea
          className="rounded-lg border border-amber-brand/25 px-3 py-2 text-sm bg-white"
          placeholder="Note for admin (optional)"
          rows={2}
          value={notes}
          onChange={(ev) => setNotes(ev.target.value)}
        />
        <PaymentSlipFileInput
          inputKey={fileKey}
          file={slipFile}
          disabled={busy}
          onFileChange={(f) => {
            setSlipFile(f);
            if (f) setMessage(null);
          }}
        />
        {message ? (
          <p
            className="text-sm font-nunito rounded-lg border border-amber-brand/30 bg-white px-3 py-2 text-navy-brand"
            role="status"
          >
            {message}
          </p>
        ) : null}
        <button type="submit" className="btn-secondary self-start text-sm !py-2 !px-5" disabled={busy}>
          {busy ? "Sending…" : "Submit payment slip"}
        </button>
      </form>
    </div>
  );
}
