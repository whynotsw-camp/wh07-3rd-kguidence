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

            {/* 🎯 이미지만 자연스럽게 표시 (카드 없음) */}
            {message.results && message.results.length > 0 && (
                <div className="message-images">
                    {message.results.map((result, idx) => (
                        <div key={idx} className="image-wrapper">
                            {/* 이미지 */}
                            {result.type === 'festival' && result.image_url && (
                                <img 
                                    src={result.image_url}
                                    alt={result.title}
                                    className="content-image"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )}
                            
                            {result.type === 'attraction' && result.image_urls && (
                                <img 
                                    src={Array.isArray(result.image_urls) ? result.image_urls[0] : result.image_urls}
                                    alt={result.title}
                                    className="content-image"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )}
                            
                            {/* 이미지 아래 간단한 정보만 */}
                            <div className="image-caption">
                                <span className="caption-title">{result.title}</span>
                                
                                {result.type === 'festival' && result.start_date && result.end_date && (
                                    <span className="caption-date">
                                        📅 {result.start_date} ~ {result.end_date}
                                    </span>
                                )}
                                
                                {result.type === 'attraction' && result.address && (
                                    <span className="caption-address">
                                        📍 {result.address}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 🎯 기존 축제만 표시 (하위 호환성) */}
            {!message.results && message.festivals && message.festivals.length > 0 && (
                <div className="message-images">
                    {message.festivals.map((festival, idx) => (
                        <div key={idx} className="image-wrapper">
                            {festival.image_url && (
                                <>
                                    <img 
                                        src={festival.image_url}
                                        alt={festival.title}
                                        className="content-image"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <div className="image-caption">
                                        <span className="caption-title">{festival.title}</span>
                                        {festival.start_date && festival.end_date && (
                                            <span className="caption-date">
                                                📅 {festival.start_date} ~ {festival.end_date}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
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