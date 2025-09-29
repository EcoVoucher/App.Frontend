// utils/obterMensagemErro.js
export function obterMensagemErro(error, mensagemPadrao = 'Erro inesperado.') {
  // 1) Erro normalizado (ex.: { status, code, message } do helper `handle`)
  if (error && typeof error === 'object' && ('status' in error || 'code' in error || 'message' in error)) {
    const { status, code, message } = error;

    if (code === 'NETWORK_ERROR' || code === 'ERR_NETWORK') {
      return 'Falha de rede ou timeout. Verifique sua conexão e tente novamente.';
    }
    if (status === 409) return message || 'Registro já existe (CPF ou CNPJ já cadastrado).';
    if (status === 401) return 'Sessão expirada. Faça login novamente.';
    if (status === 403) return 'Você não tem permissão para isso.';
    if (status === 404) return 'Recurso não encontrado.';
    if (status === 400) return message || 'Dados inválidos. Verifique os campos.';
    if (status >= 500) return 'Tente novamente mais tarde, a equipe de suporte já foi acionada.';

    return message || mensagemPadrao;
  }

  // 2) Erro "cru" do axios
  const status = error?.response?.status;

  if (status === 409) {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.mensagem ||
      'Registro já existe (CPF ou CNPJ já cadastrado).'
    );
  }
  if (status === 400) return 'Dados inválidos. Verifique os campos.';
  if (status === 401) return 'Sessão expirada. Faça login novamente.';
  if (status === 403) return 'Você não tem permissão para isso.';
  if (status === 404) return 'Recurso não encontrado.';
  if (status >= 500) return 'Tente novamente mais tarde, a equipe de suporte já foi acionada.';

  // 3) Erro de rede do axios
  const code = error?.code;
  if (code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
    return 'Falha de rede ou timeout. Verifique sua conexão e tente novamente.';
  }

  // 4) Fallback
  return (
    error?.response?.data?.message ||
    error?.response?.data?.mensagem ||
    error?.response?.data?.erro ||
    error?.message ||
    mensagemPadrao
  );
}
