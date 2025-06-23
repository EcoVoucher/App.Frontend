import api from './api';

/**
 * 🔗 Service responsável por toda a gestão de Vouchers (PJ e PF).
 * Inclui geração, listagem, estatísticas, validação, compra e uso de vouchers.
 * ✔️ Toda a lógica de movimentação de pontos e manipulação dos vouchers passa por esses endpoints.
 */
export const VouchersService = {

  /**
   * 🧾 Listar todos os vouchers emitidos pelo PJ logado.
   * 🔸 A API deve retornar os lotes de vouchers criados por este CNPJ.
   * ✔️ Inclui:
   * - Tipo do voucher (Alimentacao, Higiene, Transporte)
   * - Produtos associados
   * - Quantidade disponível
   * - Data de validade
   * - Lista de códigos dos vouchers
   * 📥 GET → /api/vouchers
   */
  async listarVouchers() {
    const { data } = await api.get('/api/vouchers');
    return data;
  },

  /**
   * 📊 Obter estatísticas dos vouchers (PJ).
   * 🔸 Retorna:
   * - Quantidade total de vouchers gerados por este CNPJ
   * - Quantidade total de vouchers adquiridos por usuários PF
   * - Detalhamento por lote ou por tipo
   * ✔️ Permite ao PJ visualizar seu desempenho na plataforma.
   * 📥 GET → /api/vouchers/estatisticas
   */
  async obterEstatisticas() {
    const { data } = await api.get('/api/vouchers/estatisticas');
    return data;
  },

  /**
   * 🎟️ Gerar um novo lote de vouchers (PJ).
   * 🔸 Backend deve validar:
   * - Se os produtos escolhidos pertencem ao tipo do voucher.
   * - Se a quantidade é válida.
   * - Gerar códigos únicos e salvar.
   * ✔️ Impacto no sistema:
   * - Cria um lote com os códigos.
   * - Esses códigos ficam disponíveis para que os usuários PF possam adquirir.
   * 📤 POST → /api/vouchers
   * 🔸 Payload:
   * {
   *   tipo: 'Alimentacao' | 'Higiene' | 'Transporte',
   *   produtos: [Array de produtos],
   *   quantidade: Number,
   *   dataValidade: 'YYYY-MM-DD'
   * }
   */
  async gerarVoucher({ tipo, produtos, quantidade, dataValidade }) {
    const { data } = await api.post('/api/vouchers', {
      tipo,
      produtos,
      quantidade,
      dataValidade,
    });
    return data;
  },

  /**
   * 🔍 Validar voucher por código (PJ).
   * ✔️ Verifica se:
   * - O voucher existe.
   * - Pertence ao CNPJ logado.
   * - Está com status válido, expirado ou utilizado.
   * ✔️ Retorna os detalhes completos do voucher, incluindo:
   * - Código, tipo, produtos, empresa, endereço, validade e status.
   * 📥 GET → /api/vouchers/validar/{codigo}
   */
  async validarVoucherPorCodigo(codigo) {
    const { data } = await api.get(`/api/vouchers/validar/${codigo}`);
    return data;
  },

  /**
   * ✅ Marcar voucher como utilizado (PJ).
   * ✔️ Backend deve:
   * - Alterar o status do voucher de 'valido' para 'utilizado'.
   * - Esse processo confirma que o voucher foi entregue, resgatado ou usado no mundo físico.
   * 🚫 NÃO afeta pontos, pois os pontos foram debitados no momento da compra (PF).
   * 📤 POST → /api/vouchers/utilizar
   * 🔸 Payload:
   * {
   *   codigo: 'VOUC-2025-001'
   * }
   */
  async utilizarVoucher(codigo) {
    const { data } = await api.post('/api/vouchers/utilizar', { codigo });
    return data;
  },

  /**
   * 🛍️ Listar vouchers disponíveis para PF (Catálogo).
   * ✔️ Mostra apenas vouchers:
   * - Não expirados.
   * - Com códigos disponíveis.
   * - Que foram gerados por algum PJ.
   * ✔️ Backend deve calcular automaticamente:
   * - Se a data de validade é maior ou igual à data atual.
   * - Se ainda há códigos disponíveis no lote.
   * 📥 GET → /api/vouchers/disponiveis
   */
  async listarVouchersDisponiveisPF() {
    const { data } = await api.get('/api/vouchers/disponiveis');
    return data;
  },

  /**
   * 🛒 Comprar vouchers (PF).
   * ✔️ Backend faz:
   * - Verifica se o CPF possui saldo de pontos suficiente.
   * - Debita os pontos do CPF.
   * - Remove um código do lote disponível.
   * - Cria uma movimentação de pontos do tipo 'saida'.
   * - Status do voucher fica como 'valido'.
   * 🔸 Ao utilizar futuramente, o status muda para 'utilizado'.
   * 📤 POST → /api/vouchers/comprar
   * 🔸 Payload:
   * {
   *   cpf: '12345678900',
   *   vouchers: [
   *     {
   *       idLote: 'VOUC-2025-001',
   *       tipo: 'Alimentacao',
   *       produtos: [...],
   *       empresa: 'Supermercado X',
   *       endereco: 'Rua tal',
   *       validade: '2025-07-01T00:00:00Z',
   *       pontos: 150
   *     }
   *   ]
   * }
   */
  async comprarVouchers(cpf, lista) {
    const { data } = await api.post('/api/vouchers/comprar', {
      cpf,
      vouchers: lista,
    });
    return data;
  },
};
