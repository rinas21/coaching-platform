"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { authLogout, getMeOptional } from "@/lib/backend-api";

type UserBrief = { id: string; email: string; displayName: string | null };

export type NavbarAuthProps = {
  variant?: "header" | "drawer";
  /** Classes for header nav links (must match Header: light-on-hero vs navy on scroll) */
  navLinkClass?: string;
  /** Close mobile menu after navigation or sign-out */
  onNavigate?: () => void;
};

export function NavbarAuth({ variant = "header", navLinkClass = "", onNavigate }: NavbarAuthProps) {
  const [user, setUser] = useState<UserBrief | null>(null);

  const readSession = useCallback(() => {
    getMeOptional().then((res) => {
      setUser(res?.user ?? null);
    });
  }, []);

  useEffect(() => {
    readSession();
    const onAuthChange = () => readSession();
    window.addEventListener("storage", readSession);
    window.addEventListener("safespace-auth-change", onAuthChange);
    return () => {
      window.removeEventListener("storage", readSession);
      window.removeEventListener("safespace-auth-change", onAuthChange);
    };
  }, [readSession]);

  useEffect(() => {
    const onFocus = () => readSession();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [readSession]);

  const signOut = async () => {
    try {
      await authLogout();
    } catch {
      // ignore UI noise if already logged out
    }
    setUser(null);
    window.google?.accounts?.id.disableAutoSelect();
    window.dispatchEvent(new CustomEvent("safespace-auth-change"));
    onNavigate?.();
  };

  if (user) {
    if (variant === "drawer") {
      return (
        <div className="mobile-link flex flex-col gap-4 border-t border-gray-100 pt-6 mt-2">
          <Link
            href="/account"
            className="text-[var(--text-primary)] w-full text-left font-bold"
            onClick={onNavigate}
          >
            My account
          </Link>
          <button
            type="button"
            className="w-full text-left text-lg font-bold text-navy-brand py-3 px-4 rounded-2xl bg-cream-brand/80 border border-amber-brand/10"
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      );
    }

    return (
      <div
        className="flex items-center gap-2 xl:gap-3 border-l border-amber-brand/25 pl-3 xl:pl-4 ml-1 shrink-0"
        role="navigation"
        aria-label="Account"
      >
        <Link href="/account" className={navLinkClass} title="Profile, orders, and purchases">
          My account
        </Link>
        <button type="button" onClick={signOut} className={`${navLinkClass} text-sm whitespace-nowrap`}>
          Sign out
        </button>
      </div>
    );
  }

  if (variant === "drawer") {
    return (
      <Link href="/login" className="mobile-link text-[var(--text-primary)]" onClick={onNavigate}>
        Log in
      </Link>
    );
  }

  return (
    <Link href="/login" className={navLinkClass} title="Sign in to save your cart and view orders">
      Log in
    </Link>
  );
}
