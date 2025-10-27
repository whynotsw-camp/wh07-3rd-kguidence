import React from 'react';
import '../styles/Kpop_ChatbotPage.css'
import {
    // 💡 사이드바 관련 아이콘 import 제거
    ArrowBack,
    WbSunny,
    Search,
} from '@mui/icons-material';

function Kpop_ChatbotPage() {
  return (
    // 오른쪽 메인 채팅 영역
    <div className="kpop-main-chat-area">
      {/* 상단 헤더 */}
      <div className="kpop-chat-header">
        <ArrowBack className="kpop-header-back-icon" />
        <span className="kpop-chat-title">K-Pop Trip</span>
        <span className="kpop-subtitle">Trip Planning Assistant</span>
        <div className="kpop-weather-info">
          <WbSunny className="kpop-weather-icon" />
          <span>Seoul weather</span>
          <span className="kpop-temp">20.5℃</span>
          <span className="kpop-date-range">2025-09-03 ~ 2025-09-07</span>
          <span className="kpop-more-weather">See more weather</span>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="kpop-message-area">
        <div className="kpop-chatbot-message">
          Enjoy your trip to Korea with K-Pop guidance!
          <span className="kpop-timestamp">오후 04:18</span>
        </div>
      </div>

      {/* 하단 제안 및 입력 영역 */}
      <div className="kpop-chat-footer">
        <div className="kpop-suggested-routes">
          <span className="kpop-suggest-title">SUGGEST ROUTES</span>
          <div className="kpop-tags">
            <span className="kpop-tag kpop-tag-kpop">#k-pop</span>
            <span className="kpop-tag kpop-tag-hotplace">#hot place</span>
            <span className="kpop-tag kpop-tag-activity">#activity</span>
            <span className="kpop-tag kpop-tag-ocean">#ocean</span>
          </div>
        </div>
        <div className="kpop-input-bar">
          <input
            type="text"
            placeholder="Tell me the route of the main Korean pop culture destinations..."
          />
          <Search className="kpop-search-icon" />
        </div>
      </div>
    </div>
  );
}

export default Kpop_ChatbotPage;
