import axios from 'axios';

/**
 * Base URL ของ Backend API
 * ตอนนี้ยังไม่มี backend จริง — เปลี่ยนเป็น URL จริงตอน deploy
 * ตัวอย่าง: 'https://api.thorconn.com/v1'
 */
export const API_BASE_URL = 'https://api-thorconn.24elearning.com/v1';

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
