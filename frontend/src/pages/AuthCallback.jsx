import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { PageShell, Header, Breadcrumb } from "../components/Layout";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Verifying your authentication link…");

  useEffect(() => {
    let mounted = true;

    async function handleAuth() {
      try {
        // 1. Check for error parameters in URL query or hash
        const searchParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash ? window.location.hash.substring(1) : "";
        const hashParams = new URLSearchParams(hash);

        const errorMsg =
          searchParams.get("error_description") ||
          searchParams.get("error") ||
          hashParams.get("error_description") ||
          hashParams.get("error");

        if (errorMsg) {
          if (mounted) {
            setError(decodeURIComponent(errorMsg));
            setStatus("");
          }
          return;
        }

        // 2. Check for PKCE exchange code
        const code = searchParams.get("code");
        if (code) {
          setStatus("Authenticating session with security provider…");
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) {
            if (mounted) {
              setError(exchangeErr.message || "Failed to exchange security verification code.");
              setStatus("");
            }
            return;
          }
        }

        // 3. Check current session & type
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          console.warn("[AuthCallback] session notice:", sessionErr.message);
        }

        const type = searchParams.get("type") || hashParams.get("type");

        if (type === "recovery" || hash.includes("type=recovery")) {
          // Password recovery flow -> direct to reset password page
          if (mounted) {
            navigate("/reset-password", { replace: true });
          }
          return;
        }

        if (type === "signup" || type === "email_change" || session?.user) {
          // Email confirmation flow -> redirect to login with confirmation success notification
          if (mounted) {
            navigate("/login?confirmed=true", { replace: true });
          }
          return;
        }

        // Default: redirect home or login
        if (mounted) {
          navigate(session ? "/" : "/login", { replace: true });
        }
      } catch (err) {
        console.error("[AuthCallback] Unexpected error:", err);
        if (mounted) {
          setError(err.message || "An unexpected error occurred during email verification.");
          setStatus("");
        }
      }
    }

    handleAuth();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <PageShell>
      <Header />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Pages", href: "/" },
          { label: "Authentication Verification" },
        ]}
      />

      <section className="grid grid-cols-1 items-center justify-center p-6 sm:p-12">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-stone-100 text-center">
          {error ? (
            <div className="space-y-4">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-100 text-red-600">
                <AlertCircle size={28} />
              </div>
              <h1 className="text-xl font-bold text-stone-900">Verification Failed</h1>
              <p className="text-xs text-stone-600 leading-relaxed">{error}</p>
              <div className="pt-4 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="rounded-xl bg-green-600 py-3 text-xs font-semibold uppercase text-white hover:bg-green-700 transition"
                >
                  Return to Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl border border-stone-200 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
                >
                  Sign Up Again
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-6">
              <div className="mx-auto size-10 animate-spin rounded-full border-3 border-stone-200 border-t-green-600" />
              <h1 className="text-lg font-bold text-stone-900">{status}</h1>
              <p className="text-xs text-stone-500">
                Please wait a moment while we securely verify your email credentials.
              </p>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
