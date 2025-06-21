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
