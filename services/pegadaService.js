import api from './api';

export const PegadaService = {
  /**
   * 🔍 Busca a última pontuação de pegada — usado na Home.
   */
 async obterUltimaPontuacao(documento) {
  const response = await api.get(`/pegada/${documento}`);
  return response.data;
},


  /**
   * 📜 Busca o histórico completo de pegada — usado na tela Histórico de Pegada.
   */
  async obterHistorico(documento) {
    const response = await api.get(`/pegada/historico/${documento}`);
    return response.data;
  },

  /**
   * 💾 Salva uma nova pontuação de pegada — usado na tela de questionário da Pegada.
   */
  async salvarPontuacao({ documento, pontuacao }) {
    const response = await api.post('/pegada/salvar', {
      documento,
      pontuacao,
    });
    return response.data;
  },
};
