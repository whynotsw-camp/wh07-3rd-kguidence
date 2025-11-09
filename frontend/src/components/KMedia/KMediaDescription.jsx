// src/components/KMedia/KMediaDescription.jsx
// ✅ ScheduleTable과 동일한 인증 로직 + 목적지 추가 API 호출

import React, { useRef, useState, useEffect, useCallback } from "react"; 
import "./KMediaDescription.css";
import PlaceholderMarker from '../../assets/concert_marker.png';

const NAVER_MAPS_CLIENT_ID = process.env.REACT_APP_NAVER_MAPS_CLIENT_ID;
const NAVER_MAPS_URL = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAPS_CLIENT_ID}`;

// ✅ ScheduleTable과 동일한 인증 함수
const globalFetchWithAuth = async (url, options = {}, token, setToken, setAuthError) => {
    setAuthError(null);
    if (!token) {
        const error = new Error("세션이 없습니다. 로그인해주세요");
        setAuthError(error.message);
        throw error;
    }
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    try {
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401) {
            const error = new Error('로그인이 만료되었습니다. 다시 로그인해주세요.');
            setAuthError(error.message);
            localStorage.removeItem('session_id');
            setToken(null);
            setTimeout(() => { window.location.href = '/'; }, 2000);
            throw error;
        }
        if (!response.ok) {
            const errorDetail = await response.json().catch(() => ({}));
            console.error('🔍 API 에러 상세:', errorDetail);
            console.error('🔍 HTTP 상태:', response.status);
            const errorMessage = errorDetail.detail || `API 요청 실패: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
        }
        return response;
    } catch (error) {
        console.error("❌ fetch 실패:", error);
        throw error;
    }
};

export default function KMediaDescription({ item, onClose, onAddLocation }) {
    
    const mapElement = useRef(null);
    const [mapReady, setMapReady] = useState(false);
    
    // 🆕 ScheduleTable과 동일한 인증 state
    const [token, setToken] = useState(localStorage.getItem('session_id'));
    const [authError, setAuthError] = useState(null);
    
    // 🆕 일정 선택 팝업 관련 state
    const [showSchedulePopup, setShowSchedulePopup] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
    const [scheduleError, setScheduleError] = useState(null);
    
    const lat = item?.latitude;
    const lng = item?.longitude; 
    
    const itemLocation =
        (lat && lng)
            ? { lat: parseFloat(lat), lng: parseFloat(lng) } 
            : null;

    // ✅ ScheduleTable과 동일한 fetchWithAuth 생성
    const fetchWithAuth = useCallback((url, options = {}) =>
        globalFetchWithAuth(url, options, token, setToken, setAuthError),
    [token]);

    // ✅ 1단계: API script 로드
    useEffect(() => {
        if (!NAVER_MAPS_CLIENT_ID) return;

        const checkReady = () => {
            if (window.naver?.maps) {
                setMapReady(true);
            } else {
                setTimeout(checkReady, 100);
            }
        };

        if (!document.getElementById("naver-map-script")) {
            const script = document.createElement("script");
            script.src = NAVER_MAPS_URL;
            script.async = true;
            script.id = "naver-map-script";
            script.onload = checkReady;
            document.head.appendChild(script);
        } else {
            checkReady();
        }
    }, []);

    // ✅ 2단계: 지도 & 커스텀 마커 렌더링
    useEffect(() => {
        if (!mapReady || !mapElement.current || !itemLocation) return;

        const naver = window.naver;
        const mapCenter = new naver.maps.LatLng(itemLocation.lat, itemLocation.lng);

        const map = new naver.maps.Map(mapElement.current, {
            center: mapCenter,
            zoom: 15,
            scaleControl: true,
        });

        new naver.maps.Marker({
            position: mapCenter,
            map: map,
            icon: {
                url: PlaceholderMarker,
                size: new naver.maps.Size(47, 50),
                scaledSize: new naver.maps.Size(38, 45),
                anchor: new naver.maps.Point(20, 40),
            },
            title: item.title,
        });

    }, [mapReady, itemLocation, item?.title]);
    
    // 🆕 일정 목록 가져오기
    const fetchSchedules = async () => {
        setIsLoadingSchedules(true);
        setScheduleError(null);
        
        console.log('🔍 fetchSchedules - token 확인:', token ? '존재함' : '없음');
        
        if (!token) {
            setScheduleError('로그인이 필요합니다.');
            setIsLoadingSchedules(false);
            return;
        }
        
        try {
            const response = await fetchWithAuth('http://localhost:8000/api/schedules/day_titles');
            const data = await response.json();
            
            console.log('✅ 일정 목록 조회 성공:', data);
            setSchedules(data);
            
        } catch (error) {
            console.error('❌ 일정 목록 조회 실패:', error);
            setScheduleError(error.message);
        } finally {
            setIsLoadingSchedules(false);
        }
    };
    
    // 🆕 "Add Place to Schedule" 버튼 클릭 핸들러
    const handleAddPlaceClick = () => {
        console.log("🔍 KMediaDescription이 받은 item:", item);
        console.log('🔍 handleAddPlaceClick 호출됨');
        setShowSchedulePopup(true);
        fetchSchedules();
    };
    
    // 🆕 일정 선택 핸들러
    const handleScheduleSelect = (schedule) => {
        setSelectedSchedule(schedule);
    };
    
    // 🆕 일정에 목적지 추가 확정 - API 호출 포함!
    const handleConfirmAddToSchedule = async () => {
        if (!selectedSchedule) {
            alert('일정을 선택해주세요.');
            return;
        }
        
        console.log('🔍 목적지 추가 시작:', {
            schedule: selectedSchedule,
            item: item
        });
        
        // day_title에서 숫자 추출 (예: "1days" -> 1)
        const dayNumber = parseInt(selectedSchedule.day_title.match(/\d+/)?.[0] || '1');
        
        try {
            // 로딩 상태 표시
            setIsLoadingSchedules(true);
            
            // 요청 데이터 구성
            const requestData = {
                day_number: dayNumber,
                name: item.title || item.title_en || item.location,
                place_type: 1, // 🎯 1 = 명소 (K-Content)
                reference_id: item.id,
                latitude: parseFloat(item.latitude) || null,
                longitude: parseFloat(item.longitude) || null,
                visit_order: null,
                notes: item.description ? item.description.substring(0, 500) : null // 최대 500자 제한
            };
            
            console.log('🔍 API 요청 데이터:', requestData);
            console.log('🔍 각 필드 타입 확인:', {
                day_number: typeof requestData.day_number,
                name: typeof requestData.name,
                place_type: typeof requestData.place_type,
                reference_id: typeof requestData.reference_id,
                latitude: typeof requestData.latitude,
                longitude: typeof requestData.longitude,
                visit_order: requestData.visit_order,
                notes_length: requestData.notes?.length || 0
            });
            
            // 🎯 실제 API 호출!
            const response = await fetchWithAuth('http://localhost:8000/api/destinations/add', {
                method: 'POST',
                body: JSON.stringify(requestData)
            });
            
            const result = await response.json();
            
            console.log('✅ 목적지 추가 API 성공:', result);
            
            // 팝업 닫기
            setShowSchedulePopup(false);
            setSelectedSchedule(null);
            
            // 성공 메시지
            alert(result.message || `"${item.title}"이(가) "${selectedSchedule.day_title}"에 추가되었습니다! 🎉`);
            
            // 부모 컴포넌트의 onAddLocation 호출 (ScheduleTable 새로고침용)
            if (onAddLocation) {
                await onAddLocation(item, selectedSchedule.day_title);
            }
            
        } catch (error) {
            console.error('❌ 목적지 추가 실패:', error);
            alert(`목적지 추가 실패: ${error.message}`);
        } finally {
            setIsLoadingSchedules(false);
        }
    };
    
    // 🆕 일정 선택 팝업 닫기
    const handleCloseSchedulePopup = () => {
        setShowSchedulePopup(false);
        setSelectedSchedule(null);
        setScheduleError(null);
    };
    
    if (!item) return null;

    // 🎨 이미지 배열 생성 로직 수정
    let images = [];
    
    // 이미지가 1개만 있는 경우: thumbnail만 표시
    if (!item.image_second && !item.image_third) {
        if (item.thumbnail) {
            images.push(item.thumbnail);
        }
    }
    // 이미지가 2개 있는 경우: image_second만 표시
    else if (item.image_second && !item.image_third) {
        images.push(item.image_second);
    }
    // 이미지가 3개 있는 경우: image_second + image_third (2장)
    else if (item.image_second && item.image_third) {
        images.push(item.image_second);
        images.push(item.image_third);
    }

    const imageContainerClass =
        images.length === 1 ? "desc-image-container single-image" : "desc-image-container multi-image";

    return (
        <>
            <div className="kmedia-desc-overlay" onClick={onClose}>
                <div className="kmedia-desc-popup" onClick={(e) => e.stopPropagation()}>

                    <button className="desc-close-btn" onClick={onClose}>✕</button>

                    <div className={imageContainerClass}>
                        {images.map((imgSrc, idx) => (
                            <img
                                key={idx}
                                src={imgSrc}
                                alt={`${item.title} 이미지 ${idx + 1}`}
                                className="desc-img"
                            />
                        ))}
                    </div>

                    <h2 className="desc-title-en">{item.title_en || item.title}</h2>
                    <h3 className="desc-title-ko">{item.title_ko || item.title}</h3>

                    <p className="desc-description">{item.description} ⭐</p>

                    <div className="desc-map">
                        <div
                            ref={mapElement}
                            className="map-container"
                            style={{ width: "100%", height: "100%" }} 
                        >
                            {!mapReady && (
                                <p style={{ textAlign: "center", paddingTop: "50px" }}>
                                    Loading Map API...
                                </p>
                            )}
                            {mapReady && !itemLocation && (
                                <p style={{ textAlign: "center", paddingTop: "50px", color: "red" }}>
                                    Error: 위치 좌표 정보를 불러올 수 없습니다.
                                </p>
                            )}
                        </div>
                    </div>

                    <button 
                        className="desc-add-btn"
                        onClick={handleAddPlaceClick}
                    >
                        Add Place to Schedule 💛
                    </button>

                </div>
            </div>
            
            {/* 🆕 일정 선택 팝업 */}
            {showSchedulePopup && (
                <div className="schedule-select-overlay" onClick={handleCloseSchedulePopup}>
                    <div className="schedule-select-popup" onClick={(e) => e.stopPropagation()}>
                        
                        <button className="schedule-close-btn" onClick={handleCloseSchedulePopup}>✕</button>
                        
                        <h2 className="schedule-popup-title">📅 일정 선택</h2>
                        <p className="schedule-popup-subtitle">
                            "{item.title}"을(를) 추가할 일정을 선택하세요
                        </p>
                        
                        {authError && (
                            <div className="schedule-error">
                                <p>❌ {authError}</p>
                            </div>
                        )}
                        
                        {isLoadingSchedules && (
                            <div className="schedule-loading">
                                <p>⏳ 일정 목록을 불러오는 중...</p>
                            </div>
                        )}
                        
                        {scheduleError && !authError && (
                            <div className="schedule-error">
                                <p>❌ {scheduleError}</p>
                            </div>
                        )}
                        
                        {!isLoadingSchedules && !scheduleError && !authError && schedules.length === 0 && (
                            <div className="schedule-empty">
                                <p>등록된 일정이 없습니다.</p>
                                <p>먼저 일정을 생성해주세요.</p>
                            </div>
                        )}
                        
                        {!isLoadingSchedules && !scheduleError && !authError && schedules.length > 0 && (
                            <div className="schedule-list">
                                {schedules.map((schedule) => (
                                    <div
                                        key={schedule.day_title}
                                        className={`schedule-item ${selectedSchedule?.day_title === schedule.day_title ? 'selected' : ''}`}
                                        onClick={() => handleScheduleSelect(schedule)}
                                    >
                                        <div className="schedule-item-icon">
                                            {selectedSchedule?.day_title === schedule.day_title ? '✅' : '📅'}
                                        </div>
                                        <div className="schedule-item-content">
                                            <h3 className="schedule-item-title">{schedule.day_title}</h3>
                                            {schedule.description && (
                                                <p className="schedule-item-description">{schedule.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="schedule-popup-actions">
                            <button 
                                className="schedule-cancel-btn"
                                onClick={handleCloseSchedulePopup}
                            >
                                취소
                            </button>
                            <button 
                                className="schedule-confirm-btn"
                                onClick={handleConfirmAddToSchedule}
                                disabled={!selectedSchedule || isLoadingSchedules}
                            >
                                {isLoadingSchedules ? '추가 중...' : '선택 완료'}
                            </button>
                        </div>
                        
                    </div>
                </div>
            )}
        </>
    );
}