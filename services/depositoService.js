import api from './api';

export const DepositoService = {
  /**
   * Realiza um depósito de materiais.
   * @param {string} cpf - CPF do usuário (sem máscara).
   * @param {Array} materiais - Lista de materiais com nome, quantidade e pontos.
   * @param {number} totalPontos - Total de pontos do depósito.
   * @returns {Promise<object>} - Dados do comprovante do depósito.
   */
  realizarDeposito: async (cpf, materiais, totalPontos) => {
    const payload = {
      cpf,
      materiais,
      totalPontos,
    };
    const response = await api.post('/api/depositos', payload);
    return response.data;
  },

  /**
   * Consulta CPF para validação se está cadastrado.
   * @param {string} cpf
   * @returns {Promise<object>} - Dados do usuário
   */
  consultarUsuarioPorCPF: async (cpf) => {
    const response = await api.get(`/api/usuarios/cpf/${cpf}`);
    return response.data;
  },
};
