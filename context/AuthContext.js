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
        const me = await AuthService.me(); // { ok, data | error }
        if (me.ok) {
          // opcional: se o backend devolver dados atualizados do usuário, você pode mesclar aqui
          setUsuario(user);
        } else if (me.error?.status === 401) {
          // token inválido → sair (limpa também o header)
          await storage.clearAll();
          setAuthHeader(null);                 // 👈 adicionado
          setUsuario(null);
        } else {
          // 404/500/etc → não derruba sessão
          console.warn("[Auth] /auth/me falhou:", me.error);
          setUsuario(user);
        }
      } catch (err) {
        // qualquer erro na hidratação => zera sessão (modo estrito)
        console.warn("[Auth] hydrate error:", err);
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

    // AuthService.login já salvou token/usuario no storage
    setAuthHeader(data.token);
    setUsuario(usuarioComTipo);

    return { ok: true, data: { ...data, usuario: usuarioComTipo } };
  };

  const logout = async () => {
    try {
      await AuthService.logout(); // opcional, não bloqueia saída
    } catch {}
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
      setUsuario, // útil p/ atualizar perfil local
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
