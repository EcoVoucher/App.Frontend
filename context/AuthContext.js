// context/AuthContext.js
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import storage from "../utils/storage";
// Se quiser validar token no load, traga seu cliente: import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [token, user] = await Promise.all([storage.getToken(), storage.getUser()]);
        if (token && user) {
          // (opcional) validar token com o backend:
          // try {
          //   await api.get("/auth/me"); // ou endpoint equivalente
          // } catch {
          //   await storage.clearAll();
          //   setUsuario(null);
          //   setCarregando(false);
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
    setUsuario(usuarioComTipo);
  };

  const logout = async () => {
    await storage.clearAll();
    setUsuario(null);
  };

  const value = useMemo(
    () => ({
      usuario,
      carregando,
      login,
      logout,
      setUsuario, // útil p/ atualizar perfil local após edição
      isAutenticado: !!usuario,
      isAdmin: !!usuario?.isAdmin,
      tipo: usuario?.tipo ?? null, // "pf" | "pj" | "admin"
    }),
    [usuario, carregando]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
