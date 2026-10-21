import { useState } from "react";
import { Link } from "react-router-dom";
import { Header, Breadcrumb, PageShell } from "../components/Layout";
import { supabase } from "../services/supabaseClient";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { data, error: err } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });
      setLoading(false);

      if (err) {
        // Show validation/error message without leaking account existence unnecessarily
        console.warn("[forgot-password] reset request notice:", err.message);
        if (err.status === 429 || err.message?.toLowerCase().includes("rate limit")) {
          setError("Too many requests. Please wait a few minutes before trying again.");
          return;
        }
      }

      // Supabase standard behavior: show success instruction for privacy
      setSubmitted(true);
    } catch (exc) {
      console.warn("[forgot-password] exception:", exc);
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <PageShell>
      <Header />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Pages", href: "/" },
          { label: "Forgot Password" },
        ]}
      />

      <section className="grid grid-cols-1 items-center gap-10 rounded-xl bg-white p-6 sm:p-10 lg:grid-cols-2">
        <img
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=401&q=80"
          alt="Forgot password illustration"
          className="mx-auto hidden w-full max-w-md rounded-xl object-cover sm:block"
        />

        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold text-green-600">Forgot Password</h1>
          <p className="mt-2 text-sm uppercase tracking-widest text-neutral-400">
            Reset your account password
          </p>

          {submitted ? (
            <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6 text-stone-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={22} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-bold text-green-800">
                    Check your email inbox
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-stone-600">
                    If an account exists for <strong className="text-stone-900">{email}</strong>,
                    we have sent a secure password reset link to your email address.
                  </p>
                  <p className="mt-2 text-xs text-stone-500">
                    Please check both your inbox and spam/junk folder. The link will expire after a short period.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-green-200">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                  }}
                  className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
                >
                  Send to another email
                </button>
                <Link
                  to="/login"
                  className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 transition"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8">
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-xs text-stone-600 mb-6 leading-relaxed">
                Enter the email address associated with your Rovado account. We will send you a secure link to reset your password.
              </p>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Example@gmail.com"
                  autoComplete="email"
                  className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300 transition focus:outline-2 focus:outline-green-600 placeholder:text-neutral-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full rounded-xl bg-green-600 py-4 text-sm font-medium uppercase text-white hover:bg-green-700 transition disabled:opacity-60 sm:w-auto sm:px-10"
              >
                {loading ? "Sending link…" : "Send Reset Link"}
              </button>

              <p className="mt-8 text-xs uppercase">
                <span className="text-neutral-400">Remember your password? </span>
                <Link to="/login" className="text-green-600 font-semibold hover:underline">
                  Back to Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </PageShell>
  );
}
