// services/voucherService.js
import { http } from "./http";

const limpar = (s) => String(s || "").trim();
const soDigitos = (s) => String(s || "").replace(/\D/g, "");
const isObj = (d) => d && typeof d === "object" && !Array.isArray(d);

export const VouchersService = {
  /** 🧾 Listar vouchers emitidos pelo PJ (opcional cnpj como filtro) */
  listarVouchers(cnpj) {
    const c = soDigitos(cnpj);
    return http.get("/vouchers", {
      params: c ? { cnpj: c } : undefined,
      validate: (d) => Array.isArray(d),
    });
  },

  /** 📊 Estatísticas (totalComprados, porLote, etc.) */
  obterEstatisticas() {
    return http.get("/vouchers/estatisticas", {
      validate: (d) => isObj(d),
    });
  },

  /**
   * 🎟️ Gerar um novo lote de vouchers (PJ)
   * payload: { tipo, produtos, quantidade, dataValidade(YYYY-MM-DD) }
   */
  gerarVoucher({ tipo, produtos, quantidade, dataValidade }) {
    const qtd = Number.parseInt(quantidade, 10);
    return http.post(
      "/vouchers",
      {
        tipo: limpar(tipo),
        produtos: Array.isArray(produtos) ? produtos : [],
        quantidade: Number.isFinite(qtd) ? qtd : 0,
        dataValidade: limpar(dataValidade),
      },
      { validate: (d) => isObj(d) }
    );
  },

  /** 🔍 Validar por código (PJ) */
  validarVoucherPorCodigo(codigo) {
    const code = encodeURIComponent(limpar(codigo));
    return http.get(`/vouchers/validar/${code}`, {
      validate: (d) => isObj(d),
    });
  },

  /** 🔍 Buscar vouchers adquiridos por CPF+Tipo (PJ) */
  buscarVouchersPorCpfETipo(cpf, tipo) {
    return http.get("/vouchers/adquiridos", {
      params: { cpf: soDigitos(cpf), tipo: limpar(tipo).toLowerCase() }, // 👈 normalize
      validate: (d) => Array.isArray(d),
    });
  },

  /** ✅ Marcar voucher como utilizado (PJ) */
  utilizarVoucher(codigo) {
    return http.post(
      "/vouchers/utilizar",
      { codigo: limpar(codigo) },
      { validate: (d) => d === true || isObj(d) } // 👈 aceita boolean ou objeto
    );
  },

  /** 🛍️ Listar vouchers disponíveis para PF (catálogo) */
  listarVouchersDisponiveisPF() {
    return http.get("/vouchers/disponiveis", {
      validate: (d) => Array.isArray(d),
    });
  },

  /**
   * 🛒 Comprar vouchers (PF)
   * cpf: string, lista: array de idLote
   */
  comprarVouchers(cpf, lista) {
    const uniqueIds = Array.from(new Set(Array.isArray(lista) ? lista : []));
    return http.post(
      "/vouchers/comprar",
      { cpf: soDigitos(cpf), vouchers: uniqueIds },
      { validate: (d) => isObj(d) }
    );
  },
};
