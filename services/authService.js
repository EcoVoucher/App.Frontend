import api from './api';

export const AuthService = {
  /**
   * Faz login do usuário (PF ou PJ).
   * @param {string} cpfOuCnpj - CPF ou CNPJ sem máscara.
   * @param {string} senha - Senha do usuário.
   * @param {string} tipo - 'pf' ou 'pj'
   * @returns {Promise<{ token: string, usuario: object }>}
   */
  login: async ({ cpfOuCnpj, senha, tipo }) => {
    const response = await api.post('/auth/login', {
      cpfOuCnpj,
      senha,
      tipo,
    });
    return response.data;
  },

  /**
   * Faz logout do usuário (opcional para o backend).
   * Frontend remove token localmente.
   * @returns {Promise<{ sucesso: boolean, mensagem: string }>}
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  recuperarSenha: async ({ cpf, cnpj }) => {
    const response = await api.post('/auth/recuperar-senha', { cpf, cnpj });
    return response.data;
  },

  redefinirSenha: async ({ token, senha }) => {
    const response = await api.post('/auth/redefinir-senha', { token, senha });
    return response.data;
  },

  validarToken: async (token) => {
    const response = await api.get(`/auth/validar-token?token=${token}`);
    return response.data;
  },
};
