import React, { useState, useEffect, useMemo } from "react";
import {fetchKContentList,fetchKContentDetail} from "../components/KMedia/KMediaCardData";
import KMediaCard from "../components/KMedia/KMediaCard";
import KMediaDescription from "../components/KMedia/KMediaDescription";
import "../styles/KMediaPage.css";

// 페이지당 보여줄 아이템 수 정의
const ITEMS_PER_PAGE = 9; 
// 💡 페이지네이션 버튼 최대 개수 정의 (예: 5개)
const MAX_BUTTONS = 5; 

const getImageList = (urlList) => urlList; 

function KMediaPage() {
    const [mediaData, setMediaData] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState(""); 
    const [currentPage, setCurrentPage] = useState(1); 

    // ✅ API 호출 로직
    useEffect(() => {
        const loadKContentData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchKContentList(0, 9999); 
                setMediaData(data);
                setError(null);
            } catch (err) {
                console.error("데이터 로드 실패:", err);
                setError("데이터를 불러오는 데 실패했습니다. 서버 상태를 확인하세요.");
            } finally {
                setIsLoading(false);
            }
        };
        loadKContentData();
    }, []);

    // --- 🛠️ useMemo 로직 분리 및 개선된 페이지네이션 로직 시작 ---

    // 1. 필터링된 목록 계산
    const filteredMedia = useMemo(() => {
        if (!searchTerm) return mediaData;

        const lowercasedSearch = searchTerm.toLowerCase();
        return mediaData.filter((item) => {
            const titleMatch = item.title?.toLowerCase().includes(lowercasedSearch);
            const locationMatch = item.location?.toLowerCase().includes(lowercasedSearch);
            return titleMatch || locationMatch;
        });
    }, [mediaData, searchTerm]); 

    // 2. 페이지네이션 관련 값 계산
    const { paginatedData, totalPages, displayPageNumbers } = useMemo(() => {
        const totalPages = Math.ceil(filteredMedia.length / ITEMS_PER_PAGE);

        const safeCurrentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);

        const indexOfLastItem = safeCurrentPage * ITEMS_PER_PAGE;
        const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
        const currentItems = filteredMedia.slice(indexOfFirstItem, indexOfLastItem);

        let startPage = Math.max(1, safeCurrentPage - Math.floor(MAX_BUTTONS / 2));
        if (startPage + MAX_BUTTONS - 1 > totalPages) {
            startPage = Math.max(1, totalPages - MAX_BUTTONS + 1);
        }

        const endPage = Math.min(totalPages, startPage + MAX_BUTTONS - 1);
        const displayPageNumbers = [];
        for (let i = startPage; i <= endPage; i++) displayPageNumbers.push(i);

        return { paginatedData: currentItems, totalPages, displayPageNumbers };
    }, [filteredMedia, currentPage]); 

    // 3. 💥 안전한 currentPage 유효성 검사
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (filteredMedia.length > 0 && currentPage === 0) {
            setCurrentPage(1);
        }
    }, [totalPages, filteredMedia.length, currentPage]);

    // 💡 페이지 변경 핸들러
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }
    };
    
    // 💡 검색어 입력 핸들러: 페이지 1로 리셋
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    // --- 이벤트 핸들러 로직 ---

    const handleLikeToggle = (id) => {
        setMediaData((prevData) =>
            prevData.map((item) =>
                item.id === id ? { ...item, liked: !item.liked } : item
            )
        );
    };

    const handleCardClick = async (item) => {
        try {
            const detailItem = await fetchKContentDetail(item.id);
            setSelectedItem(detailItem);
        } catch (err) {
            console.error("상세 데이터 로드 실패:", err);
            alert("상세 정보를 불러올 수 없습니다.");
        }
    };

    const handlePopupClose = () => setSelectedItem(null);

    // 🆕 수정된 handleAddLocation: ScheduleTable 새로고침 트리거
    const handleAddLocation = async (item, dayTitle) => {
        console.log('✅ KMediaPage - 목적지가 추가되었습니다:', {
            item: item.title,
            dayTitle: dayTitle
        });
        
        // ✨ ScheduleTable에 새로고침 이벤트 발송
        // ScheduleTable이 이 이벤트를 감지하고 fetchDestinations 재실행
        window.dispatchEvent(new CustomEvent('destinationAdded', {
            detail: { dayTitle }
        }));
        
        // 선택적: 부모 컴포넌트에서도 추가 작업이 필요하면 여기에 작성
    };

    // 로딩/에러 처리
    if (isLoading)
        return (
            <div className="kmedia-page">
                <h1 className="kmedia-header-title">K-Media Spotlight 🎬</h1>
                <div className="kmedia-loading">데이터를 불러오는 중...</div>
            </div>
        );

    if (error)
        return (
            <div className="kmedia-page">
                <h1 className="kmedia-header-title">K-Media Spotlight 🎬</h1>
                <div className="kmedia-error-message">{error}</div>
            </div>
        );

    // 렌더링
    return (
        <div className="kmedia-page">
            <div className="kmedia-container">
                <h1 className="kmedia-header-title">K-Media Spotlight 🎬</h1>
                
                <input
                    type="text"
                    placeholder=" 🔎 제목 또는 장소를 검색하세요"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="kmedia-search-input"
                />

                <div className="kmedia-grid">
                    {paginatedData.length > 0 ? (
                        paginatedData.map((item) => {
                            const images = getImageList(item.image_url_list || []);
                            return (
                                <KMediaCard
                                    key={item.id}
                                    item={{
                                        ...item,
                                        thumbnail: item.thumbnail, 
                                        second_image: images[1] || item.thumbnail, 
                                        third_image: images[2] || null, 
                                        image: images
                                    }}
                                    onLikeToggle={handleLikeToggle}
                                    onCardClick={() => handleCardClick(item)}
                                />
                            );
                        })
                    ) : (
                        <p className="kmedia-no-results">
                            "{searchTerm}"에 대한 검색 결과가 없습니다.
                        </p>
                    )}
                </div>
                
                {totalPages > 1 && (
                    <div className="kmedia-pagination">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-button"
                        >
                            &lt; 이전
                        </button>
                        
                        {displayPageNumbers.map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                disabled={currentPage === page}
                                className={currentPage === page ? "pagination-button active" : "pagination-button"}
                            >
                                {page}
                            </button>
                        ))}
                        
                        <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-button"
                        >
                            다음 &gt;
                        </button>
                    </div>
                )}

            </div>

            {selectedItem && (
                <KMediaDescription
                    item={selectedItem} // ✅ 백엔드에서 이미 올바른 형식으로 반환
                    onClose={handlePopupClose}
                    onAddLocation={handleAddLocation}
                />
            )}
        </div>
    );
}

export default KMediaPage;