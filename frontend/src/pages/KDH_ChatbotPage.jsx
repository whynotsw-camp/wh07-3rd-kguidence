import React, { useState, useEffect, useRef } from 'react';  // ← useState 추가 확인
import '../styles/KDH_ChatbotPage.css';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';

function KDH_ChatbotPage() {
    // 🔥 state 선언 추가
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // 초기 메시지
    useEffect(() => {
        setMessages([
            {
                id: 1,
                text: 'Enjoy your trip to Korea with k-guidance!',
                isUser: false,
                timestamp: new Date()
            }
        ]);
    }, []);

    // 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 메시지 전송 핸들러
    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        // 사용자 메시지 추가
        const userMessage = {
            id: Date.now(),
            text: text,
            isUser: true,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            // API 호출
            const response = await fetch('http://localhost:8000/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();

            // AI 응답 추가
            const aiMessage = {
                id: Date.now() + 1,
                text: data.response,
                isUser: false,
                timestamp: new Date(),
                extractedDestinations: data.extracted_destinations || []
            };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error('Error sending message:', error);
            // 에러 메시지
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Sorry, something went wrong. Please try again.',
                isUser: false,
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="kdh-chatbot-container">
            <main className="kdh-main-chat-area">
                {/* 상단 헤더 */}
                <header className="kdh-chat-header">
                    <span className="kdh-header-back-icon">←</span>
                    <span className="kdh-chat-title">K-POP DEMON HUNTERS</span>
                    <span className="kdh-subtitle">Trip Planning Assistant</span>
                    <div className="weather-info">
                        <span className="weather-icon">☀️</span>
                        <span>Seoul weather</span>
                        <span className="temp">20.5℃</span>
                        <span className="date-range">2025-09-03 ~ 2025-09-07</span>
                        <span className="more-weather">See more weather</span>
                    </div>
                </header>

                {/* 메시지 영역 */}
                <section className="kdh-message-area">
                    {messages.map((message) => (
                        <ChatMessage 
                            key={message.id} 
                            message={message}
                        />
                    ))}
                    
                    {/* 로딩 표시 */}
                    {loading && (
                        <div className="kdh-chatbot-message">
                            <span className="typing-indicator">AI is typing...</span>
                        </div>
                    )}
                    
                    {/* 스크롤 타겟 */}
                    <div ref={messagesEndRef} />
                </section>

                {/* 하단 제안 및 입력 영역 */}
                <footer className="chat-footer">
                    <div className="suggested-routes">
                        <span className="suggest-title">SUGGEST ROUTES</span>
                        <div className="tags">
                            <span 
                                className="tag tag-kpop"
                                onClick={() => handleSendMessage('I want to visit K-pop related places')}
                            >
                                #k-pop
                            </span>
                            <span 
                                className="tag tag-hotplace"
                                onClick={() => handleSendMessage('Show me hot places in Seoul')}
                            >
                                #hot place
                            </span>
                            <span 
                                className="tag tag-activity"
                                onClick={() => handleSendMessage('What activities can I do in Korea?')}
                            >
                                #activity
                            </span>
                            <span 
                                className="tag tag-ocean"
                                onClick={() => handleSendMessage('Recommend ocean destinations')}
                            >
                                #ocean
                            </span>
                        </div>
                    </div>
                    
                    {/* ChatInput 컴포넌트 사용 */}
                    <ChatInput 
                        onSend={handleSendMessage} 
                        disabled={loading}
                    />
                </footer>
            </main>
        </div>
    );
}

export default KDH_ChatbotPage;