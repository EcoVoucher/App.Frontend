// services/usuarioService.js
import { http } from "./http";


// Helpers locais
const limparId = (id) => String(id || "").replace(/\D/g, "");
const isCPF = (id) => limparId(id).length === 11;
const isCNPJ = (id) => limparId(id).length === 14;


// 📝 Cadastro PF/PJ (validação mínima de payload como objeto)
export const cadastrarPF = (dados) =>
  http.post("/cadastro/pf", dados, { validate: (d) => d && typeof d === "object" });

export const cadastrarPJ = (dados) =>
  http.post("/cadastro/pj", dados, { validate: (d) => d && typeof d === "object" });

export const UsuarioService = {
  // 🔎 Busca por CPF OU CNPJ
  async obterPorId(cpfOuCnpj) {
    const id = limparId(cpfOuCnpj);

    if (!isCPF(id) && !isCNPJ(id)) {
      return {
        ok: false,
        error: { http: 400, code: "INVALID_IDENTIFIER" },
      };
    }

    // ✅ sempre envia SEM máscara
    if (isCPF(id)) {
      // se seu endpoint de histórico retorna lista:
      return http.get(`/usuarios/historico/${id}`, {
        validate: (d) => Array.isArray(d),
      });
    }
    // para CNPJ, espera objeto de empresa/usuário PJ
    return http.get(`/usuarios/${id}`, {
      validate: (d) => d && typeof d === "object",
    });
  },

  // 🔐 Alterar senha
  alterarSenha(identificador, senhaAtual, novaSenha) {
    const id = limparId(identificador);
    return http.post(
      "/usuarios/alterar-senha",
      { cpfOuCnpj: id, senhaAtual, novaSenha },
      { validate: (d) => d && typeof d === "object" }
    );
  },
};
