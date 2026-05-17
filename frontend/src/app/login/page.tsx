"use client";

import Script from "next/script";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, Suspense, type FormEvent } from "react";
import {
  authGoogle,
  authLogin,
  authSignup,
  getGoogleClientConfig,
  requestPasswordReset,
  verifyPasswordReset,
} from "@/lib/backend-api";
import { logClientError } from "@/lib/client-log";

type Mode = "login" | "signup" | "reset";

/** Build /login URLs so `next` is preserved and the path matches the active flow (fixes ?reset=1 sticking after reset). */
function loginHref(
  variant: "signin" | "signup" | "reset",
  searchParams: ReturnType<typeof useSearchParams>,
): string {
  const next = searchParams.get("next");
  const n =
    next && next.startsWith("/") && !next.startsWith("//")
      ? `next=${encodeURIComponent(next)}`
      : "";
  if (variant === "signin") {
    return n ? `/login?${n}` : "/login";
  }
  if (variant === "signup") {
    return n ? `/login?tab=signup&${n}` : "/login?tab=signup";
  }
  return n ? `/login?reset=1&${n}` : "/login?reset=1";
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [gsiReady, setGsiReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetInfo, setResetInfo] = useState<string | null>(null);
  const [postAuthHint, setPostAuthHint] = useState<string | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [googleConfigReady, setGoogleConfigReady] = useState(false);
  const googleHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reset = searchParams.get("reset");
    const tab = searchParams.get("tab");
    if (reset === "1" || tab === "reset") {
      setMode("reset");
      setRequestSent(false);
      setOtp("");
      setNewPassword("");
      setResetInfo(null);
      setError(null);
      setPostAuthHint(null);
    } else if (tab === "signup") {
      setMode("signup");
      setPostAuthHint(null);
      setRequestSent(false);
      setOtp("");
      setNewPassword("");
      setResetInfo(null);
      setError(null);
    } else {
      setMode("login");
      setRequestSent(false);
      setOtp("");
      setNewPassword("");
      setResetInfo(null);
      setError(null);
      /* postAuthHint is kept (e.g. after password reset) until user dismisses or signs in */
    }
  }, [searchParams]);

  useEffect(() => {
    getGoogleClientConfig()
      .then((cfg) => {
        if (cfg.enabled && cfg.clientId) {
          setGoogleClientId(cfg.clientId);
        } else {
          setGoogleClientId(null);
        }
      })
      .catch((e) => {
        logClientError("login-google-config", e);
        setGoogleClientId(null);
      })
      .finally(() => {
        setGoogleConfigReady(true);
      });
  }, []);

  const onAuthSuccess = useCallback(
    () => {
      setError(null);
      window.dispatchEvent(new CustomEvent("safespace-auth-change"));
      const next = searchParams.get("next");
      const dest =
        next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
      router.push(dest);
      router.refresh();
    },
    [router, searchParams]
  );

  const onCredential = useCallback(
    async (response: { credential: string }) => {
      try {
        await authGoogle(response.credential);
        onAuthSuccess();
      } catch (e) {
        logClientError("login-google", e);
        setError(e instanceof Error ? e.message : "Google sign-in could not be completed. Try again or use email and password.");
      }
    },
    [onAuthSuccess]
  );

  useEffect(() => {
    if (!gsiReady || !googleClientId) return;
    const host = googleHostRef.current;
    const gid = window.google?.accounts?.id;
    if (!host || !gid) return;

    try {
      gid.cancel?.();
    } catch {
      /* ignore */
    }

    host.innerHTML = "";
    gid.initialize({
      client_id: googleClientId,
      callback: onCredential,
    });

    const rawW = host.getBoundingClientRect?.().width;
    const btnWidth = Math.min(
      320,
      Math.max(240, Number.isFinite(rawW) && rawW > 0 ? Math.floor(rawW) : 320),
    );

    gid.renderButton(host, {
      theme: "outline",
      size: "large",
      type: "standard",
      shape: "rectangular",
      text: mode === "signup" ? "signup_with" : "signin_with",
      width: btnWidth,
      locale: "en",
    });
  }, [gsiReady, googleClientId, mode, onCredential]);

  const submitEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPostAuthHint(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await authSignup({ email, password, displayName });
        onAuthSuccess();
      } else {
        await authLogin({ email, password });
        onAuthSuccess();
      }
    } catch (err) {
      logClientError("login-email", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!requestSent) {
        setResetInfo(null);
        const res = await requestPasswordReset(email);
        if (res.accountFound) {
          setRequestSent(true);
          setResetInfo(res.message);
        } else {
          setRequestSent(false);
          setResetInfo(res.message);
        }
      } else {
        await verifyPasswordReset({ email, otp, newPassword });
        setRequestSent(false);
        setOtp("");
        setNewPassword("");
        setPassword("");
        setResetInfo(null);
        setPostAuthHint("Your password was updated. Sign in below with this email and your new password.");
        router.replace(loginHref("signin", searchParams));
      }
    } catch (err) {
      logClientError("login-password-reset", err);
      setError(err instanceof Error ? err.message : "We could not complete that step. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendResetCode = async () => {
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      if (!res.accountFound) {
        setRequestSent(false);
        setResetInfo(res.message);
        return;
      }
      setResetInfo(res.message);
    } catch (err) {
      logClientError("login-password-reset-resend", err);
      setError(err instanceof Error ? err.message : "We could not resend the code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "reset"
      ? requestSent
        ? "Enter your code"
        : "Reset your password"
      : mode === "signup"
        ? "Create your account"
        : "Sign in";

  const lead =
    mode === "reset"
      ? requestSent
        ? "Type the 6-digit code from your email, then choose a new password (at least 8 characters)."
        : "Enter the email for your account. We will send a one-time code — use it on the next step to set a new password."
      : mode === "signup"
        ? "Use email and a password (8+ characters), or sign up with Google below. Same email can be used for Google and password later."
        : "Use your email and password, or Google. Forgot your password? Use the link below — you will need access to your email.";

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGsiReady(true)}
      />
      <main className="auth-page">
        <div className="auth-page-inner">
          <div className="auth-card">
            <h1 className="auth-title">{title}</h1>
            <p className="auth-lead">{lead}</p>

            {postAuthHint && mode !== "reset" && (
              <div className="auth-success-hint auth-success-row" role="status">
                <p className="flex-1 min-w-0">{postAuthHint}</p>
                <button
                  type="button"
                  className="auth-dismiss"
                  aria-label="Dismiss message"
                  onClick={() => setPostAuthHint(null)}
                >
                  ×
                </button>
              </div>
            )}

            {mode !== "reset" && (
              <div className="auth-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "login"}
                  className={mode === "login" ? "active" : ""}
                  onClick={() => {
                    setError(null);
                    setPostAuthHint(null);
                    router.replace(loginHref("signin", searchParams));
                  }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "signup"}
                  className={mode === "signup" ? "active" : ""}
                  onClick={() => {
                    setError(null);
                    setPostAuthHint(null);
                    router.replace(loginHref("signup", searchParams));
                  }}
                >
                  Sign up
                </button>
              </div>
            )}

            {mode === "reset" ? (
              <form className="auth-form" onSubmit={submitReset}>
                <ol className="auth-step-list">
                  <li className={requestSent ? "auth-step-done" : "auth-step-current"}>
                    Send code to your email
                  </li>
                  <li className={requestSent ? "auth-step-current" : ""}>
                    Enter code and new password
                  </li>
                </ol>
                <label className="auth-label" htmlFor="reset-email">
                  Email
                </label>
                <input
                  id="reset-email"
                  className="auth-field"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={requestSent}
                />
                {resetInfo && (
                  <p
                    className={
                      requestSent ? "auth-info auth-info-code-sent" : "auth-info auth-info-no-account"
                    }
                    role="status"
                  >
                    {resetInfo}
                  </p>
                )}
                {requestSent && (
                  <>
                    <label className="auth-label" htmlFor="otp">
                      Code from email
                    </label>
                    <input
                      id="otp"
                      className="auth-field"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      minLength={6}
                      maxLength={6}
                      pattern="[0-9]{6}"
                      title="Enter the 6-digit code from your email"
                    />
                    <label className="auth-label" htmlFor="new-password">
                      New password
                    </label>
                    <input
                      id="new-password"
                      className="auth-field"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <div className="auth-reset-actions">
                      <button
                        type="button"
                        className="auth-link-button"
                        disabled={loading}
                        onClick={() => void resendResetCode()}
                      >
                        Resend code
                      </button>
                      <button
                        type="button"
                        className="auth-link-button auth-link-button-muted"
                        disabled={loading}
                        onClick={() => {
                          setRequestSent(false);
                          setOtp("");
                          setNewPassword("");
                          setResetInfo(null);
                          setError(null);
                        }}
                      >
                        Use a different email
                      </button>
                    </div>
                  </>
                )}
                {error && <p className="auth-error">{error}</p>}
                <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                  {loading
                    ? "Please wait…"
                    : requestSent
                      ? "Reset password"
                      : "Send code"}
                </button>
                <p className="auth-footer-link">
                  <Link href={loginHref("signin", searchParams)}>Back to sign in</Link>
                  {" · "}
                  <Link href={loginHref("signup", searchParams)}>Create an account</Link>
                </p>
              </form>
            ) : (
              <form className="auth-form" onSubmit={submitEmailAuth}>
                {mode === "signup" && (
                  <>
                    <label className="auth-label" htmlFor="name">
                      Display name
                    </label>
                    <input
                      id="name"
                      className="auth-field"
                      type="text"
                      autoComplete="name"
                      required
                      minLength={2}
                      placeholder="How we greet you"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                    <p className="auth-field-hint">Shown on your profile; you can change it later.</p>
                  </>
                )}
                <label className="auth-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="auth-field"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label className="auth-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className="auth-field"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {mode === "signup" && (
                  <p className="auth-field-hint">At least 8 characters. You will use this with your email to sign in.</p>
                )}
                {mode === "login" && (
                  <p className="auth-forgot">
                    <Link href={loginHref("reset", searchParams)}>Forgot password?</Link>
                  </p>
                )}
                {mode === "login" && (
                  <p className="auth-subtle">
                    First visit? Open the <strong>Sign up</strong> tab above, or use Google under the divider.
                  </p>
                )}
                {mode === "signup" && (
                  <p className="auth-subtle">
                    Already have an account? Open the <strong>Sign in</strong> tab above. Signed up with Google only
                    before? Add a password with{" "}
                    <Link href={loginHref("reset", searchParams)}>Forgot password</Link>.
                  </p>
                )}
                {error && <p className="auth-error">{error}</p>}
                <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                  {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
                </button>
              </form>
            )}

            {mode !== "reset" && (
              <>
                <div className="auth-divider">
                  <span>or continue with</span>
                </div>
                {!googleConfigReady && (
                  <p className="text-center text-sm text-brown-brand/50 font-nunito py-3">
                    Checking Google sign-in…
                  </p>
                )}
                {googleConfigReady && !googleClientId && (
                  <p className="text-center text-sm text-brown-brand/60 font-nunito py-3 px-1 leading-relaxed">
                    Google sign-in is not available right now. Please use <strong>email and password</strong> above.
                  </p>
                )}
                <div ref={googleHostRef} className="auth-google-host" aria-hidden={!googleClientId} />
              </>
            )}

            {mode !== "reset" && (
              <p className="auth-back-home">
                <Link href="/">← Back to home</Link>
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="auth-page">
          <div className="auth-page-inner">
            <div className="auth-card">
              <p className="auth-lead">Loading…</p>
            </div>
          </div>
        </main>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
