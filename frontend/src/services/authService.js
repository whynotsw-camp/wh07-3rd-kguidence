import api from './api';

const authService = {
  // 회원가입
  signup: async (userData) => {
    try {
      const response = await api.post('/api/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || '회원가입 실패';
    }
  },

  // 로그인 (아이디 기반)
  login: async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || '로그인 실패';
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      const response = await api.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || '로그아웃 실패';
    }
  },

  // 현재 사용자 정보
  getMe: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || '사용자 정보 조회 실패';
    }
  },
};

export default authService;
