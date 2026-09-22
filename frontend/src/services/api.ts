import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Base URL ของ Backend API
 * - Expo Go / Metro bundler: ดึง IP เครื่อง host อัตโนมัติ (ใช้ได้ทั้ง iOS/Android/เครื่องจริง)
 * - iOS Simulator: http://localhost:3000/v1
 * - Android Emulator: http://10.0.2.2:3000/v1
 */
const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(':').shift();

  if (localhost) {
    return `http://${localhost}:3000/v1`;
  }

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/v1'
    : 'http://localhost:3000/v1';
};

export const API_BASE_URL = getBaseUrl();
console.log('API_BASE_URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// แนบ token อัตโนมัติทุก request (ถ้ามี)
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export function getAuthToken() {
  return authToken;
}
