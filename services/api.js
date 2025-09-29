// services/api.js
import axios from "axios";
import storage from "../utils/storage"; // nosso wrapper que unifica AsyncStorage e localStorage

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL && __DEV__) {
  // só loga em desenvolvimento
  // eslint-disable-next-line no-console
  console.warn("[API] EXPO_PUBLIC_API_URL não definida. Confira seu .env");
}

export const api = axios.create({
  baseURL: baseURL ?? "http://localhost:3000", // fallback para dev local
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor:
 * - injeta Authorization Bearer <token>
 * - mantém 'access-token' se seu backend ainda usar esse header
 */
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // remova se não precisar manter compatibilidade:
      config.headers["access-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Normaliza qualquer erro do Axios em um objeto único
 * -> { status, code, message, details }
 */
function normalizeError(err) {
  // Resposta da API com status != 2xx
  if (err?.response) {
    const { status, data } = err.response;
    return {
      status,
      code: data?.code ?? "API_ERROR",
      message: data?.message ?? "Erro ao processar a solicitação.",
      details: data?.errors ?? null,
    };
  }
  // Sem resposta (timeout, offline, DNS)
  if (err?.request) {
    return {
      status: 0,
      code: "NETWORK_ERROR",
      message: "Falha de rede ou timeout. Verifique sua conexão e tente novamente.",
      details: null,
    };
  }
  // Erro ao montar requisição/configuração
  return {
    status: 0,
    code: "UNKNOWN_ERROR",
    message: err?.message ?? "Erro inesperado ao preparar a requisição.",
    details: null,
  };
}

/**
 * Response interceptor:
 * - devolve sucesso “cru”
 * - converte qualquer erro via normalizeError
 */
api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(normalizeError(error))
);

export default api;
