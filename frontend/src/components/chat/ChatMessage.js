// components/chat/ChatMessage.js
import React from 'react';
import './Chat.css';

function ChatMessage({ message }) {
    return (
        <div className={`chat-message ${message.isUser ? 'user' : 'bot'} ${message.isError ? 'error' : ''} ${message.isStreaming ? 'streaming' : ''}`}>
            {/* 텍스트 메시지 */}
            <div className="message-text">
                {message.text}
                
                {/* 🌊 Streaming 중일 때 타이핑 커서 표시 */}
                {message.isStreaming && message.text && (
                    <span className="typing-cursor"></span>
                )}
            </div>

            {/* 🔍 검색/생성 상태 표시 */}
            {message.status && (
                <div className="message-status">
                    {message.status}
                </div>
            )}

            {/* 타임스탬프 */}
            <div className="message-timestamp">
                {message.timestamp?.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}
            </div>

            {/* 🎯 이미지는 말풍선 완전히 밖으로! */}
            {message.results && message.results.length > 0 && (
                <div className="message-images-below">
                    {message.results.map((result, idx) => (
                        <div key={idx} className="image-wrapper-below">
                            {/* 이미지 */}
                            {result.type === 'festival' && result.image_url && (
                                <img 
                                    src={result.image_url}
                                    alt={result.title}
                                    className="content-image-below"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )}
                            
                            {result.type === 'attraction' && result.image_urls && (
                                <img 
                                    src={Array.isArray(result.image_urls) ? result.image_urls[0] : result.image_urls}
                                    alt={result.title}
                                    className="content-image-below"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )}
                            
                            {/* 이미지 하단 정보 */}
                            <div className="image-caption-below">
                                <span className="caption-title-below">{result.title}</span>
                                
                                {result.type === 'festival' && result.start_date && result.end_date && (
                                    <span className="caption-date-below">
                                        📅 {result.start_date} ~ {result.end_date}
                                    </span>
                                )}
                                
                                {result.type === 'attraction' && result.address && (
                                    <span className="caption-address-below">
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
                <div className="message-images-below">
                    {message.festivals.map((festival, idx) => (
                        <div key={idx} className="image-wrapper-below">
                            {festival.image_url && (
                                <>
                                    <img 
                                        src={festival.image_url}
                                        alt={festival.title}
                                        className="content-image-below"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <div className="image-caption-below">
                                        <span className="caption-title-below">{festival.title}</span>
                                        {festival.start_date && festival.end_date && (
                                            <span className="caption-date-below">
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
        </div>
    );
}

export default ChatMessage;