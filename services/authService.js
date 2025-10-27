import { http } from "./http";
import storage from "../utils/storage";

const limpar = (s) => String(s ?? "").trim();
const soDigitos = (s) => String(s ?? "").replace(/\D/g, "");
const normTipo = (t) => (String(t || "").toLowerCase() === "pj" ? "pj" : "pf");

export const AuthService = {
  async login({ cpfOuCnpj, senha, tipo }) {
    const resp = await http.post(
      "/auth/login",
      { cpfOuCnpj: soDigitos(cpfOuCnpj), senha: limpar(senha), tipo: normTipo(tipo) },
      {
        skipAuth: true,
        skipUnauthorized: true,              // ⬅️ importante!
        validate: (d) => d && typeof d === "object" && d.token && d.usuario,
      }
    );
    if (!resp.ok) return resp;

    await storage.setToken(resp.data.token);
    await storage.setUser(resp.data.usuario);
    return { ok: true, data: resp.data };
  },

  // se o backend ainda não tiver /auth/me,
  // pode manter mas não usar; ou comente a chamada onde for usada.
  me() {
    return http.get("/auth/me", { validate: (d) => d && typeof d === "object" });
  },

 async logout() {
  try {
    const token = await storage.getToken();
    await http.post('/auth/logout', { token }, { validate: () => true });
  } catch {} 
  finally { await storage.clearAll(); }
  return { ok: true };
},

  recuperarSenha({ cpfOuCnpj }) {
    return http.post(
      "/auth/recuperar-senha",
      { cpfOuCnpj: soDigitos(cpfOuCnpj) },
      { skipAuth: true, validate: (d) => d === true || (d && typeof d === "object") }
    );
  },

  validarToken(token) {
    return http.get(`/auth/validar-token/${encodeURIComponent(limpar(token))}`, {
      skipAuth: true, validate: (d) => d === true || (d && typeof d === "object"),
    });
  },

  redefinirSenha({ token, senha }) {
    return http.post(
      "/auth/redefinir-senha",
      { token: limpar(token), senha: limpar(senha) },
      { skipAuth: true, validate: (d) => d === true || (d && typeof d === "object") }
    );
  },
};
