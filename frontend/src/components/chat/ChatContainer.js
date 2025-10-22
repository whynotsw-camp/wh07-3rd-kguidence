import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import chatService from '../../services/chatService';
import './Chat.css';

function ChatContainer({ onDestinationsUpdate }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 메시지 목록 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 메시지 전송
  const handleSendMessage = async (messageText) => {
    // 사용자 메시지 추가
    const userMessage = {
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // API 호출
      const response = await chatService.sendMessage(messageText);

      // GPT 응답 추가
      const gptMessage = {
        text: response.response,
        isUser: false,
        timestamp: new Date(response.datetime),
      };
      setMessages((prev) => [...prev, gptMessage]);

      // 여행지가 추출되었으면 부모에게 알림
      if (response.extracted_destinations && response.extracted_destinations.length > 0) {
        onDestinationsUpdate && onDestinationsUpdate();
      }

    } catch (error) {
      console.error('메시지 전송 실패:', error);
      const errorMessage = {
        text: '죄송합니다. 메시지 전송 중 오류가 발생했습니다.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>👋 안녕하세요! 여행 계획을 도와드릴게요.</p>
            <p>가고 싶은 여행지를 말씀해주세요!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.text}
              isUser={msg.isUser}
            />
          ))
        )}
        {loading && (
          <div className="chat-loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSendMessage} disabled={loading} />
    </div>
  );
}

export default ChatContainer;
