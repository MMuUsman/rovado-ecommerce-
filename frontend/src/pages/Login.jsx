import { useState } from "react";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Header, Breadcrumb, PageShell } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn, signInDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from ?? "/";

  const searchParams = new URLSearchParams(location.search);
  const isConfirmed = searchParams.get("confirmed") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      if (err.message?.toLowerCase().includes("email not confirmed")) {
        setError("Your email address has not been confirmed yet. Please check your inbox or request a confirmation email.");
      } else {
        setError(err.message);
      }
      return;
    }
    navigate(redirectTo, { replace: true });
  };

  const handleDemoLogin = async () => {
    setError("");
    setDemoLoading(true);
    const res = await signInDemo();
    setDemoLoading(false);
    if (res?.error) {
      setError(res.error.message || "Failed to log in with demo account.");
      return;
    }
    navigate(redirectTo, { replace: true });
  };

  return (
    <PageShell>
      <Header />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Pages", href: "/" },
          { label: "Login" },
        ]}
      />

      <section className="grid grid-cols-1 items-center gap-10 rounded-xl bg-white p-6 sm:p-10 lg:grid-cols-2">
        <img
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=401&q=80"
          alt="Login illustration"
          className="mx-auto hidden w-full max-w-md rounded-xl object-cover sm:block"
        />

        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold text-green-600">Welcome Back</h1>
          <p className="mt-2 text-sm uppercase tracking-widest text-neutral-400">
            Login to continue
          </p>

          {isConfirmed && (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">
              <CheckCircle2 size={16} className="text-green-600 shrink-0" />
              <span>Email verified successfully! You can now log in with your credentials.</span>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <div className="mt-8">
            <label className="mb-2 block text-sm font-medium text-stone-700">Email Address</label>
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
            <label className="mb-2 block text-sm font-medium text-stone-700">Password</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="...."
                autoComplete="current-password"
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

          <Link
            to="/forgot-password"
            className="mt-3 block text-xs text-neutral-400 hover:text-green-600 underline"
          >
            Forgot Password?
          </Link>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="mt-8 w-full rounded-xl bg-green-600 py-4 text-sm font-medium uppercase text-white hover:bg-green-700 transition disabled:opacity-60 sm:w-auto sm:px-10"
          >
            {loading ? "Logging in…" : "Login"}
          </button>

          <div className="mt-4 pt-4 border-t border-stone-100">
            <button
              type="button"
              disabled={loading || demoLoading}
              onClick={handleDemoLogin}
              className="w-full rounded-xl border border-green-600/30 bg-green-50 py-3 text-xs font-bold uppercase tracking-wider text-green-700 transition hover:bg-green-100 flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <span>{demoLoading ? "Logging in as Demo Customer…" : "⚡ 1-Click Demo Customer Login"}</span>
            </button>
          </div>

          <p className="mt-6 text-xs uppercase">
            <span className="text-neutral-400">New user? </span>
            <Link to="/register" className="text-green-600 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </section>
    </PageShell>
  );
}