import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.warn("[auth] profile fetch error:", error.message);
      }
      const resolved = data ?? null;
      setProfile(resolved);
      return resolved;
    } catch (err) {
      console.warn("[auth] profile exception:", err);
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1. Get initial session from Supabase
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email, password) => {
    setLoading(true);
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (res.data?.user) {
      setUser(res.data.user);
      const prof = await fetchProfile(res.data.user.id);
      setLoading(false);
      return { ...res, profile: prof };
    }
    setLoading(false);
    return res;
  };

  const signUp = async (email, password, fullName) => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });

    // Backup profile upsert
    if (!error && data?.user) {
      try {
        await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName || "",
            role: "customer",
          },
          { onConflict: "id" }
        );
      } catch (e) {
        console.warn("[signup] profile upsert backup notice:", e);
      }
    }

    return { data, error };
  };

  // 1-Click Demo Customer Login: Authenticates a real Supabase Auth session
  // ensuring valid JWT token, auth.uid(), and strict database RLS access
  const signInDemo = async () => {
    setLoading(true);
    const demoEmail = "demo.customer@rovado.com";
    const demoPassword = "DemoCustomer123!";

    let res = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (res.error) {
      // If demo account not registered yet, register and then sign in
      const su = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: { full_name: "Usman (Store Customer)" },
        },
      });

      if (su.data?.user) {
        res = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        });
      }
    }

    if (res.data?.user) {
      setUser(res.data.user);
      const prof = await fetchProfile(res.data.user.id);
      setLoading(false);
      return { ...res, profile: prof };
    }

    setLoading(false);
    return res;
  };

  const signOut = async () => {
    try {
      localStorage.removeItem("rovado_demo_user");
    } catch {}
    const res = await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    return res;
  };

  const resetPassword = (email) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    return supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    });
  };

  const updatePassword = (newPassword) => {
    return supabase.auth.updateUser({
      password: newPassword,
    });
  };

  const resendConfirmation = (email) => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    return supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === "admin",
    signIn,
    signInDemo,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmation,
    refreshProfile: () => fetchProfile(user?.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};