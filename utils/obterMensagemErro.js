/**
 * Trata mensagens de erro da API de forma robusta.
 * Captura erros conhecidos (400, 404...) e também erros inesperados.
 *
 * @param {object} error - Objeto de erro vindo do axios ou outro fetch.
 * @param {string} mensagemPadrao - Mensagem fallback.
 * @returns {string} - Mensagem de erro tratada.
 */
export function obterMensagemErro(error, mensagemPadrao = 'Erro inesperado.') {
  return (
    error?.response?.data?.message ||   // 🔗 Quando API retorna 'message'
    error?.response?.data?.mensagem ||  // 🔗 Quando API retorna 'mensagem'
    error?.response?.data?.erro ||      // 🔗 Quando API retorna 'erro'
    error?.message ||                   // 🔗 Erros de rede, timeout, etc.
    mensagemPadrao                      // 🔗 Fallback final
  );
}
