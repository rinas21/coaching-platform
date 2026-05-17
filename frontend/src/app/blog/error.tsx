"use client";

import { useEffect } from "react";
import { logClientError } from "@/lib/client-log";

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logClientError(
      "blog-error-boundary",
      error,
      error.digest ? { digest: error.digest } : undefined,
    );
  }, [error]);

  return (
    <main className="bg-cream-brand/30 min-h-screen pt-40 px-6 pb-32">
      <section className="container max-w-[900px]">
        <div className="bg-white rounded-[3rem] border border-red-200 px-10 py-14 text-center">
          <p className="text-[11px] uppercase tracking-widest font-bold text-red-500 mb-4">
            Blog Error
          </p>
          <h1 className="text-4xl font-playfair font-bold text-navy-brand mb-6">
            We could not load blog content.
          </h1>
          <p className="text-brown-brand/70 font-nunito mb-8">
            Please try again in a moment. If the problem continues, refresh the page.
          </p>
          <button type="button" onClick={reset} className="btn-primary">
            Retry
          </button>
        </div>
      </section>
    </main>
  );
}
