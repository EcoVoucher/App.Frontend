// utils/storage.js
import { Platform } from "react-native";

const KEYS = {
  token: "@ecoapp:token",
  user: "@ecoapp:user",
};

// helpers JSON seguros
function safeParse(json) {
  try { return json ? JSON.parse(json) : null; } catch { return null; }
}
function safeStringify(obj) {
  try { return JSON.stringify(obj); } catch { return "null"; }
}

// fallback em memória (se localStorage indisponível/bloqueado)
const memoryStore = new Map();
const mem = {
  async getItem(key) { return memoryStore.get(key) ?? null; },
  async setItem(key, value) { memoryStore.set(key, value); },
  async removeItem(key) { memoryStore.delete(key); },
  async multiRemove(keys) { keys.forEach((k) => memoryStore.delete(k)); },
  async clear() { memoryStore.clear(); },
};

// camada base por plataforma
let base;
if (Platform.OS === "web") {
  const hasLS = typeof window !== "undefined" && window.localStorage;
  if (hasLS) {
    base = {
      async getItem(key) { try { return window.localStorage.getItem(key); } catch { return null; } },
      async setItem(key, value) { try { window.localStorage.setItem(key, value); } catch {} },
      async removeItem(key) { try { window.localStorage.removeItem(key); } catch {} },
      async multiRemove(keys) { try { keys.forEach((k) => window.localStorage.removeItem(k)); } catch {} },
      async clear() { try { window.localStorage.clear(); } catch {} },
    };
  } else {
    base = mem;
  }
} else {
  // import dinâmico para não quebrar na web
  base = require("@react-native-async-storage/async-storage").default;
}

// migração de chaves antigas ("token", "usuario") → novas (1x)
let migrated = false;
async function migrateLegacyKeysOnce() {
  if (migrated) return;
  migrated = true;
  try {
    const legacyToken = await base.getItem("token");
    const legacyUser = await base.getItem("usuario");
    const curToken = await base.getItem(KEYS.token);
    const curUser = await base.getItem(KEYS.user);

    if (legacyToken && !curToken) {
      await base.setItem(KEYS.token, legacyToken);
      try { await base.removeItem("token"); } catch {}
    }
    if (legacyUser && !curUser) {
      await base.setItem(KEYS.user, legacyUser);
      try { await base.removeItem("usuario"); } catch {}
    }
  } catch {
    // ignore
  }
}

export const storage = {
  KEYS,

  async getToken() {
    await migrateLegacyKeysOnce();
    return (await base.getItem(KEYS.token)) || null;
  },
  async setToken(token) {
    if (!token) { await base.removeItem(KEYS.token); return; }
    await base.setItem(KEYS.token, String(token));
  },
  async removeToken() {
    await base.removeItem(KEYS.token);
  },

  async getUser() {
    await migrateLegacyKeysOnce();
    return safeParse(await base.getItem(KEYS.user));
  },
  async setUser(user) {
    if (user == null) { await base.removeItem(KEYS.user); return; }
    await base.setItem(KEYS.user, safeStringify(user));
  },
  async removeUser() {
    await base.removeItem(KEYS.user);
  },

  async clearAll() {
    if (typeof base.multiRemove === "function") {
      await base.multiRemove([KEYS.token, KEYS.user]);
    } else {
      await Promise.all([base.removeItem(KEYS.token), base.removeItem(KEYS.user)]);
    }
  },
};

export default storage;
