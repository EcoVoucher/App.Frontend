import api from './api';

/**
 * Service relacionado aos vouchers (PJ).
 */
export const VouchersService = {
  /**
   * 🧾 Listar vouchers emitidos
   */
  async listarVouchers() {
    const response = await api.get('/api/vouchers');
    return response.data;
  },

  /**
   * 📊 Obter estatísticas de vouchers adquiridos
   */
  async obterEstatisticas() {
    const response = await api.get('/api/vouchers/estatisticas');
    return response.data;
  },

  /**
   * 🎟️ Gerar um novo lote de vouchers
   */
  async gerarVoucher({ tipo, produtos, quantidade, dataValidade }) {
    const response = await api.post('/api/vouchers', {
      tipo,
      produtos,
      quantidade,
      dataValidade,
    });
    return response.data;
  },
 
  /**
   * 🛍️ Listar vouchers disponíveis para Pessoa Física (catálogo).
   */
  async listarVouchersDisponiveisPF() {
    const response = await api.get('/api/vouchers/disponiveis');
    return response.data;
  },

  /**
   * 🛒 Comprar vouchers (Pessoa Física faz a compra).
   */
  async comprarVouchers(cpf, lista) {
    const response = await api.post('/api/vouchers/comprar', {
      cpf,
      vouchers: lista,
    });
    return response.data;
  },

async validarVoucherPorCodigo(codigo, cnpj) {
  const response = await api.get(`/api/vouchers/${codigo}`, {
    params: { cnpj },
  });
  return response.data;
},

/**
 * 🔍 Buscar vouchers por CPF, tipo e CNPJ
 */
async buscarVouchersPorCpfETipo(cpf, tipo, cnpj) {
  const response = await api.get('/api/vouchers', {
    params: { cpf, tipo, cnpj },
  });
  return response.data;
},

/**
 * ✅ Marcar voucher como utilizado
 */
async utilizarVoucher(codigo, cnpj) {
  const response = await api.post(`/api/vouchers/${codigo}/utilizar`, {
    cnpj,
  });
  return response.data;
},

/** 📊 Contar vouchers adquiridos por CPF de um CNPJ (Perfil PJ) */
async contarVouchersComprados(cnpj) {
  const response = await api.get(`/api/vouchers/compras/${cnpj}`);
  return response.data;
},

/** 📊 Contar vouchers gerados por CNPJ (Perfil PJ) */
async contarVouchersGerados(cnpj) {
  const response = await api.get(`/api/vouchers/${cnpj}/gerados`);
  return response.data;
},


};
