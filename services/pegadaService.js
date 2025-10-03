// services/pegadaService.js
import { http } from './http';

const soDigitos = (s) => String(s ?? '').replace(/\D/g, '');
const isObj = (d) => d && typeof d === 'object' && !Array.isArray(d);

export const PegadaService = {
  /**
   * 🔍 Última pontuação de pegada (PF) — usado na Home
   * GET /pegada/:documento
   */
  obterUltimaPontuacao(documento) {
    const doc = soDigitos(documento);
    if (!doc) {
      return Promise.resolve({
        ok: false,
        error: { http: 400, code: 'INVALID_IDENTIFIER', message: 'Documento inválido.' },
      });
    }
    return http.get(`/pegada/${doc}`, {
      // aceita objeto (ex.: { pontuacao: 123 }) ou número direto
      validate: (d) => isObj(d) || Number.isFinite(d),
    });
  },

  /**
   * 📜 Histórico completo — usado na tela Histórico de Pegada
   * GET /pegada/historico/:documento
   */
  obterHistorico(documento) {
    const doc = soDigitos(documento);
    if (!doc) {
      return Promise.resolve({
        ok: false,
        error: { http: 400, code: 'INVALID_IDENTIFIER', message: 'Documento inválido.' },
      });
    }
    return http.get(`/pegada/historico/${doc}`, {
      validate: (d) => Array.isArray(d),
    });
  },

  /**
   * 💾 Salva nova pontuação — usado no questionário da Pegada
   * POST /pegada/salvar  { documento, pontuacao }
   */
  salvarPontuacao({ documento, pontuacao }) {
    const doc = soDigitos(documento);
    const score = Number(pontuacao);
    return http.post(
      '/pegada/salvar',
      { documento: doc, pontuacao: score },
      { validate: (d) => d === true || isObj(d) } // aceita boolean ou objeto
    );
  },
};
