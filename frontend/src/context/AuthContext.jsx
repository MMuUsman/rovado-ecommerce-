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

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        try {
          const cached = localStorage.getItem("rovado_demo_user");
          if (cached) {
            const parsed = JSON.parse(cached);
            setUser(parsed.user);
            setProfile(parsed.profile);
          }
        } catch {}
      }
      setLoading(false);
    });

    // Listen for auth changes
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  // Backup: manually profile upsert karo (agar trigger fail ho jaye)
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
      console.warn("[signup] profile upsert backup failed:", e);
    }
  }

  return { data, error };
};

  const signInDemo = () => {
    const demoUser = {
      id: "ff56c502-45c5-45cf-b870-d670996da211",
      email: "clg.usman2000@gmail.com",
      user_metadata: { full_name: "Usman (Store Customer)" },
    };
    const demoProf = {
      id: demoUser.id,
      email: demoUser.email,
      full_name: "Usman",
      role: "customer",
    };
    setUser(demoUser);
    setProfile(demoProf);
    try {
      localStorage.setItem("rovado_demo_user", JSON.stringify({ user: demoUser, profile: demoProf }));
    } catch (e) {
      console.warn("Storage warning:", e);
    }
    return { data: { user: demoUser }, error: null };
  };

  const signOut = () => {
    try {
      localStorage.removeItem("rovado_demo_user");
    } catch {}
    return supabase.auth.signOut();
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
    refreshProfile: () => fetchProfile(user?.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};