// context/AuthContext.js
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import storage from "../utils/storage";
import api, { setOnUnauthorized } from "../services/api";   // 👈 importa o setter
import { AuthService } from "../services/authService";

const AuthContext = createContext(null);

const setAuthHeader = (token) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // evita múltiplos redirects em rajada de 401
  const handlingUnauthorizedRef = useRef(false);

  const goLogin = () => {
    setTimeout(() => {
      try { router.replace("/(public)/login"); } catch {}
    }, 0);
  };

  // ✅ registra listener global para 401/403 do axios (services/api.js)
  useEffect(() => {
    const handler = async () => {
      if (handlingUnauthorizedRef.current) return;
      handlingUnauthorizedRef.current = true;

      try {
        await storage.clearAll();
      } finally {
        setAuthHeader(null);
        setUsuario(null);
        goLogin();
        // libera novo redirect após um curto intervalo
        setTimeout(() => { handlingUnauthorizedRef.current = false; }, 1000);
      }
    };

    setOnUnauthorized(handler);
    return () => setOnUnauthorized(null); // cleanup
  }, []);
  
  useEffect(() => {
    const hydrate = async () => {
      try {
        const [token, user] = await Promise.all([storage.getToken(), storage.getUser()]);

        if (!token || !user) {
          await storage.clearAll();
          setAuthHeader(null);
          setUsuario(null);
          goLogin();
          return;
        }

        setAuthHeader(token);
        const me = await AuthService.me();

        if (me.ok) {
          setUsuario(user);
        } else if (me.error?.status === 401) {
          await storage.clearAll();
          setAuthHeader(null);
          setUsuario(null);
          goLogin();
        } else {
          console.warn("[Auth] /auth/me falhou:", me.error);
          setUsuario(user);
        }
      } catch (err) {
        console.warn("[Auth] hydrate error:", err);
        await storage.clearAll();
        setAuthHeader(null);
        setUsuario(null);
        goLogin();
      } finally {
        setCarregando(false);
      }
    };

    hydrate();
  }, []);

  const login = async ({ cpfOuCnpj, senha, tipo }) => {
    const resp = await AuthService.login({ cpfOuCnpj, senha, tipo });
    if (!resp.ok) return resp;

    const data = resp.data || {};
    const usr = data.usuario || {};
    const isAdmin =
      typeof usr?.isAdmin === "boolean"
        ? usr.isAdmin
        : String(usr?.isAdmin).toLowerCase() === "true";

    const usuarioComTipo = { ...usr, tipo: tipo ?? usr?.tipo ?? "pf", isAdmin };

    setAuthHeader(data.token);
    setUsuario(usuarioComTipo);

    return { ok: true, data: { ...data, usuario: usuarioComTipo } };
  };

  const logout = async () => {
    try { await AuthService.logout(); } catch {}
    await storage.clearAll();
    setAuthHeader(null);
    setUsuario(null);
    goLogin();
  };

  const value = useMemo(
    () => ({
      usuario,
      carregando,
      login,
      logout,
      setUsuario,
      isAutenticado: !!usuario,
      isAdmin: !!usuario?.isAdmin,
      tipo: usuario?.tipo ?? null,
      isPF: usuario?.tipo === "pf",
      isPJ: usuario?.tipo === "pj",
    }),
    [usuario, carregando]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
