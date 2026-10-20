import { useState } from "react";
import { Eye } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Header, Breadcrumb, PageShell } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn, signInDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) { setError(err.message); return; }
    navigate(redirectTo, { replace: true });
  };

  return (
    <PageShell>
      <Header />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Pages", href: "/" }, { label: "Login" }]} />

      <section className="grid grid-cols-1 items-center gap-10 rounded-xl bg-white p-6 sm:p-10 lg:grid-cols-2">
        <img
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=401&q=80"
          alt="Login illustration"
          className="mx-auto hidden w-full max-w-md rounded-xl object-cover sm:block"
        />

        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold text-green-600">Welcome Back</h1>
          <p className="mt-2 text-sm uppercase tracking-widest text-neutral-400">Login to continue</p>

          {error && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}

          <div className="mt-8">
            <label className="mb-2 block text-sm">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Example@gmail.com"
              className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300 placeholder:text-neutral-400"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm">Password</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="...."
                className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300 placeholder:text-neutral-400"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Eye size={16} className="text-black" />
              </button>
            </div>
          </div>

          <Link to="/contact" className="mt-3 block text-xs text-neutral-400 hover:text-green-600 underline">
            Forget Password ?
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-green-600 py-4 text-sm font-medium uppercase text-white disabled:opacity-60 sm:w-auto sm:px-10"
          >
            {loading ? "Logging in…" : "Login"}
          </button>

          <div className="mt-4 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => {
                signInDemo();
                navigate(redirectTo, { replace: true });
              }}
              className="w-full rounded-xl border border-green-600/30 bg-green-50 py-3 text-xs font-bold uppercase tracking-wider text-green-700 transition hover:bg-green-100 flex items-center justify-center gap-1.5"
            >
              <span>⚡ 1-Click Demo Customer Login</span>
            </button>
          </div>

          <p className="mt-6 text-xs uppercase">
            <span className="text-neutral-400">New user? </span>
            <Link to="/register" className="text-green-600">Sign Up</Link>
          </p>
        </form>
      </section>
    </PageShell>
  );
}