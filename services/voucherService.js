// services/voucherService.js
import api from './api';
import { handle } from './http';

const limpar = (s) => String(s || '').trim();
const soDigitos = (s) => String(s || '').replace(/\D/g, '');

/**
 * 🔗 Service responsável pela gestão de Vouchers (PJ e PF)
 * Todos os métodos retornam { ok: true, data } ou { ok: false, error }
 */
export const VouchersService = {
  /** 🧾 Listar vouchers emitidos pelo PJ (opcional cnpj como filtro) */
  listarVouchers(cnpj) {
    const c = soDigitos(cnpj);
    return c
      ? handle(api.get('/vouchers', { params: { cnpj: c } }))
      : handle(api.get('/vouchers'));
  },

  /** 📊 Estatísticas (totalComprados, porLote, etc.) */
  obterEstatisticas() {
    return handle(api.get('/vouchers/estatisticas'));
  },

  /**
   * 🎟️ Gerar um novo lote de vouchers (PJ)
   * payload: { tipo, produtos, quantidade, dataValidade(YYYY-MM-DD) }
   */
  gerarVoucher({ tipo, produtos, quantidade, dataValidade }) {
    return handle(
      api.post('/vouchers', {
        tipo: limpar(tipo),
        produtos: Array.isArray(produtos) ? produtos : [],
        quantidade: Number(quantidade),
        dataValidade: limpar(dataValidade),
      })
    );
  },

  /** 🔍 Validar por código (PJ) */
  validarVoucherPorCodigo(codigo) {
    return handle(api.get(`/vouchers/validar/${limpar(codigo)}`));
  },

  /** 🔍 Buscar vouchers adquiridos por CPF+Tipo (PJ) */
  buscarVouchersPorCpfETipo(cpf, tipo) {
    return handle(
      api.get('/vouchers/adquiridos', {
        params: { cpf: soDigitos(cpf), tipo: limpar(tipo) },
      })
    );
  },

  /** ✅ Marcar voucher como utilizado (PJ) */
  utilizarVoucher(codigo) {
    return handle(api.post('/vouchers/utilizar', { codigo: limpar(codigo) }));
  },

  /** 🛍️ Listar vouchers disponíveis para PF (catálogo) */
  listarVouchersDisponiveisPF() {
    return handle(api.get('/vouchers/disponiveis'));
  },

  /**
   * 🛒 Comprar vouchers (PF)
   * cpf: string, lista: array de idLote
   */
  comprarVouchers(cpf, lista) {
    return handle(
      api.post('/vouchers/comprar', {
        cpf: soDigitos(cpf),
        vouchers: Array.isArray(lista) ? lista : [],
      })
    );
  },
};
