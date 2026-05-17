"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark";
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

type Props = {
  onToken: (token: string | null) => void;
  theme?: "light" | "dark";
};

export default function CaptchaField({ onToken, theme = "light" }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!siteKey) return;
    const existing = document.querySelector(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
    ) as HTMLScriptElement | null;
    if (existing) {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!siteKey || !ready || !hostRef.current || !window.turnstile) return;
    if (widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(hostRef.current, {
      sitekey: siteKey,
      theme,
      callback: (token) => onToken(token),
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
    });
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [onToken, ready, theme]);

  if (!siteKey) return null;
  return <div ref={hostRef} className="flex justify-center" />;
}
