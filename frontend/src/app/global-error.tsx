"use client";

import { useEffect } from "react";
import { logClientError } from "@/lib/client-log";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logClientError(
      "global-error-boundary",
      error,
      error.digest ? { digest: error.digest } : undefined,
    );
  }, [error]);

  return (
    <html>
      <body className="bg-cream-brand/30 min-h-screen flex items-center">
        <main className="container max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-[2rem] border border-red-200 p-10 text-center">
            <h1 className="text-3xl font-playfair font-bold text-navy-brand mb-4">
              We could not render this page
            </h1>
            <p className="text-brown-brand/70 font-nunito mb-8">
              Please refresh or try again in a moment.
            </p>
            <button onClick={reset} className="btn-primary">
              Retry
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
