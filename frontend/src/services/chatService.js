import api from './api';

const chatService = {
  // 메시지 전송
  sendMessage: async (message) => {
    try {
      const response = await api.post('/api/chat/send', { message });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || '메시지 전송 실패';
    }
  },

  // 대화 히스토리 조회
  getHistory: async (limit = 50) => {
    try {
      const response = await api.get('/api/chat/history', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || '히스토리 조회 실패';
    }
  },
};

export default chatService;
