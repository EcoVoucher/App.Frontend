import api from './api';

// 📍 Cadastro de Pessoa Física
export const cadastrarPF = async (dados) => {
  const response = await api.post('/cadastro/pf', dados);
  return response.data;
};

// 📍 Cadastro de Pessoa Jurídica
export const cadastrarPJ = async (dados) => {
  const response = await api.post('/cadastro/pj', dados);
  return response.data;
};

export const UsuarioService = {
  async obterPorId(cpfOuCnpj) {
    const response = await api.get(`/usuarios/historico/${cpfOuCnpj}`);
    return response.data;
  },

  async alterarSenha(identificador, senhaAtual, novaSenha) {
    const response = await api.post('/usuarios/alterar-senha', {
      cpfOuCnpj: identificador,
      senhaAtual,
      novaSenha,
    });
    return response.data;
  },
  
};