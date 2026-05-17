"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { submitWaitlist } from "@/lib/backend-api";
import { logClientError } from "@/lib/client-log";

const WAITLIST_GENERIC =
  "We could not add you to the waitlist right now. Please try again in a moment.";
import CaptchaField from "@/components/CaptchaField";

export default function WaitlistPage() {
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await submitWaitlist({
        email,
        source: "store_waitlist_page",
        captchaToken: captchaToken || undefined,
      });
      setSuccess(res.message);
      setEmail("");
    } catch (err) {
      logClientError("waitlist-submit", err);
      setError(WAITLIST_GENERIC);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-cream-brand/30 min-h-screen pt-40 px-6 pb-32">
      <section className="container max-w-4xl">
        <div className="text-center mb-16">
          <span className="text-amber-brand font-bold tracking-widest uppercase text-xs mb-6 block">
            Executive Store Waitlist
          </span>
          <h1 className="text-5xl md:text-6xl font-playfair font-bold text-navy-brand mb-8 leading-tight">
            Be first to know when
            <br />
            new resources launch.
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-brown-brand/70 font-nunito leading-relaxed">
            Join the waitlist for upcoming executive tools, strategic planners, and new releases from The Safe Space Global.
            We will email you as soon as something new is ready.
          </p>
        </div>

        <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-amber-brand/10 shadow-sm">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label htmlFor="waitlist-email" className="block text-xs font-bold text-amber-brand uppercase tracking-widest mb-3">
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-cream-brand/40 border border-amber-brand/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 ring-amber-brand/20 font-nunito text-navy-brand"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-sage-brand/20 bg-sage-brand/10 px-5 py-4 text-sm text-navy-brand">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (captchaEnabled && !captchaToken)}
              className="btn-primary w-full !bg-amber-brand border-amber-brand hover:!bg-orange-brand disabled:opacity-60"
            >
              {loading ? "Joining..." : "Join the Waitlist"}
            </button>
            <CaptchaField onToken={setCaptchaToken} />
          </form>

          <div className="mt-8 text-center text-sm text-brown-brand/60 font-nunito">
            <p>We will store your email securely and send launch updates directly to you.</p>
            <p className="mt-2">
              Looking for something available now? <Link href="/store" className="text-amber-brand font-bold">Return to the store</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
