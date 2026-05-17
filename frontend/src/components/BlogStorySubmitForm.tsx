"use client";

import { FormEvent, useState } from "react";
import { logClientError } from "@/lib/client-log";

const STORY_GENERIC =
  "We could not submit your story right now. Please try again in a moment.";

export default function BlogStorySubmitForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/community-voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName,
          email,
          story,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        logClientError("community-voices-submit", new Error("api not ok"), {
          status: res.status,
          body: data,
        });
        throw new Error("SUBMIT_FAILED");
      }
      setSuccess(true);
      setDisplayName("");
      setEmail("");
      setStory("");
    } catch (err) {
      logClientError("community-voices-submit", err);
      setError(STORY_GENERIC);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-[2rem] border border-red-200 bg-red-50 px-6 py-4 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-[2rem] border border-sage-brand/30 bg-sage-brand/10 px-6 py-4 text-sage-brand text-sm">
          Thank you. Your story has been submitted to our team.
        </div>
      )}
      <input
        name="displayName"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="w-full bg-cream-brand border border-navy-brand/10 rounded-[2rem] py-5 px-8 outline-none focus:ring-2 ring-amber-brand/20 font-nunito"
        placeholder="Your Name or 'Anonymous'"
        required
      />
      <input
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-cream-brand border border-navy-brand/10 rounded-[2rem] py-5 px-8 outline-none focus:ring-2 ring-amber-brand/20 font-nunito"
        placeholder="Email Address"
        required
      />
      <textarea
        name="story"
        rows={6}
        value={story}
        onChange={(e) => setStory(e.target.value)}
        className="w-full bg-cream-brand border border-navy-brand/10 rounded-[2rem] py-6 px-8 outline-none focus:ring-2 ring-amber-brand/20 font-nunito resize-none"
        placeholder="Share your reflection..."
        required
        minLength={20}
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full bg-amber-brand"
      >
        {loading ? "Submitting…" : "Submit Reflection"}
      </button>
      <p className="text-xs text-brown-brand/50 font-nunito text-center">
        Your submission is sent securely to our team email. We read every story with care.
      </p>
    </form>
  );
}
