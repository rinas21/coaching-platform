"use client";

import { useEffect, useState } from "react";

type Props = {
  url: string;
};

/** Calendly inline booking via iframe — avoids widget.js edge cases (e.g. split on null) with SPAs. */
function appendEmbedParams(pageUrl: string): string {
  const trimmed = pageUrl.trim();
  try {
    const u = new URL(trimmed);
    if (typeof window !== "undefined") {
      u.searchParams.set("embed_domain", window.location.hostname);
      u.searchParams.set("embed_type", "Inline");
    }
    return u.toString();
  } catch {
    return trimmed;
  }
}

export default function CalendlyInlineEmbed({ url }: Props) {
  const [iframeSrc, setIframeSrc] = useState(() => url.trim());

  useEffect(() => {
    setIframeSrc(appendEmbedParams(url));
  }, [url]);

  return (
    <iframe
      title="Schedule a consultation — Calendly"
      src={iframeSrc}
      width="100%"
      height={700}
      className="w-full min-h-[700px] border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
