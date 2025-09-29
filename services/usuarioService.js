// services/usuarioService.js
import api from './api';
import { handle } from './http';

// Helpers locais
const limparId = (id) => String(id || '').replace(/\D/g, '');
const isCPF = (id) => limparId(id).length === 11;
const isCNPJ = (id) => limparId(id).length === 14;

// 📍 Cadastro PF/PJ (usando handle para normalizar { ok, data | error })
export const cadastrarPF = (dados) => handle(api.post('/cadastro/pf', dados));
export const cadastrarPJ = (dados) => handle(api.post('/cadastro/pj', dados));

export const UsuarioService = {
  // 🔎 Busca por CPF OU CNPJ
  async obterPorId(cpfOuCnpj) {
    const id = limparId(cpfOuCnpj);

    if (!isCPF(id) && !isCNPJ(id)) {
      return {
        ok: false,
        error: { status: 400, code: 'INVALID_IDENTIFIER', message: 'Identificador inválido: deve ser CPF ou CNPJ.' },
      };
    }

    // ✅ sempre envia SEM máscara
    const endpoint = isCPF(id)
      ? `/usuarios/historico/${id}`
      : `/usuarios/${id}`;

    return handle(api.get(endpoint));
  },

  // 🔐 Alterar senha
  alterarSenha(identificador, senhaAtual, novaSenha) {
    const id = limparId(identificador);
    return handle(
      api.post('/usuarios/alterar-senha', {
        cpfOuCnpj: id,
        senhaAtual,
        novaSenha,
      })
    );
  },
};
