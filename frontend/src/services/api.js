import axios from 'axios';

// API 기본 URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 쿠키 전송 허용
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 에러 시 로그인 페이지로 리다이렉트
    if (error.response && error.response.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
