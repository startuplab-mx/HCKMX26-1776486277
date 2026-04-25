import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { supabase as getBrowserSupabase } from "@/lib/supabaseClient";
import { apiUrl } from "@/lib/api";

const AuthContext = createContext(null);

const MOCK_USERS = [
  {
    id: "uid-ana-001",
    email: "ana@familia.com",
    name: "Ana García",
    password: "demo123",
    isNewUser: false,
  },
];

async function fetchDashboardMinorsCount(accessToken, userId) {
  const res = await fetch(
    `${apiUrl("/api/dashboard")}?parent_id=${encodeURIComponent(userId)}`,
    {
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!res.ok) return { ok: false, count: 0 };
  const data = await res.json();
  const n = Array.isArray(data.minors) ? data.minors.length : 0;
  return { ok: true, count: n };
}

export const AuthProvider = ({ children }) => {
  const supabase = getBrowserSupabase;
  const supabaseMode = !!supabase;

  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [authLoading, setAuthLoading] = useState(supabaseMode);

  const syncPairingFromBackend = useCallback(async (token, userId) => {
    if (!token || !userId) {
      setIsNewUser(true);
      return;
    }
    const { ok, count } = await fetchDashboardMinorsCount(token, userId);
    // IMPORTANTE:
    // Solo mandamos a /pairing si CONFIRMAMOS que no hay menores.
    // Si hay error de red/auth/backend, no forzamos pairing (evita falsos positivos).
    if (!ok) return;
    setIsNewUser(count === 0);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      const session = data.session;
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: meta.full_name || meta.name || session.user.email || "Usuario",
        });
        setAccessToken(session.access_token);
        await syncPairingFromBackend(session.access_token, session.user.id);
      } else {
        setUser(null);
        setAccessToken(null);
        setIsNewUser(false);
      }
      setAuthLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (cancelled) return;
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: meta.full_name || meta.name || session.user.email || "Usuario",
          });
          setAccessToken(session.access_token);
          await syncPairingFromBackend(session.access_token, session.user.id);
        } else {
          setUser(null);
          setAccessToken(null);
          setIsNewUser(false);
        }
      },
    );

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase, syncPairingFromBackend]);

  const login = useCallback(
    async (email, password) => {
      if (supabase) {
        setAuthLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        setAuthLoading(false);
        if (error) {
          return {
            success: false,
            error: error.message || "No se pudo iniciar sesión.",
          };
        }
        const u = data.user;
        const session = data.session;
        if (u && session) {
          const meta = u.user_metadata || {};
          setUser({
            id: u.id,
            email: u.email || "",
            name: meta.full_name || meta.name || u.email || "Usuario",
          });
          setAccessToken(session.access_token);
          const { ok, count } = await fetchDashboardMinorsCount(
            session.access_token,
            u.id,
          );
          if (ok) {
            setIsNewUser(count === 0);
            return { success: true, isNewUser: count === 0 };
          }
          // Si no podemos validar contra backend, no marcamos como "nuevo" para no forzar /pairing.
          setIsNewUser(false);
          return { success: true, isNewUser: false };
        }
        return { success: false, error: "Sesión incompleta." };
      }

      setAuthLoading(true);
      await new Promise((r) => setTimeout(r, 800));
      const found = MOCK_USERS.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password,
      );
      setAuthLoading(false);
      if (found) {
        setUser({ id: found.id, email: found.email, name: found.name });
        setAccessToken(null);
        setIsNewUser(found.isNewUser);
        return { success: true, isNewUser: found.isNewUser };
      }
      return {
        success: false,
        error: "Correo electrónico o contraseña incorrectos.",
      };
    },
    [supabase],
  );

  const register = useCallback(
    async (email, password, name) => {
      if (supabase) {
        setAuthLoading(true);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        setAuthLoading(false);
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.session?.user) {
          const u = data.user;

          const meta = u.user_metadata || {};
          setUser({
            id: u.id,
            email: u.email || "",
            name: meta.full_name || name || u.email || "Usuario",
          });
          setAccessToken(data.session.access_token);
          const { ok, count } = await fetchDashboardMinorsCount(
            data.session.access_token,
            u.id,
          );
          if (ok) {
            setIsNewUser(count === 0);
            return { success: true, isNewUser: count === 0 };
          }
          // En registro: si el backend no responde, mantenemos "nuevo" para que el flujo de pairing siga disponible.
          setIsNewUser(true);
          return { success: true, isNewUser: true };
        }
        return {
          success: false,
          error:
            "Revisa tu correo para confirmar la cuenta antes de iniciar sesión.",
        };
      }

      setAuthLoading(true);
      await new Promise((r) => setTimeout(r, 900));
      const exists = MOCK_USERS.some(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      setAuthLoading(false);
      if (exists) {
        return {
          success: false,
          error: "Este correo ya está registrado. Inicia sesión.",
        };
      }
      setUser({ id: "new-" + Date.now(), email, name });
      setAccessToken(null);
      setIsNewUser(true);
      return { success: true, isNewUser: true };
    },
    [supabase],
  );

  const completePairing = useCallback(async () => {
    // El backend es la fuente de verdad: si ya hay minors, isNewUser debe apagarse.
    if (supabase && accessToken && user?.id) {
      await syncPairingFromBackend(accessToken, user.id);
    }
    setIsNewUser(false);
  }, [supabase, accessToken, user?.id, syncPairingFromBackend]);

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setAccessToken(null);
    setIsNewUser(false);
  }, [supabase]);

  const refreshBackendState = useCallback(async () => {
    if (supabase && accessToken && user?.id) {
      await syncPairingFromBackend(accessToken, user.id);
    }
  }, [supabase, accessToken, user?.id, syncPairingFromBackend]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isNewUser,
        authLoading,
        supabaseMode: !!supabase,
        login,
        register,
        completePairing,
        logout,
        refreshBackendState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export default AuthContext;
