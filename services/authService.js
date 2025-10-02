// services/authService.js
import { http } from "./http";
import storage from "../utils/storage";

const limpar = (s) => String(s ?? "").trim();
const soDigitos = (s) => String(s ?? "").replace(/\D/g, "");
const normTipo = (t) => (String(t || "").toLowerCase() === "pj" ? "pj" : "pf");

export const AuthService = {
  // POST /auth/login → espera { token, usuario }
  async login({ cpfOuCnpj, senha, tipo }) {
    const resp = await http.post(
      "/auth/login",
      { cpfOuCnpj: soDigitos(cpfOuCnpj), senha: limpar(senha), tipo: normTipo(tipo) },
      {
        // não enviar Authorization no login
        skipAuth: true,
        // garante payload válido
        validate: (d) => d && typeof d === "object" && d.token && d.usuario,
      }
    );
    if (!resp.ok) return resp;

    await storage.setToken(resp.data.token);
    await storage.setUser(resp.data.usuario);
    return { ok: true, data: resp.data };
  },

  // GET /auth/me → valida sessão no boot
  me() {
    return http.get("/auth/me", { validate: (d) => d && typeof d === "object" });
  },

  // POST /auth/logout (se existir no back) + limpar local
  async logout() {
    try {
      await http.post("/auth/logout", null, { validate: () => true });
    } catch {
      // ignora erro do servidor ao sair
    }
    await storage.clearAll();
    return { ok: true };
  },

  // POST /auth/recuperar-senha
  recuperarSenha({ cpfOuCnpj }) {
    return http.post(
      "/auth/recuperar-senha",
      { cpfOuCnpj: soDigitos(cpfOuCnpj) },
      {
        skipAuth: true,
        // aceite true, ou objeto com mensagem/protocolo
        validate: (d) => d === true || (d && typeof d === "object"),
      }
    );
  },

  // GET /auth/validar-token/:token
  validarToken(token) {
    return http.get(`/auth/validar-token/${encodeURIComponent(limpar(token))}`, {
      skipAuth: true,
      validate: (d) => d === true || (d && typeof d === "object"),
    });
  },

  // POST /auth/redefinir-senha
  redefinirSenha({ token, senha }) {
    return http.post(
      "/auth/redefinir-senha",
      { token: limpar(token), senha: limpar(senha) },
      {
        skipAuth: true,
        validate: (d) => d === true || (d && typeof d === "object"),
      }
    );
  },
};
