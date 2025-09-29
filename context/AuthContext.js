// context/AuthContext.js
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import storage from "../utils/storage";
import api from "../services/api";            // 👈 para setar/remover Authorization
// import { AuthService } from "../services/authService"; // opcional se quiser validar token no boot

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
        const [token, user] = await Promise.all([storage.getToken(), storage.getUser()]);
        if (token && user) {
          setAuthHeader(token);

          // (opcional) validar token com o backend:
          // const me = await AuthService.me();
          // if (!me.ok) {
          //   await storage.clearAll();
          //   setUsuario(null);
          //   return;
          // }

          setUsuario(user);
        } else {
          setUsuario(null);
        }
      } finally {
        setCarregando(false);
      }
    };
    hydrate();
  }, []);

  const login = async ({ token, usuario, tipo }) => {
    // normaliza isAdmin como boolean
    const isAdmin =
      typeof usuario?.isAdmin === "boolean"
        ? usuario.isAdmin
        : String(usuario?.isAdmin).toLowerCase() === "true";

    const usuarioComTipo = { ...usuario, tipo: tipo ?? usuario?.tipo ?? "pf", isAdmin };

    await storage.setToken(token);
    await storage.setUser(usuarioComTipo);
    setAuthHeader(token);        // 👈 garante Authorization depois do login
    setUsuario(usuarioComTipo);
  };

  const logout = async () => {
    await storage.clearAll();
    setAuthHeader(null);         // 👈 remove Authorization
    setUsuario(null);
  };

  const value = useMemo(
    () => ({
      usuario,
      carregando,
      login,
      logout,
      setUsuario,                 // útil p/ atualizar perfil local após edição
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
