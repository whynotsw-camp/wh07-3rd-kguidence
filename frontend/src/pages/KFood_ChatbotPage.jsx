import React from 'react';
import '../styles/KFood_ChatbotPage.css'; // K-Food 전용 CSS
import {
    // 💡 사이드바 관련 아이콘 import 제거
    ArrowBack,
    WbSunny,
    Search,
} from '@mui/icons-material';

function KFood_ChatbotPage() {
    return (
        // 💡 이 컨테이너가 이제 전체 화면을 차지합니다.
        <div className="kfood-chatbot-container">
            {/* 1. 왼쪽 사이드바 영역 제거 */}

            {/* 2. 메인 채팅 영역 (이제 전체 화면을 차지) */}
            <div className="kfood-main-chat-area">
                {/* 상단 헤더 */}
                <div className="kfood-chat-header">
                    <ArrowBack className="kfood-header-back-icon" />
                    <span className="kfood-chat-title">K-Food Trip</span>
                    <span className="kfood-subtitle">Trip Planning Assistant</span>
                    <div className="kfood-weather-info">
                        <WbSunny className="kfood-weather-icon" />
                        <span>Seoul weather</span>
                        <span className="kfood-temp">20.5℃</span>
                        <span className="kfood-date-range">2025-09-03 ~ 2025-09-07</span>
                        <span className="kfood-more-weather">See more weather</span>
                    </div>
                </div>

                {/* 메시지 영역 */}
                <div className="kfood-message-area">
                    <div className="kfood-chatbot-message">
                        Enjoy your trip to Korea with K-Food guidance!
                        <span className="kfood-timestamp">오후 04:18</span>
                    </div>
                </div>

                {/* 하단 제안 및 입력 영역 */}
                <div className="kfood-chat-footer">
                    <div className="kfood-suggested-routes">
                        <span className="kfood-suggest-title">SUGGEST ROUTES</span>
                        <div className="kfood-tags">
                            <span className="kfood-tag kfood-tag-kpop">#k-pop</span>
                            <span className="kfood-tag kfood-tag-hotplace">#hot place</span>
                            <span className="kfood-tag kfood-tag-activity">#activity</span>
                            <span className="kfood-tag kfood-tag-ocean">#ocean</span>
                        </div>
                    </div>
                    <div className="kfood-input-bar">
                        <input
                            type="text"
                            placeholder="Tell me the route of the main Korean culinary destinations..."
                        />
                        <Search className="kfood-search-icon" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default KFood_ChatbotPage;
