import { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Header, Breadcrumb, PageShell } from "../components/Layout";
import { supabase } from "../services/supabaseClient";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        // 1. Check for PKCE 'code' query parameter in URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) {
            console.warn("[reset-password] code exchange warning:", exchangeErr.message);
          }
        }

        // 2. Check for active session
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          console.warn("[reset-password] session check notice:", sessionErr.message);
        }

        if (mounted) {
          if (session?.user) {
            setHasValidSession(true);
          } else {
            // Also check if auth hash has tokens
            const hash = window.location.hash || "";
            if (hash.includes("access_token") || hash.includes("type=recovery")) {
              setHasValidSession(true);
            } else {
              setHasValidSession(false);
            }
          }
          setVerifyingSession(false);
        }
      } catch (err) {
        console.warn("[reset-password] init session exception:", err);
        if (mounted) {
          setHasValidSession(false);
          setVerifyingSession(false);
        }
      }
    }

    initSession();

    // Listen to auth state changes (e.g. PASSWORD_RECOVERY event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || session?.user) {
        setHasValidSession(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: updateErr } = await supabase.auth.updateUser({
        password,
      });

      setLoading(false);

      if (updateErr) {
        setError(updateErr.message || "Failed to update password. Please try again.");
        return;
      }

      setSuccess(true);
    } catch (exc) {
      setLoading(false);
      setError(exc.message || "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <PageShell>
      <Header />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Pages", href: "/" },
          { label: "Reset Password" },
        ]}
      />

      <section className="grid grid-cols-1 items-center gap-10 rounded-xl bg-white p-6 sm:p-10 lg:grid-cols-2">
        <img
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=401&q=80"
          alt="Reset password illustration"
          className="mx-auto hidden w-full max-w-md rounded-xl object-cover sm:block"
        />

        <div className="mx-auto w-full max-w-md">
          {verifyingSession ? (
            <div className="py-12 text-center text-sm text-stone-500">
              <div className="mx-auto size-8 animate-spin rounded-full border-2 border-stone-300 border-t-green-600 mb-3" />
              Verifying security reset credentials…
            </div>
          ) : !hasValidSession && !success ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-stone-800">
              <div className="flex items-start gap-3">
                <AlertCircle size={22} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h1 className="text-lg font-bold text-red-800">Invalid or Expired Link</h1>
                  <p className="mt-2 text-xs leading-relaxed text-stone-600">
                    This password reset link is invalid, has expired, or was already used. For security reasons, password recovery links are one-time use only.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-red-200">
                <Link
                  to="/forgot-password"
                  className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 transition"
                >
                  Request New Reset Link
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-stone-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={24} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h1 className="text-lg font-bold text-green-800">
                    Password Reset Complete!
                  </h1>
                  <p className="mt-2 text-xs leading-relaxed text-stone-600">
                    Your password has been updated successfully. You can now use your new password to log in to your Rovado account.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-green-200">
                <Link
                  to="/login"
                  className="inline-block rounded-xl bg-green-600 px-6 py-3 text-xs font-medium uppercase text-white hover:bg-green-700 transition shadow-sm"
                >
                  Proceed to Login →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1 className="text-3xl font-bold text-green-600">Create New Password</h1>
              <p className="mt-2 text-sm uppercase tracking-widest text-neutral-400">
                Set a secure password for your account
              </p>

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-8">
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  New Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    autoComplete="new-password"
                    className="w-full rounded-md bg-white px-3 py-3 pr-10 text-sm outline outline-1 outline-stone-300 transition focus:outline-2 focus:outline-green-600 placeholder:text-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-black"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Confirm New Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    className="w-full rounded-md bg-white px-3 py-3 pr-10 text-sm outline outline-1 outline-stone-300 transition focus:outline-2 focus:outline-green-600 placeholder:text-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-black"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full rounded-xl bg-green-600 py-4 text-sm font-medium uppercase text-white hover:bg-green-700 transition disabled:opacity-60 sm:w-auto sm:px-10"
              >
                {loading ? "Updating Password…" : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </section>
    </PageShell>
  );
}
