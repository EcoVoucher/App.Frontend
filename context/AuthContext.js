// context/AuthContext.js
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import storage from "../utils/storage";
import api, { setOnUnauthorized } from "../services/api";
import { AuthService } from "../services/authService";

const AuthContext = createContext(null);

const setAuthHeader = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // evita rajada de redirect por 401
  const handlingUnauthorizedRef = useRef(false);

  // navegação centralizada pro login público
  const goLogin = () => {
    setTimeout(() => {
      try {
        router.replace("/login");
      } catch {}
    }, 0);
  };

  // =========================
  // monta/rehidrata sessão
  // =========================
  useEffect(() => {
    const hydrate = async () => {
      try {
        const [token, user] = await Promise.all([
          storage.getToken(),
          storage.getUser(),
        ]);

        // não tem sessão salva -> deixa app em modo público
        if (!token || !user) {
          await storage.clearAll();
          setAuthHeader(null);
          setUsuario(null);
          return;
        }

        // temos algum token+user salvo
        setAuthHeader(token);

        // tenta validar sessão no backend
        let me;
        try {
          me = await AuthService.me();
        } catch (e) {
          me = { ok: false, error: { code: "ME_NOT_IMPLEMENTED" } };
        }

        if (me.ok) {
          // sessão confirmada
          setUsuario(user);
        } else if (me?.error?.http === 401) {
          // backend disse que expirou
          await storage.clearAll();
          setAuthHeader(null);
          setUsuario(null);
          goLogin();
        } else {
          // erro 404/500/etc -> vamos confiar localmente
          console.warn("[Auth] /auth/me falhou:", me.error);
          setUsuario(user);
        }
      } catch (err) {
        console.warn("[Auth] hydrate error:", err);
        // fallback seguro: considerar deslogado
        await storage.clearAll();
        setAuthHeader(null);
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    };

    hydrate();
  }, []);

  // =========================
  // listener global de 401/403 vindo do axios
  // =========================
  useEffect(() => {
    const handler = async () => {
      // Se já não temos usuário (já estamos públicos), só garante header limpo e vai pro login.
      if (!usuario) {
        setAuthHeader(null);
        goLogin();
        return;
      }

      // se já estamos processando um 401, ignora rajada
      if (handlingUnauthorizedRef.current) return;
      handlingUnauthorizedRef.current = true;

      try {
        await storage.clearAll();
      } finally {
        setAuthHeader(null);
        setUsuario(null);
        goLogin();

        // libera depois de um curto intervalo
        setTimeout(() => {
          handlingUnauthorizedRef.current = false;
        }, 1000);
      }
    };

    setOnUnauthorized(handler);
    return () => setOnUnauthorized(null);
  }, [usuario]); // importante: amarrar ao estado atual

  // =========================
  // login
  // =========================
  const login = async ({ cpfOuCnpj, senha, tipo }) => {
    const resp = await AuthService.login({ cpfOuCnpj, senha, tipo });
    if (!resp.ok) return resp;

    const data = resp.data || {};
    const usr = data.usuario || {};

    // normaliza isAdmin vindo do mock/BE
    const isAdmin =
      typeof usr?.isAdmin === "boolean"
        ? usr.isAdmin
        : String(usr?.isAdmin).toLowerCase() === "true";

    const usuarioComTipo = {
      ...usr,
      tipo: tipo ?? usr?.tipo ?? "pf",
      isAdmin,
    };

    // 1. salva token e user no storage (ESSENCIAL p/ interceptor funcionar)
    await storage.setToken(data.token);
    await storage.setUser(usuarioComTipo);

    // 2. atualiza header global do axios
    setAuthHeader(data.token);

    // 3. atualiza estado em memória
    setUsuario(usuarioComTipo);

    return { ok: true, data: { ...data, usuario: usuarioComTipo } };
  };

  // =========================
  // logout
  // =========================
  const logout = async () => {
    try {
      await AuthService.logout();
    } catch {}

    await storage.clearAll();
    setAuthHeader(null);
    setUsuario(null);

    // libera o rate limiter de 401 pra próxima sessão não herdar estado sujo
    handlingUnauthorizedRef.current = false;

    goLogin();
  };

  // contexto exposto
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

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
