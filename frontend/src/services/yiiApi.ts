// src/services/yiiApi.ts
/// ยิงเข้า public ip ไม่ได้ ///
import axios from 'axios';

export const YII_API_BASE_URL =
  'https://thorconn.com/';

export const yiiApi = axios.create({
  baseURL: YII_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let yiiAuthToken: string | null = null;

export function setYiiAuthToken(
  token: string | null,
) {
  yiiAuthToken = token;

  if (token) {
    yiiApi.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${token}`;
  } else {
    delete yiiApi.defaults.headers.common[
      'Authorization'
    ];
  }
}

export function getYiiAuthToken() {
  return yiiAuthToken;
}