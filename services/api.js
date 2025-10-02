// services/api.js
import axios from "axios";
import storage from "../utils/storage";

const baseURL = process.env.EXPO_PUBLIC_API_URL;
if (!baseURL && __DEV__) {
  // eslint-disable-next-line no-console
  console.warn("[API] EXPO_PUBLIC_API_URL não definida. Confira seu .env");
}

// Callback global para sessão inválida/expirada
let onUnauthorized = () => {};
export function setOnUnauthorized(fn) { onUnauthorized = fn || (() => {}); }

const api = axios.create({
  baseURL: baseURL ?? "http://localhost:3000",
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    if (!config.skipAuth) {
      const token = await storage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Se não precisa manter compatibilidade, remova a linha abaixo:
        config.headers["access-token"] = token;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// NÃO normaliza aqui — deixa para o http.js
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const s = err?.response?.status;
    if (s === 401 || s === 403) {
      try { onUnauthorized(); } catch {}
    }
    return Promise.reject(err);
  }
);

export default api;
