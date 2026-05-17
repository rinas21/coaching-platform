"use client";

import { FormEvent, useMemo, useState } from "react";
import { getBackendApiUrl } from "@/lib/backend-api";
import { logClientError } from "@/lib/client-log";

const APPLICATION_GENERIC =
  "We could not submit your application. Please try again in a moment.";

type LevelValue = "diploma" | "bachelor" | "master";

export default function InternshipCvApplicationForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState<LevelValue>("diploma");
  const [message, setMessage] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submitUrl = useMemo(
    () => `${getBackendApiUrl()}/internship/applications`,
    [],
  );

  const validatePdf = (file: File): string | null => {
    const nameOk = file.name.toLowerCase().endsWith(".pdf");
    const typeOk = file.type === "application/pdf";
    if (!nameOk && !typeOk) return "Please upload a PDF CV file.";
    if (file.size > 10 * 1024 * 1024) return "CV file too large (max 10MB).";
    return null;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (fullName.trim().length < 2) return setError("Full name is required.");
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) return setError("Please enter a valid email address.");
    if (message.trim().length < 10) return setError("Please add a short message.");
    if (!cvFile) return setError("Please attach your CV PDF.");

    const pdfErr = validatePdf(cvFile);
    if (pdfErr) return setError(pdfErr);

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("level", level);
      formData.append("message", message.trim());
      formData.append("cv", cvFile);

      const res = await fetch(submitUrl, {
        method: "POST",
        body: formData,
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        applicationId?: string | null;
        error?: string;
      };

      if (!res.ok || data.ok === false) {
        logClientError("internship-application", new Error("application api not ok"), {
          status: res.status,
          body: data,
        });
        return setError(APPLICATION_GENERIC);
      }

      setSuccess(
        "Application received. Please check your inbox for confirmation.",
      );
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setCvFile(null);
    } catch (err) {
      logClientError("internship-application", err);
      setError(APPLICATION_GENERIC);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="intern-reveal bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-10 border border-amber-brand/10 shadow-lg">
      <h2 className="text-3xl font-playfair font-bold text-navy-brand mb-6">
        Apply to the Internship
      </h2>

      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 px-6 py-4 text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-[2rem] border border-sage-brand/30 bg-sage-brand/10 px-6 py-4 text-sage-brand text-sm">
            {success}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-cream-brand border border-navy-brand/10 rounded-[2rem] py-5 px-8 outline-none focus:ring-2 ring-amber-brand/20 font-nunito"
            placeholder="Full name"
            required
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-cream-brand border border-navy-brand/10 rounded-[2rem] py-5 px-8 outline-none focus:ring-2 ring-amber-brand/20 font-nunito"
            placeholder="Email address"
            type="email"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-cream-brand border border-navy-brand/10 rounded-[2rem] py-5 px-8 outline-none focus:ring-2 ring-amber-brand/20 font-nunito"
            placeholder="Phone (optional)"
          />

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as LevelValue)}
            className="w-full bg-cream-brand border border-navy-brand/10 rounded-[2rem] py-5 px-8 outline-none focus:ring-2 ring-amber-brand/20 font-nunito"
          >
            <option value="diploma">Diploma</option>
            <option value="bachelor">Bachelor&apos;s</option>
            <option value="master">Master&apos;s</option>
          </select>
        </div>

        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-cream-brand border border-navy-brand/10 rounded-[2rem] py-6 px-8 outline-none focus:ring-2 ring-amber-brand/20 font-nunito resize-none"
          placeholder="Short note about yourself (why you want to apply)"
          required
          minLength={10}
        />

        <div className="space-y-2">
          <label className="text-xs font-bold text-amber-brand uppercase tracking-widest px-3">
            CV (PDF)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setCvFile(file);
            }}
            className="block w-full text-sm text-navy-brand file:mr-4 file:rounded-full file:border-0 file:bg-amber-brand/20 file:px-6 file:py-3 file:text-xs file:font-bold file:uppercase file:tracking-widest"
            required
          />
          <p className="text-xs text-brown-brand/50 font-nunito">
            We attach your PDF to an email for review, but we do not store the CV file in the database.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full !bg-navy-brand hover:!bg-amber-brand disabled:opacity-60"
        >
          {loading ? "Submitting…" : "Submit Application"}
        </button>
      </form>
    </section>
  );
}

