export function obterMensagemErro(error, mensagemPadrao = 'Erro inesperado.') {
  const status = error?.response?.status;

  if (status === 400) return 'Dados inválidos. Verifique os campos.';
  if (status === 401) return 'Sessão expirada. Faça login novamente.';
  if (status === 403) return 'Você não tem permissão para isso.';
  if (status === 404) return 'Recurso não encontrado.';
  if (status === 500) return ' Tente novamente mais tarde, a aquipe de suporte do aplicativo já foi acionada .';

  return (
    error?.response?.data?.message ||
    error?.response?.data?.mensagem ||
    error?.response?.data?.erro ||
    error?.message ||
    mensagemPadrao
  );
}
