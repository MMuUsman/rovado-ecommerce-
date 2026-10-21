import { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle2, AlertCircle, Mail, RotateCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Header, Breadcrumb, PageShell } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { signUp, resendConfirmation } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email confirmation pending state
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((c) => Math.max(0, c - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please provide a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { data, error: err } = await signUp(cleanEmail, password, cleanName);
    setLoading(false);

    if (err) {
      setError(err.message || "Failed to create account. Please try again.");
      return;
    }

    // If Supabase has email confirmation disabled, a session is issued immediately
    if (data?.session) {
      navigate("/", { replace: true });
    } else {
      // Email confirmation is required by Supabase Auth configuration
      setRegisteredEmail(cleanEmail);
      setConfirmationPending(true);
      setResendCooldown(60);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading || !registeredEmail) return;
    setResendLoading(true);
    setResendSuccess("");
    setError("");

    try {
      const { error: resendErr } = await resendConfirmation(registeredEmail);
      setResendLoading(false);

      if (resendErr) {
        if (resendErr.status === 429 || resendErr.message?.toLowerCase().includes("rate limit")) {
          setError("Rate limit reached. Please wait before requesting another confirmation email.");
        } else {
          setError(resendErr.message || "Failed to resend confirmation email.");
        }
        return;
      }

      setResendSuccess("A fresh confirmation email has been sent to your inbox.");
      setResendCooldown(60);
      setTimeout(() => setResendSuccess(""), 5000);
    } catch (exc) {
      setResendLoading(false);
      setError(exc.message || "Failed to resend confirmation email.");
    }
  };

  return (
    <PageShell>
      <Header />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Pages", href: "/" },
          { label: "Register" },
        ]}
      />

      <section className="grid grid-cols-1 items-center gap-10 rounded-xl bg-white p-6 sm:p-10 lg:grid-cols-2">
        <img
          src="https://images.unsplash.com/photo-1556742111-a301076d9d18?w=401&q=80"
          alt="Register illustration"
          className="mx-auto hidden w-full max-w-md rounded-xl object-cover sm:block"
        />

        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold text-green-600">Register</h1>
          <p className="mt-2 text-sm uppercase tracking-widest text-neutral-400">Join to us</p>

          {confirmationPending ? (
            <div className="mt-8 rounded-xl border border-green-200 bg-green-50/60 p-6 text-stone-800">
              <div className="flex items-start gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-green-600 text-white shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-green-900">
                    Confirm your email address
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-stone-600">
                    We've sent a verification link to <strong className="text-stone-900 font-semibold">{registeredEmail}</strong>.
                    Please check your inbox and click the link to activate your account.
                  </p>
                  <p className="mt-2 text-[11px] text-stone-500">
                    Be sure to check your spam or junk folder if you don't see it within a few moments.
                  </p>
                </div>
              </div>

              {resendSuccess && (
                <div className="mt-4 flex items-center gap-2 rounded-md bg-green-100/70 px-3 py-2 text-xs text-green-800">
                  <CheckCircle2 size={14} className="shrink-0 text-green-700" />
                  <span>{resendSuccess}</span>
                </div>
              )}

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-green-200/80">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition disabled:opacity-60"
                >
                  <RotateCw size={13} className={resendLoading ? "animate-spin" : ""} />
                  {resendLoading
                    ? "Sending…"
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend confirmation email"}
                </button>
                <Link
                  to="/login"
                  className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 transition"
                >
                  Proceed to Login →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8">
              {error && (
                <div className="mb-6 flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Your name <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jhon Deo"
                  autoComplete="name"
                  className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300 transition focus:outline-2 focus:outline-green-600 placeholder:text-neutral-400"
                />
              </div>

              <div className="mt-6">
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

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min. 6 characters)"
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
                  Confirm Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
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
                {loading ? "Registering…" : "Register"}
              </button>

              <p className="mt-8 text-xs uppercase">
                <span className="text-neutral-400">Already a user? </span>
                <Link to="/login" className="text-green-600 font-semibold hover:underline">
                  Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </PageShell>
  );
}