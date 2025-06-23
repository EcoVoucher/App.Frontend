import api from './api';

export const AdminService = {
  async listarUsuarios() {
    const response = await api.get('/usuarios');
    return response.data;
  },

  async aprovarPJ(cnpj) {
    const response = await api.patch('/admin/aprovar-pj', { cnpj });
    return response.data;
  },
};
