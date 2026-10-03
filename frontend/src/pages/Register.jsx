import { useState } from "react";
import { Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Header, Breadcrumb, PageShell } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm)  { setError("Passwords do not match."); return; }

    setLoading(true);
    const { data, error: err } = await signUp(email.trim(), password, name.trim());
    setLoading(false);

    if (err) { setError(err.message); return; }

    // If Supabase requires email confirmation, session will be null.
    if (data?.session) {
      navigate("/", { replace: true });
    } else {
      setError("Check your email to confirm your account before logging in.");
    }
  };

  return (
    <PageShell>
      <Header />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Pages", href: "/" }, { label: "Register" }]} />

      <section className="grid grid-cols-1 items-center gap-10 rounded-xl bg-white p-6 sm:p-10 lg:grid-cols-2">
        <img
          src="https://images.unsplash.com/photo-1556742111-a301076d9d18?w=401&q=80"
          alt="Register illustration"
          className="mx-auto hidden w-full max-w-md rounded-xl object-cover sm:block"
        />

        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold text-green-600">Register</h1>
          <p className="mt-2 text-sm uppercase tracking-widest text-neutral-400">Join to us</p>

          {error && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}

          <div className="mt-8">
            <label className="mb-2 block text-sm">Your name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jhon Deo"
              className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300 placeholder:text-neutral-400"
            />
          </div>

          <div className="mt-6">
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
              <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2">
                <Eye size={16} className="text-black" />
              </button>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm">Confirm Password</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="...."
                className="w-full rounded-md bg-white px-3 py-3 text-sm outline outline-1 outline-stone-300 placeholder:text-neutral-400"
              />
              <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2">
                <Eye size={16} className="text-black" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-green-600 py-4 text-sm font-medium uppercase text-white disabled:opacity-60 sm:w-auto sm:px-10"
          >
            {loading ? "Registering…" : "Register"}
          </button>

          <p className="mt-8 text-xs uppercase">
            <span className="text-neutral-400">Already a user? </span>
            <Link to="/login" className="text-green-600">Login</Link>
          </p>
        </form>
      </section>
    </PageShell>
  );
}