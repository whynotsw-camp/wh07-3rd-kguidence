// KMediaCardData.js
// FastAPI와 직접 연결, 이미지 프록시 없이 원본 URL 사용

const BASE_URL = "http://localhost:8000/api";

/**
 * 공통 fetch 함수
 * @param {string} url
 * @returns {Promise<any>}
 */
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(`API Request Failed: ${response.status} - ${errorDetail}`);
    }
    return response.json();
  } catch (error) {
    console.error("🌐 API 호출 오류:", error);
    throw error;
  }
}

/**
 * 1️⃣ 전체 K-Content 목록 조회
 * @param {number} skip
 * @param {number} limit
 * @returns {Promise<any[]>}
 */
export async function fetchKContentList(skip = 0, limit = 100) {
  const url = `${BASE_URL}/kcontents?skip=${skip}&limit=${limit}`;
  return fetchData(url);
}

/**
 * 2️⃣ 특정 콘텐츠 상세 조회
 * @param {number} contentId
 * @returns {Promise<any>}
 */
export async function fetchKContentDetail(contentId) {
  const url = `${BASE_URL}/kcontents/${contentId}`;
  return fetchData(url);
}

/**
 * 3️⃣ 검색 API
 * @param {string} query
 * @returns {Promise<any[]>}
 */
export async function fetchKContentSearch(query) {
  if (!query || query.trim().length < 2) {
    console.warn("검색어는 2글자 이상이어야 합니다.");
    return [];
  }
  const url = `${BASE_URL}/kcontents/search/query?q=${encodeURIComponent(query)}`;
  return fetchData(url);
}

/**
 * 4️⃣ 카테고리 조회
 * @param {string} category
 * @returns {Promise<any[]>}
 */
export async function fetchKContentByCategory(category) {
  if (!category) return [];
  const url = `${BASE_URL}/kcontents/search/category?category=${encodeURIComponent(category)}`;
  return fetchData(url);
}

/**
 * 5️⃣ Helper: 리스트 안의 모든 이미지 URL 반환 (프록시 없이 원본 URL)
 * @param {string[]} urls
 * @returns {string[]} 원본 URL 배열
 */
export function getImageList(urls) {
  if (!urls || !Array.isArray(urls)) return [];
  return urls;
}
