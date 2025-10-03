// services/depositoService.js
import { http } from './http';

const soDigitos = (s) => String(s ?? '').replace(/\D/g, '');
const isObj = (d) => d && typeof d === 'object' && !Array.isArray(d);

export const DepositoService = {
  /**
   * Realiza um depósito de materiais.
   * payload: { cpf, materiais, totalPontos }
   * POST /depositos
   */
  realizarDeposito(cpf, materiais, totalPontos) {
    const payload = {
      cpf: soDigitos(cpf),
      materiais: Array.isArray(materiais) ? materiais : [],
      totalPontos: Number(totalPontos) || 0,
    };
    return http.post('/depositos', payload, {
      validate: (d) => isObj(d) || d === true, // aceita objeto de comprovante ou boolean
    });
  },

  /**
   * Consulta CPF para validação se está cadastrado.
   * GET /usuarios/cpf/:cpf
   */
  consultarUsuarioPorCPF(cpf) {
    return http.get(`/usuarios/cpf/${soDigitos(cpf)}`, {
      validate: (d) => isObj(d),
    });
  },
};
