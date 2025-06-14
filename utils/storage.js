import { Platform } from 'react-native';

let storage;

if (Platform.OS === 'web') {
  storage = {
    async getItem(key) {
      return Promise.resolve(localStorage.getItem(key));
    },
    async setItem(key, value) {
      localStorage.setItem(key, value);
      return Promise.resolve();
    },
    async removeItem(key) {
      localStorage.removeItem(key);
      return Promise.resolve();
    },
    async multiRemove(keys) {
      keys.forEach((key) => localStorage.removeItem(key));
      return Promise.resolve();
    },
    async clear() {
      localStorage.clear();
      return Promise.resolve();
    },
  };
} else {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storage = AsyncStorage;
}

export default storage;
