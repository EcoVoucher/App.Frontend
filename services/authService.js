// services/authService.js
import api from './api';
import { handle } from './http';

const limpar = (s) => String(s ?? '').trim();
const soDigitos = (s) => String(s ?? '').replace(/\D/g, '');
const normTipo = (t) => (String(t || '').toLowerCase() === 'pj' ? 'pj' : 'pf');

export const AuthService = {
  /**
   * Login PF/PJ
   * payload esperado do back: { token, usuario, tipo? }
   */
  login({ cpfOuCnpj, senha, tipo }) {
    return handle(
      api.post('/auth/login', {
        cpfOuCnpj: soDigitos(cpfOuCnpj),
        senha: limpar(senha),
        tipo: normTipo(tipo),
      })
    );
  },

  /**
   * Logout (opcional — além de limpar localmente no AuthContext)
   */
  logout() {
    return handle(api.post('/auth/logout'));
  },

  /**
   * Recuperar senha (envia e-mail/código)
   */
  recuperarSenha({ cpfOuCnpj }) {
    return handle(
      api.post('/auth/recuperar-senha', {
        cpfOuCnpj: soDigitos(cpfOuCnpj),
      })
    );
  },

  /**
   * Validar token/código de recuperação
   */
  validarToken(token) {
    return handle(
      api.get(`/auth/validar-token/${encodeURIComponent(limpar(token))}`)
    );
  },

  /**
   * Redefinir senha com token
   */
  redefinirSenha({ token, senha }) {
    return handle(
      api.post('/auth/redefinir-senha', {
        token: limpar(token),
        senha: limpar(senha),
      })
    );
  },

  /**
   * (Opcional) /me para revalidar sessão ao abrir o app
   */
  me() {
    return handle(api.get('/auth/me'));
  },
};
