"use client";

import { useEffect } from "react";
import { logClientError } from "@/lib/client-log";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logClientError(
      "app-error-boundary",
      error,
      error.digest ? { digest: error.digest } : undefined,
    );
  }, [error]);

  return (
    <main className="section bg-cream-brand/30 min-h-screen flex items-center">
      <div className="container max-w-2xl">
        <div className="bg-white rounded-[2rem] border border-red-200 p-10 text-center">
          <h1 className="text-3xl font-playfair font-bold text-navy-brand mb-4">
            Something went wrong
          </h1>
          <p className="text-brown-brand/70 font-nunito mb-8">
            We hit an unexpected issue while loading this page. Please retry.
          </p>
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
