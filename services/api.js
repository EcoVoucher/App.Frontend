import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  console.warn('[API] EXPO_PUBLIC_API_URL não definida. Confira seu .env');
}

console.log('[API] baseURL =', baseURL);

const api = axios.create({
  baseURL: baseURL ?? 'http://localhost:3000', // fallback opcional
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers['access-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
