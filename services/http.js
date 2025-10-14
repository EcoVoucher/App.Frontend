// services/http.js
import api from "./api";

// Mapeia status HTTP -> códigos estáveis de domínio
const HTTP_CODE_MAP = {
  400: "VALIDATION_ERROR",
  401: "AUTH_INVALID",
  403: "AUTH_BLOCKED",
  404: "NOT_FOUND",
};

// Converte qualquer erro Axios em { code, http, details? }
export function mapAxiosError(err) {
  // Resposta com status != 2xx
  if (err?.response) {
    const http = err.response.status;
    const code = HTTP_CODE_MAP[http] || (http >= 500 ? "SERVER_ERROR" : "UNKNOWN");
    return { code, http, details: err.response.data ?? null };
  }

  // Sem resposta (timeout/offline/DNS)
  const msg = String(err?.message ?? "").toLowerCase();
  if (msg.includes("timeout") || err?.code === "ECONNABORTED") {
    return { code: "NETWORK_TIMEOUT", http: 0 };
  }
  return { code: "NETWORK_ERROR", http: 0 };
}

// Wrapper principal: aceita config do Axios e um validador opcional do payload
export async function httpRequest(config, { validate } = {}) {
  try {
    const res = await api.request(config);
    let data = res?.data;
    // Trata corpo vazio (""/undefined) como null
    if (data === "" || typeof data === "undefined") data = null;

    if (validate && !validate(data)) {
      return { ok: false, error: { code: "BAD_PAYLOAD", http: res?.status ?? 0 } };
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: mapAxiosError(err) };
  }
}

// Açúcares
export const http = {
  get: (url, config) => httpRequest({ url, method: "GET", ...(config || {}) }),
  post: (url, body, config) =>
    httpRequest({ url, method: "POST", data: body, ...(config || {}) }),
  put: (url, body, config) =>
    httpRequest({ url, method: "PUT", data: body, ...(config || {}) }),
  patch: (url, body, config) =>                    // 👈 ADICIONE
    httpRequest({ url, method: "PATCH", data: body, ...(config || {}) }),
  del: (url, config) => httpRequest({ url, method: "DELETE", ...(config || {}) }),

};

/**
 * Back-compat: sua função handle(promise) melhorada
 * - agora suporta validador opcional: handle(api.post(...), validateFn)
 */
export async function handle(promise, validate) {
  try {
    const res = await promise; // promessa do axios (api.request/ api.get/post/…)
    let data = res?.data;
    if (data === "" || typeof data === "undefined") data = null;

    if (validate && !validate(data)) {
      return { ok: false, error: { code: "BAD_PAYLOAD", http: res?.status ?? 0 } };
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: mapAxiosError(err) };
  }
}
