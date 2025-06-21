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
   * Faz logout do usuário.
   * @returns {Promise<{ sucesso: boolean, mensagem: string }>}
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Envia solicitação de recuperação de senha.
   * @param {string} cpfOuCnpj - CPF ou CNPJ sem máscara.
   * @returns {Promise<{ sucesso: boolean, mensagem: string }>}
   */
  recuperarSenha: async ({ cpfOuCnpj }) => {
    const response = await api.post('/auth/recuperar-senha', { cpfOuCnpj });
    return response.data;
  },

  /**
   * Redefine a senha usando o token recebido.
   * @param {string} token
   * @param {string} senha
   * @returns {Promise<{ sucesso: boolean, mensagem: string }>}
   */
  redefinirSenha: async ({ token, senha }) => {
    const response = await api.post('/auth/redefinir-senha', { token, senha });
    return response.data;
  },

  /**
   * Valida o token de redefinição de senha.
   * @param {string} token
   * @returns {Promise<{ valido: boolean, mensagem: string }>}
   */
  validarToken: async (token) => {
    const response = await api.get(`/auth/validar-token?token=${token}`);
    return response.data;
  },
};
