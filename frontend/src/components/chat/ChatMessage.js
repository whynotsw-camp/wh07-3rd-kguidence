import React from 'react';

function ChatMessage({ message }) {
    const formatTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? '오후' : '오전';
        const displayHours = hours % 12 || 12;
        return `${period} ${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    return (
        <div className={message.isUser ? 'kdh-user-message' : 'kdh-chatbot-message'}>
            {message.text}
            <span className="timestamp">{formatTime(message.timestamp)}</span>
            
            {/* 추출된 여행지 표시 (있으면) */}
            {message.extractedDestinations && message.extractedDestinations.length > 0 && (
                <div className="extracted-destinations">
                    <strong>Extracted destinations:</strong>
                    {message.extractedDestinations.map((dest, idx) => (
                        <span key={idx} className="destination-tag">📍 {dest}</span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ChatMessage;