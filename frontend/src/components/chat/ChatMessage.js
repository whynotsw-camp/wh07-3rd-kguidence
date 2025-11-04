// components/chat/ChatMessage.js
import React from 'react';
import './Chat.css';

function ChatMessage({ message }) {
    return (
        <div className={`chat-message ${message.isUser ? 'user' : 'bot'} ${message.isError ? 'error' : ''}`}>
            {/* 텍스트 메시지 */}
            <div className="message-text">
                {message.text}
            </div>

            {/* 🎯 축제 이미지만 표시 */}
            {message.festivals && message.festivals.length > 0 && (
                <div className="festivals-images">
                    {message.festivals.map((festival, idx) => (
                        <div key={idx} className="festival-image-wrapper">
                            {festival.image_url && (
                                <img 
                                    src={festival.image_url}
                                    alt={festival.title}
                                    className="festival-image-only"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* 기존 extracted destinations */}
            {message.extractedDestinations && message.extractedDestinations.length > 0 && (
                <div className="extracted-destinations">
                    {message.extractedDestinations.map((dest, idx) => (
                        <span key={idx} className="destination-tag">
                            📍 {dest}
                        </span>
                    ))}
                </div>
            )}

            {/* 타임스탬프 */}
            <div className="message-timestamp">
                {message.timestamp?.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}
            </div>
        </div>
    );
}

export default ChatMessage;