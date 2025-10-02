// context/AuthContext.js
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import storage from "../utils/storage";
import api from "../services/api";
import { AuthService } from "../services/authService";

const AuthContext = createContext(null);

const setAuthHeader = (token) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [token, user] = await Promise.all([
          storage.getToken(),
          storage.getUser(),
        ]);

        // sessão incompleta -> limpa
        if (!token || !user) {
          await storage.clearAll();
          setAuthHeader(null);
          setUsuario(null);
          return;
        }

        setAuthHeader(token);

        // valida token no backend
        const me = await AuthService.me();
        if (!me.ok) {
          await storage.clearAll();
          setAuthHeader(null);
          setUsuario(null);
          return;
        }

        setUsuario(user);
      } catch {
        // qualquer erro na hidratação => zera sessão
        await storage.clearAll();
        setAuthHeader(null);
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    };

    hydrate();
  }, []);

  // Tela chama: login({ cpfOuCnpj, senha, tipo }) -> { ok, data|error }
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

    setAuthHeader(data.token);     // AuthService já salvou token/user no storage
    setUsuario(usuarioComTipo);

    return { ok: true, data: { ...data, usuario: usuarioComTipo } };
  };

  const logout = async () => {
    try { await AuthService.logout(); } catch {} // opcional, não bloqueia saída
    await storage.clearAll();
    setAuthHeader(null);
    setUsuario(null);
  };

  const value = useMemo(
    () => ({
      usuario,
      carregando,
      login,
      logout,
      setUsuario,                // útil para atualizar perfil local
      isAutenticado: !!usuario,
      isAdmin: !!usuario?.isAdmin,
      tipo: usuario?.tipo ?? null, // "pf" | "pj" | "admin"
      isPF: usuario?.tipo === "pf",
      isPJ: usuario?.tipo === "pj",
    }),
    [usuario, carregando]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
