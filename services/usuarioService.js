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

function isCPF(identifier) {
  const cleaned = identifier.replace(/\D/g, '');
  return cleaned.length === 11;
}

function isCNPJ(identifier) {
  const cleaned = identifier.replace(/\D/g, '');
  return cleaned.length === 14;
}

export const UsuarioService = {
  async obterPorId(cpfOuCnpj) {
    if (!isCPF(cpfOuCnpj) && !isCNPJ(cpfOuCnpj)) {
      throw new Error('Identificador inválido: deve ser CPF ou CNPJ.');
    }
    let response;
    if(isCPF(cpfOuCnpj)) {
      response = await api.get(`/usuarios/historico/${cpfOuCnpj}`);
    }
    if(isCNPJ(cpfOuCnpj)){
      response = await api.get(`/usuarios/${cpfOuCnpj}`);
    }
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