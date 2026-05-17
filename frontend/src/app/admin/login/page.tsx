"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  authLogin,
  requestPasswordReset,
  verifyPasswordReset,
} from "@/lib/backend-api";
import { logClientError } from "@/lib/client-log";

const ADMIN_LOGIN_GENERIC =
  "Sign-in could not be completed. Check your email and password and try again.";
const ADMIN_RESET_GENERIC =
  "We could not complete that step. Please try again.";

function AdminLoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resetNoAccountInfo, setResetNoAccountInfo] = useState<string | null>(null);

  const onSubmitLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await authLogin({ email, password });
      const meRes = await fetch("/api/admin/me", { cache: "no-store" });
      if (!meRes.ok) {
        throw new Error("This account is not an admin account.");
      }
      const next = params.get("next");
      const destination =
        next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin/orders";
      router.push(destination);
      router.refresh();
    } catch (err) {
      logClientError("admin-login", err);
      setError(ADMIN_LOGIN_GENERIC);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (!requestSent) {
        setResetNoAccountInfo(null);
        const res = await requestPasswordReset(email);
        if (res.accountFound) {
          setRequestSent(true);
          setMessage(res.message);
        } else {
          setRequestSent(false);
          setMessage(null);
          setResetNoAccountInfo(res.message);
        }
      } else {
        await verifyPasswordReset({ email, otp, newPassword });
        setMode("login");
        setRequestSent(false);
        setOtp("");
        setNewPassword("");
        setPassword("");
        setResetNoAccountInfo(null);
        setMessage("Password reset successful. Please sign in.");
      }
    } catch (err) {
      logClientError("admin-login-reset", err);
      setError(ADMIN_RESET_GENERIC);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-cream-brand/30 min-h-screen pt-40 px-6 pb-32">
      <div className="mx-auto max-w-xl bg-white rounded-[2.5rem] shadow-sm border border-amber-brand/10 p-10">
        <h1 className="text-4xl font-playfair font-bold text-navy-brand mb-3">
          {mode === "login" ? "Admin Login" : "Reset Admin Password"}
        </h1>
        <p className="text-brown-brand/70 font-nunito mb-8">
          {mode === "login"
            ? "Only admin users can access payment confirmation."
            : "Use your admin email to receive a one-time reset code."}
        </p>
        {mode === "login" ? (
          <form onSubmit={onSubmitLogin} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              className="w-full rounded-xl border border-amber-brand/20 p-3"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-amber-brand/20 p-3"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-700">{message}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in as admin"}
            </button>
            <button
              type="button"
              className="w-full text-sm text-navy-brand/70 hover:text-navy-brand"
              onClick={() => {
                setMode("reset");
                setError(null);
                setMessage(null);
                setResetNoAccountInfo(null);
              }}
            >
              Forgot password?
            </button>
          </form>
        ) : (
          <form onSubmit={onSubmitReset} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              className="w-full rounded-xl border border-amber-brand/20 p-3"
              disabled={requestSent}
            />
            {requestSent && (
              <>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="OTP code from email"
                  className="w-full rounded-xl border border-amber-brand/20 p-3"
                  required
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 8 chars)"
                  className="w-full rounded-xl border border-amber-brand/20 p-3"
                  minLength={8}
                  required
                />
              </>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {resetNoAccountInfo && (
              <p className="text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                {resetNoAccountInfo}
              </p>
            )}
            {message && <p className="text-sm text-green-700">{message}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading
                ? "Please wait..."
                : requestSent
                  ? "Reset password"
                  : "Send reset code"}
            </button>
            <button
              type="button"
              className="w-full text-sm text-navy-brand/70 hover:text-navy-brand"
              onClick={() => {
                setMode("login");
                setRequestSent(false);
                setOtp("");
                setNewPassword("");
                setError(null);
                setMessage(null);
                setResetNoAccountInfo(null);
              }}
            >
              Back to admin login
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="bg-cream-brand/30 min-h-screen pt-40 px-6 pb-32" />}>
      <AdminLoginInner />
    </Suspense>
  );
}
