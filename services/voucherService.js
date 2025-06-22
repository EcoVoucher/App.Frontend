import api from './api';

/**
 * Service relacionado aos vouchers (PJ).
 */
export const VouchersService = {
  async obterVouchersPorCNPJ(cnpj) {
    const response = await api.get(`/vouchers?cnpj=${cnpj}`);
    return response.data;
  },

  async contarVouchersCompradosPorCNPJ(cnpj) {
    const response = await api.get(`/vouchers/comprados?cnpj=${cnpj}`);
    return response.data;
  },
};
