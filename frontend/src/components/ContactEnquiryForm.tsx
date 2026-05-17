"use client";

import { FormEvent, useState } from "react";
import CaptchaField from "@/components/CaptchaField";
import { logClientError } from "@/lib/client-log";

const CONTACT_GENERIC =
  "We could not send your message right now. Please try again in a moment.";

export default function ContactEnquiryForm() {
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("General Enquiry");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const submit = async (payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
    captchaToken?: string;
  }) => {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      logClientError("contact-enquiry", new Error("contact api not ok"), {
        status: res.status,
        body: data,
      });
      throw new Error("CONTACT_FAILED");
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submit({
        name,
        email,
        subject: topic,
        message,
        captchaToken: captchaToken || undefined,
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setTopic("General Enquiry");
      setMessage("");
    } catch (err) {
      logClientError("contact-enquiry-submit", err);
      setError(CONTACT_GENERIC);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative z-10 py-12 text-center text-navy-brand">
        <p className="font-playfair text-xl italic mb-4">Thank you.</p>
        <p className="text-sm font-nunito opacity-70">
          Your letter has been received. We aim to respond within two business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 relative z-10 flex-1 flex flex-col">
      {error && (
        <div className="rounded-sm border border-red-400/40 bg-red-50 px-4 py-3 text-sm text-red-900 font-nunito">
          <p>{error}</p>
          <button
            type="button"
            className="mt-2 text-xs uppercase tracking-wider underline text-red-900/90 hover:text-red-900"
            onClick={() => {
              if (loading) return;
              setLoading(true);
              void submit({
                name,
                email,
                subject: topic,
                message,
                captchaToken: captchaToken || undefined,
              })
                .then(() => {
                  setError(null);
                  setSuccess(true);
                  setName("");
                  setEmail("");
                  setTopic("General Enquiry");
                  setMessage("");
                })
                .catch((retryErr) => {
                  logClientError("contact-enquiry-retry", retryErr);
                  setError(CONTACT_GENERIC);
                })
                .finally(() => setLoading(false));
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div>
        <label className="block text-[10px] font-bold text-[#8c5e1c] uppercase tracking-widest mb-2">
          Your name
        </label>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent border-b border-black/20 pb-2 outline-none font-playfair italic text-navy-brand placeholder:text-navy-brand/30 focus:border-[#8c5e1c] transition-colors"
          placeholder="Full name"
          required
          minLength={2}
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold text-[#8c5e1c] uppercase tracking-widest mb-2">
          Your email address
        </label>
        <input
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent border-b border-black/20 pb-2 outline-none font-playfair italic text-navy-brand placeholder:text-navy-brand/30 focus:border-[#8c5e1c] transition-colors"
          placeholder="email@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold text-[#8c5e1c] uppercase tracking-widest mb-2">
          Type of enquiry
        </label>
        <div className="relative">
          <select
            name="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-transparent border-b border-black/20 pb-2 outline-none font-playfair italic text-navy-brand focus:border-[#8c5e1c] transition-colors appearance-none cursor-pointer"
          >
            <option value="General Enquiry">General Enquiry</option>
            <option value="School Partnership">School Partnership</option>
            <option value="Corporate Wellbeing">Corporate Wellbeing</option>
            <option value="Internship Enquiry">Internship Enquiry</option>
          </select>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-navy-brand/40 pb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <label className="block text-[10px] font-bold text-[#8c5e1c] uppercase tracking-widest mb-2">
          Your message
        </label>
        <textarea
          name="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full flex-1 bg-transparent border-0 outline-none font-playfair italic text-navy-brand placeholder:text-navy-brand/30 resize-none"
          style={{
            backgroundImage: "linear-gradient(to bottom, transparent 39px, rgba(0,0,0,0.3) 40px)",
            backgroundSize: "100% 40px",
            lineHeight: "40px",
            minHeight: "200px"
          }}
          placeholder="Tell us a little about what brings you here — there is no wrong way to start."
          required
          minLength={15}
        />
      </div>

      <button
        type="submit"
        disabled={loading || (captchaEnabled && !captchaToken)}
        className="mt-6 bg-[#8c5e1c] text-white py-4 px-8 uppercase tracking-widest text-sm font-semibold hover:bg-[#784e14] transition-colors rounded-sm shadow-md flex items-center justify-center gap-3 w-fit disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send message"}
        {!loading && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        )}
      </button>

      <div className="hidden">
        <CaptchaField onToken={setCaptchaToken} theme="light" />
      </div>
    </form>
  );
}

