import { Platform } from "react-native";

const KEYS = {
  token: "@ecoapp:token",
  user: "@ecoapp:user",
};

function safeParse(json) {
  try { return json ? JSON.parse(json) : null; } catch { return null; }
}
function safeStringify(obj) {
  try { return JSON.stringify(obj); } catch { return "null"; }
}

let base;
if (Platform.OS === "web") {
  base = {
    async getItem(key) { try { return localStorage.getItem(key); } catch { return null; } },
    async setItem(key, value) { try { localStorage.setItem(key, value); } catch {} },
    async removeItem(key) { try { localStorage.removeItem(key); } catch {} },
    async multiRemove(keys) { try { keys.forEach((k) => localStorage.removeItem(k)); } catch {} },
    async clear() { try { localStorage.clear(); } catch {} },
  };
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  base = require("@react-native-async-storage/async-storage").default;
}

// Migra chaves antigas ("token", "usuario") → novas, apenas 1x.
let _migrated = false;
async function migrateLegacyKeysOnce() {
  if (_migrated) return;
  _migrated = true;
  try {
    const legacyToken = await base.getItem("token");
    const legacyUser = await base.getItem("usuario");
    if (legacyToken && !(await base.getItem(KEYS.token))) {
      await base.setItem(KEYS.token, legacyToken);
      await base.removeItem("token");
    }
    if (legacyUser && !(await base.getItem(KEYS.user))) {
      await base.setItem(KEYS.user, legacyUser);
      await base.removeItem("usuario");
    }
  } catch {
    // noop
  }
}

export const storage = {
  KEYS,

  // Token
  async getToken() {
    await migrateLegacyKeysOnce();
    return (await base.getItem(KEYS.token)) || null;
  },
  async setToken(token) {
    if (!token) {
      await base.removeItem(KEYS.token);
      return;
    }
    await base.setItem(KEYS.token, String(token)); // garante string
  },
  async removeToken() {
    await base.removeItem(KEYS.token);
  },

  // User
  async getUser() {
    await migrateLegacyKeysOnce();
    return safeParse(await base.getItem(KEYS.user));
  },
  async setUser(user) {
    if (user == null) {
      await base.removeItem(KEYS.user);
      return;
    }
    await base.setItem(KEYS.user, safeStringify(user));
  },
  async removeUser() {
    await base.removeItem(KEYS.user);
  },

  // Util
  async clearAll() {
    // remove só as chaves do app
    if (typeof base.multiRemove === "function") {
      await base.multiRemove([KEYS.token, KEYS.user]);
    } else {
      await Promise.all([base.removeItem(KEYS.token), base.removeItem(KEYS.user)]);
    }
  },
};

export default storage;
