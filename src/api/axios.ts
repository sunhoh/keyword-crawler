import axios from 'axios';

export const naverInstance = axios.create({
  baseURL: 'https://openapi.naver.com/v1/search',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
    'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
    'Cache-Control': 'no-cache',
  },
});