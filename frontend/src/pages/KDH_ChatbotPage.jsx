import React, { useState, useEffect, useRef } from 'react';
import '../styles/KDH_ChatbotPage.css';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';

function KDH_ChatbotPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: text,
            isUser: true,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            const sessionId = localStorage.getItem('session_id');
            if (!sessionId) {
                throw new Error('로그인이 필요합니다');
            }

            const response = await fetch('http://localhost:8000/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionId}`
                },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('로그인이 만료되었습니다. 다시 로그인해주세요.');
                }
                throw new Error('Failed to send message');
            }

            const data = await response.json();

            // 🎯 AI 응답 추가 (results 포함)
            const aiMessage = {
                id: Date.now() + 1,
                text: data.response,
                isUser: false,
                timestamp: new Date(),
                extractedDestinations: data.extracted_destinations || [],
                results: data.results || [],              // 🎯 통합 결과 추가
                festivals: data.festivals || [],
                attractions: data.attractions || [],
                hasFestivals: data.has_festivals,
                hasAttractions: data.has_attractions
            };
            setMessages(prev => [...prev, aiMessage]);

            // 🎯 지도 마커 추가
            if (data.map_markers && data.map_markers.length > 0) {
                if (window.addMapMarkers) {
                    window.addMapMarkers(data.map_markers);
                } else {
                    if (data.has_festivals && window.addFestivalMarkers) {
                        const festivalMarkers = data.map_markers.filter(m => m.type === 'festival');
                        window.addFestivalMarkers(festivalMarkers);
                    }
                    if (data.has_attractions && window.addAttractionMarkers) {
                        const attractionMarkers = data.map_markers.filter(m => m.type === 'attraction');
                        window.addAttractionMarkers(attractionMarkers);
                    }
                }
            }

        } catch (error) {
            console.error('Error sending message:', error);
            
            const errorMessage = {
                id: Date.now() + 1,
                text: error.message === '로그인이 필요합니다' || error.message === '로그인이 만료되었습니다. 다시 로그인해주세요.' 
                    ? error.message 
                    : 'Sorry, something went wrong. Please try again.',
                isUser: false,
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);

            if (error.message.includes('로그인')) {
                localStorage.removeItem('session_id');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="kdh-chatbot-container">
            <main className="kdh-main-chat-area">
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

                <section className="kdh-message-area">
                    {messages.map((message) => (
                        <ChatMessage 
                            key={message.id} 
                            message={message}
                        />
                    ))}
                    
                    {loading && (
                        <div className="kdh-chatbot-message">
                            <span className="typing-indicator">AI is typing...</span>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </section>

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