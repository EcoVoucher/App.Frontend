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
   * 🔐 Solicita recuperação de senha.
   * @param {string} cpfOuCnpj - Apenas números (sem máscara).
   * @returns {Promise<{ sucesso: boolean, mensagem?: string, erro?: string }>}
   */
  recuperarSenha: async ({ cpfOuCnpj }) => {
    const response = await api.post('/auth/recuperar-senha', { cpfOuCnpj });
    return response.data;
  },

  /**
   * 🔍 Valida o código/token enviado ao e-mail.
   * @param {string} token - Código enviado ao e-mail do usuário.
   * @returns {Promise<{ valido: boolean, mensagem?: string, erro?: string }>}
   */
  validarToken: async (token) => {
    const response = await api.get(`/auth/validar-token/${token}`);
    return response.data;
  },

  /**
   * 🔄 Redefine a senha do usuário com o token.
   * @param {string} token - Token válido (código).
   * @param {string} senha - Nova senha.
   * @returns {Promise<{ sucesso: boolean, mensagem?: string, erro?: string }>}
   */
  redefinirSenha: async ({ token, senha }) => {
    const response = await api.post('/auth/redefinir-senha', { token, senha });
    return response.data;
  },
};
