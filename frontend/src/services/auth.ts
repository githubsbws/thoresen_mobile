import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from './api';

export interface User {
  id: string;
  name: string;
  role: string;
  vessel: string;
  email: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

/**
 * ============================================================
 *  MOCK MODE
 * ============================================================
 * ตอนนี้ Backend ยังไม่พร้อม ใช้ mock เพื่อทดสอบ flow ก่อน
 * เมื่อ Backend เสร็จแล้ว ให้เปลี่ยน MOCK_MODE = false
 * แล้วระบบจะยิง request ไปที่ api (axios) จริงทันที
 * ============================================================
 */
const MOCK_MODE = false;

const MOCK_USER: User = {
  id: 'u-001',
  name: 'Captain Somchai',
  role: 'นายเรือ',
  vessel: 'THOR BRAVE',
  email: 'somchai@thorconn.com',
};

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * ส่ง Request ขอเข้าสู่ระบบ → Backend ตรวจสอบสิทธิ์ → ส่ง token + user กลับ
 */
export async function login(username: string, password: string): Promise<LoginResult> {
  if (MOCK_MODE) {
    await delay(700);

    if (!username || !password) {
      throw new Error('กรุณากรอกอีเมลและรหัสผ่าน');
    }
    // mock: รับทุก username/password ที่ไม่ว่าง (เปลี่ยนเงื่อนไขได้)
    const token = 'mock-token-' + Date.now();
    setAuthToken(token);
    return { token, user: { ...MOCK_USER, email: username } };
  }

  // ── เชื่อม Backend จริง ──────────────────────────────────────
  // const res = await api.post<LoginResult>('/auth/login', { username, password });
 try {
  const res = await api.post<LoginResult>('/auth/login', {
    username,
    password,
  });

  console.log('LOGIN SUCCESS:', res.data);

  // เก็บ token
  setAuthToken(res.data.token);

  // เก็บ user
  await AsyncStorage.setItem(
    'user',
    JSON.stringify(res.data.user),
  );

  // เก็บ token ไว้ด้วย เผื่อเปิดแอปใหม่
  await AsyncStorage.setItem(
    'token',
    res.data.token,
  );

  return res.data;
} catch (error: any) {
  console.log('LOGIN ERROR');
  console.log('message:', error?.message);
  console.log('code:', error?.code);
  console.log('response:', error?.response?.data);
  console.log('status:', error?.response?.status);

  throw error;
}
  // setAuthToken(res.data.token);
  // return res.data;
}

/**
 * Logout — เคลียร์ session ฝั่ง Frontend (และแจ้ง Backend ถ้าจำเป็น)
 */
export async function logout(): Promise<void> {
  setAuthToken(null);

  await AsyncStorage.multiRemove([
    'token',
    'user',
  ]);
}

/**
 * ดึงข้อมูล user ปัจจุบันจาก token ที่เก็บไว้ (ใช้ตอนเปิดแอปใหม่)
 */
export async function getCurrentUser(token: string): Promise<User> {
  if (MOCK_MODE) {
    await delay(300);
    setAuthToken(token);
    return MOCK_USER;
  }

  setAuthToken(token);
  const res = await api.get<User>('/auth/me');
  return res.data;
}

/**
 * สมัครสมาชิก
 */
export async function register(data: { name: string; email: string; password: string }): Promise<LoginResult> {
  if (MOCK_MODE) {
    await delay(700);
    const token = 'mock-token-' + Date.now();
    setAuthToken(token);
    return { token, user: { ...MOCK_USER, name: data.name, email: data.email } };
  }

  const res = await api.post<LoginResult>('/auth/register', data);
  setAuthToken(res.data.token);
  return res.data;
}
