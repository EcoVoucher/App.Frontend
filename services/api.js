import axios from "axios";
import storage from "../utils/storage";

const baseURL = process.env.EXPO_PUBLIC_API_URL;
if (!baseURL && __DEV__) {
  console.warn("[API] EXPO_PUBLIC_API_URL não definida. Confira seu .env");
}

// Callback global para sessão inválida/expirada
let onUnauthorized = () => {};
export function setOnUnauthorized(fn) { onUnauthorized = fn || (() => {}); }

const api = axios.create({
  baseURL: baseURL ?? "http://localhost:3000",
  timeout: 15000,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

api.interceptors.request.use(
  async (config) => {
    if (!config.skipAuth) {
      const token = await storage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers["access-token"] = token; // opcional
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const cfg = err?.config || {};
    const url = String(cfg.url || "").toLowerCase();

    const isAuthLogin = url.includes("/auth/login");
    const askedToSkip = cfg.skipUnauthorized === true;

    if ((status === 401 || status === 403) && !isAuthLogin && !askedToSkip) {
      try { onUnauthorized(); } catch {}
    }
    return Promise.reject(err);
  }
);

export default api;
