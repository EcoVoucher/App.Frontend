// utils/obterMensagemErro.js
export function obterMensagemErro(error, mensagemPadrao = "Erro inesperado.") {
  // Aceita {http, code, message} OU {status, code, message} OU erro cru do Axios
  const http = Number(error?.http ?? error?.status ?? error?.response?.status ?? 0);
  const code =
    error?.code ??
    error?.response?.data?.code ??
    error?.response?.code ??
    null;

  // Mensagem preferida do backend (string) ou lista de erros (ex.: class-validator)
  const rawMsg =
    error?.message ??
    error?.response?.data?.message ??
    error?.response?.data?.mensagem ??
    error?.response?.data?.erro ??
    null;

  const arrayErrors = error?.response?.data?.errors;
  const message =
    (typeof rawMsg === "string" && rawMsg.trim())
      ? rawMsg
      : (Array.isArray(arrayErrors)
          ? arrayErrors
              .map((e) => {
                if (typeof e === "string") return e;
                if (e && typeof e === "object") return e.message || e.msg || e.error || null;
                return null;
              })
              .filter(Boolean)
              .join("\n")
          : null);

  // ---- Rede / timeout
  const msgLower = String(error?.message ?? "").toLowerCase();
  if (code === "ERR_NETWORK" || code === "NETWORK_ERROR" || msgLower.includes("network error")) {
    return "Falha de rede ou timeout. Verifique sua conexão e tente novamente.";
  }
  if (code === "NETWORK_TIMEOUT" || code === "ECONNABORTED" || msgLower.includes("timeout")) {
    return "Tempo de conexão esgotado. Tente novamente.";
  }

  // ---- Payload inesperado (ex.: 200 sem corpo)
  if (code === "BAD_PAYLOAD") {
    return "Serviço respondeu sem dados válidos. Tente novamente em instantes.";
  }

  // ---- Códigos de domínio (quando o back enviar)
  if (code === "AUTH_INVALID") return "CPF/CNPJ ou senha inválidos.";
  if (code === "INSUFFICIENT_POINTS") return "Pontos insuficientes para concluir a compra.";
  if (code === "VOUCHER_NOT_FOUND") return "Voucher não encontrado.";
  if (code === "VOUCHER_EXPIRED") return "Voucher expirado.";
  if (code === "VOUCHER_ALREADY_USED") return "Este voucher já foi utilizado.";

  // ---- HTTP genéricos
  if (http === 429) return message || "Muitas tentativas. Tente novamente em instantes.";
  if (http === 412) return message || "Pré-condição não atendida. Atualize e tente novamente.";
  if (http === 409) return message || "Registro já existe (CPF/CNPJ já cadastrado).";
  if (http === 401) return "Sessão expirada. Faça login novamente.";
  if (http === 403) return "Você não tem permissão para isso.";
  if (http === 404) return "Recurso não encontrado.";
  if (http === 422 || http === 400) return message || "Dados inválidos. Verifique os campos.";
  if (http >= 500) return "Tente novamente mais tarde, a equipe de suporte já foi acionada.";

  // ---- Fallback
  return message || mensagemPadrao;
}
