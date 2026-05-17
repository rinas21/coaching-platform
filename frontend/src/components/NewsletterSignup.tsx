"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1500);
  };

  return (
    <div className="w-full py-12 md:py-16 border-b border-white/5 mb-16 md:mb-20">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
        <div className="w-full max-w-xl text-center lg:text-left">
          <h3 className="text-3xl md:text-4xl font-playfair font-bold text-white mb-4">
            Join the Executive Circle.
          </h3>
          <p className="text-white/60 font-nunito text-base md:text-lg">
            Receive monthly strategic insights on executive leadership, boardroom dynamics, and enterprise scaling. No spam, just high-impact strategy.
          </p>
        </div>

        <div className="w-full lg:w-auto md:min-w-[550px]">
          {status === "success" ? (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-6 bg-white/5 rounded-[2rem] border border-sage-brand/20 animate-fade-in text-center sm:text-left">
              <CheckCircle2 className="text-sage-brand w-8 h-8 shrink-0" />
              <div>
                <p className="font-bold text-white">You&apos;re on the list!</p>
                <p className="text-sm text-white/60">Thank you for joining our community.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:block sm:relative group gap-4">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 sm:py-6 px-6 sm:px-8 sm:pr-48 outline-none focus:border-amber-brand/50 focus:bg-white/10 transition-all font-nunito text-white placeholder:text-white/30 text-center sm:text-left"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="sm:absolute sm:right-2 sm:top-2 sm:bottom-2 w-full sm:w-auto bg-amber-brand hover:bg-white hover:text-navy-brand text-white py-4 sm:py-0 px-8 rounded-full font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group-hover:shadow-lg disabled:opacity-50"
              >
                {status === "loading" ? "Joining..." : (
                  <>
                    Send Me the Monthly Digest
                  </>
                )}
              </button>
            </form>
          )}
          <p className="mt-4 text-[10px] text-white/75 uppercase tracking-widest font-bold text-center lg:text-left sm:ml-6">
            By joining, you agree to our privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
