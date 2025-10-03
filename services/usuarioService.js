// services/usuarioService.js
import { http } from "./http";

const limparId = (id) => String(id || "").replace(/\D/g, "");
const isCPF = (id) => limparId(id).length === 11;
const isCNPJ = (id) => limparId(id).length === 14;
const isObj = (d) => d && typeof d === "object" && !Array.isArray(d);

// 📝 Cadastro PF/PJ
export const cadastrarPF = (dados) =>
  http.post("/cadastro/pf", dados, { validate: (d) => d === true || isObj(d) }); // 👈 aceita boolean
export const cadastrarPJ = (dados) =>
  http.post("/cadastro/pj", dados, { validate: (d) => d === true || isObj(d) }); // 👈 aceita boolean

export const UsuarioService = {
  // 🔎 Busca por CPF OU CNPJ
  async obterPorId(cpfOuCnpj) {
    const id = limparId(cpfOuCnpj);

    if (!isCPF(id) && !isCNPJ(id)) {
      return {
        ok: false,
        error: {
          http: 400,
          code: "INVALID_IDENTIFIER",
          message: "Identificador inválido: informe um CPF ou CNPJ válido.", // 👈 mensagem amigável
        },
      };
    }

    // ✅ sempre envia SEM máscara
    if (isCPF(id)) {
      // CPF → histórico (lista)
      return http.get(`/usuarios/historico/${id}`, {
        validate: (d) => Array.isArray(d),
      });
    }
    // CNPJ → entidade PJ (objeto)
    return http.get(`/usuarios/${id}`, {
      validate: (d) => isObj(d),
    });
  },

  // 🔐 Alterar senha
  alterarSenha(identificador, senhaAtual, novaSenha) {
    const id = limparId(identificador);
    return http.post(
      "/usuarios/alterar-senha",
      { cpfOuCnpj: id, senhaAtual, novaSenha },
      { validate: (d) => d === true || isObj(d) } // 👈 aceita boolean
    );
  },
};
