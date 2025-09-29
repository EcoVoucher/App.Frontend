
import { Platform } from "react-native";

const KEYS = {
  token: "@ecoapp:token",
  user: "@ecoapp:user",
};

function safeParse(json) {
  try {
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}
function safeStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return "";
  }
}

let base;

if (Platform.OS === "web") {
  base = {
    async getItem(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    async setItem(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {}
    },
    async removeItem(key) {
      try {
        localStorage.removeItem(key);
      } catch {}
    },
    async multiRemove(keys) {
      try {
        keys.forEach((k) => localStorage.removeItem(k));
      } catch {}
    },
    async clear() {
      try {
        localStorage.clear();
      } catch {}
    },
  };
} else {
  // Mobile
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  base = require("@react-native-async-storage/async-storage").default;
}

// Migra chaves antigas ("token", "usuario") para o padrão novo, uma vez.
async function migrateLegacyKeys() {
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
  } catch {}
}

export const storage = {
  KEYS,
  migrateLegacyKeys,

  // Token
  async getToken() {
    await migrateLegacyKeys();
    return (await base.getItem(KEYS.token)) || null;
  },
  async setToken(token) {
    if (!token) return this.removeToken();
    await base.setItem(KEYS.token, token);
  },
  async removeToken() {
    await base.removeItem(KEYS.token);
  },

  // User
  async getUser() {
    await migrateLegacyKeys();
    return safeParse(await base.getItem(KEYS.user));
  },
  async setUser(user) {
    await base.setItem(KEYS.user, safeStringify(user ?? null));
  },
  async removeUser() {
    await base.removeItem(KEYS.user);
  },

  // Util
  async clearAll() {
    await base.multiRemove([KEYS.token, KEYS.user]);
  },
};

export default storage;
