# app/services/chat_service.py
from typing import Dict, Any, List
from sqlalchemy.orm import Session
import json
import os
from langchain_openai import OpenAIEmbeddings
from qdrant_client import QdrantClient

from app.models.conversation import Conversation  
from app.models.festival import Festival
from app.utils.openai_client import chat_with_gpt

class ChatService:
    
    # 🎯 Qdrant 설정
    QDRANT_URL = "http://172.17.0.1:6333"
    COLLECTION_NAME = "seoul-festival"
    ATTRACTION_COLLECTION = "seoul-attraction"
    
    @staticmethod
    def send_message(db: Session, user_id: int, message: str) -> Dict[str, Any]:
        """
        메시지 처리 및 응답 생성 - 축제 + 관광명소 통합 검색
        """
        try:
            # 1. 키워드 추출
            analysis = ChatService._analyze_message_simple(message)
            keyword = analysis.get('keyword', message)
            
            # 2. 축제 + 관광명소 둘 다 검색
            results = []
            
            festival = ChatService._search_best_festival(keyword)
            if festival:
                festival['type'] = 'festival'
                results.append(festival)
            
            attraction = ChatService._search_best_attraction(keyword)
            if attraction:
                attraction['type'] = 'attraction'
                results.append(attraction)
            
            # 3. 유사도 높은 것 1개만 선택
            if results:
                results.sort(key=lambda x: x['similarity_score'], reverse=True)
                best_result = [results[0]]
            else:
                best_result = []
            
            # 4. GPT 최종 응답 생성
            ai_response = ChatService._generate_final_response(message, best_result)
            
            # 5. 대화 저장
            conversation = Conversation(
                user_id=user_id,
                question=message,
                response=ai_response
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            
            # 6. 응답 구성
            return {
                "response": ai_response,
                "convers_id": conversation.convers_id,
                "extracted_destinations": [],
                "results": best_result,
                "festivals": [r for r in best_result if r.get('type') == 'festival'],
                "attractions": [r for r in best_result if r.get('type') == 'attraction'],
                "has_festivals": any(r.get('type') == 'festival' for r in best_result),
                "has_attractions": any(r.get('type') == 'attraction' for r in best_result),
                "map_markers": ChatService._create_map_markers(best_result)
            }
            
        except Exception as e:
            raise Exception(f"채팅 처리 중 오류 발생: {str(e)}")
    
    @staticmethod
    def _analyze_message_simple(message: str) -> Dict[str, Any]:
        """
        GPT로 키워드만 추출 (타입 구분 안 함)
        """
        try:
            analysis_messages = [
                {
                    "role": "system",
                    "content": """사용자 메시지에서 검색 키워드를 추출하세요.

응답 형식 (JSON):
{
    "keyword": "검색할 키워드"
}

예시:
- "Dosan park 알려줘" → {"keyword": "Dosan park"}
- "63빌딩" → {"keyword": "63빌딩"}
- "한강페스티벌 정보" → {"keyword": "한강페스티벌"}"""
                },
                {
                    "role": "user",
                    "content": f"사용자 메시지: \"{message}\""
                }
            ]
            
            gpt_response = chat_with_gpt(analysis_messages)
            
            try:
                result = json.loads(gpt_response)
                return result
            except json.JSONDecodeError:
                return {"keyword": message}
                
        except Exception as e:
            print(f"키워드 추출 오류: {e}")
            return {"keyword": message}
    
    @staticmethod
    def _search_best_festival(keyword: str) -> Dict[str, Any]:
        """
        🎯 축제 벡터 검색
        """
        try:
            qdrant_client = QdrantClient(
                url=ChatService.QDRANT_URL,
                timeout=60,
                prefer_grpc=False
            )
            
            embedding_model = OpenAIEmbeddings(model="text-embedding-ada-002")
            query_embedding = embedding_model.embed_query(keyword)
            
            search_results = qdrant_client.search(
                collection_name=ChatService.COLLECTION_NAME,
                query_vector=query_embedding,
                limit=1,
                score_threshold=0.3,
                with_payload=True,
                with_vectors=False
            )
            
            if not search_results:
                print(f"🔍 축제 검색 결과 없음: '{keyword}'")
                return None
            
            result = search_results[0]
            festival_data = result.payload.get("metadata", {})
            
            formatted_data = {
                "festival_id": festival_data.get("festival_id", festival_data.get("row")),
                "title": festival_data.get("title"),
                "filter_type": festival_data.get("filter_type"), 
                "start_date": festival_data.get("start_date"),
                "end_date": festival_data.get("end_date"),
                "image_url": festival_data.get("image_url"),
                "detail_url": festival_data.get("detail_url"),
                "latitude": float(festival_data.get("latitude", 0)) if festival_data.get("latitude") else 0.0,
                "longitude": float(festival_data.get("longitude", 0)) if festival_data.get("longitude") else 0.0,
                "description": festival_data.get("description"),
                "similarity_score": result.score
            }
            
            print(f"🎯 축제 검색 성공: '{formatted_data['title']}' (유사도: {result.score:.3f})")
            return formatted_data
            
        except Exception as e:
            print(f"축제 검색 오류: {e}")
            return None
    
    @staticmethod
    def _search_best_attraction(keyword: str) -> Dict[str, Any]:
        """
        🎯 관광명소 벡터 검색
        """
        try:
            qdrant_client = QdrantClient(
                url=ChatService.QDRANT_URL,
                timeout=60,
                prefer_grpc=False
            )
            
            embedding_model = OpenAIEmbeddings(model="text-embedding-ada-002")
            query_embedding = embedding_model.embed_query(keyword)
            
            search_results = qdrant_client.search(
                collection_name=ChatService.ATTRACTION_COLLECTION,
                query_vector=query_embedding,
                limit=1,
                score_threshold=0.3,
                with_payload=True,
                with_vectors=False
            )
            
            if not search_results:
                print(f"🔍 관광명소 검색 결과 없음: '{keyword}'")
                return None
            
            result = search_results[0]
            attraction_data = result.payload.get("metadata", {})
            
            formatted_data = {
                "attr_id": attraction_data.get("attr_id"),
                "title": attraction_data.get("title"),
                "url": attraction_data.get("url"),
                "description": attraction_data.get("description"),
                "phone": attraction_data.get("phone"),
                "hours_of_operation": attraction_data.get("hours_of_operation"),
                "holidays": attraction_data.get("holidays"),
                "address": attraction_data.get("address"),
                "transportation": attraction_data.get("transportation"),
                "image_urls": attraction_data.get("image_urls"),
                "image_count": attraction_data.get("image_count", 0),
                "latitude": float(attraction_data.get("latitude", 0)),
                "longitude": float(attraction_data.get("longitude", 0)),
                "attr_code": attraction_data.get("attr_code"),
                "similarity_score": result.score
            }
            
            print(f"🎯 관광명소 검색 성공: '{formatted_data['title']}' (유사도: {result.score:.3f})")
            return formatted_data
            
        except Exception as e:
            print(f"관광명소 검색 오류: {e}")
            return None
    
    @staticmethod  
    def _create_map_markers(results_data: List[Dict]) -> List[Dict]:
        """
        지도 마커 데이터 생성 (축제 + 관광명소)
        """
        markers = []
        for item in results_data:
            lat = item.get('latitude', 0.0)
            lng = item.get('longitude', 0.0)
            
            if lat and lng and lat != 0.0 and lng != 0.0:
                marker = {
                    "id": item.get('festival_id') or item.get('attr_id'),
                    "title": item['title'],
                    "latitude": float(lat),
                    "longitude": float(lng),
                    "type": item.get('type', 'festival')
                }
                
                if item.get('type') == 'festival':
                    marker.update({
                        "festival_id": item['festival_id'],
                        "description": item.get('description', '')[:100] + "...",
                        "image_url": item.get('image_url'),
                        "start_date": item.get('start_date'),
                        "end_date": item.get('end_date')
                    })
                elif item.get('type') == 'attraction':
                    marker.update({
                        "attr_id": item['attr_id'],
                        "address": item.get('address'),
                        "phone": item.get('phone'),
                        "image_urls": item.get('image_urls')
                    })
                
                markers.append(marker)
        
        return markers
    
    @staticmethod
    def _generate_final_response(message: str, results_data: List[Dict]) -> str:
        """
        GPT를 통한 최종 응답 생성 (축제 + 관광명소)
        """
        try:
            if results_data:
                result = results_data[0]
                result_type = result.get('type', 'festival')
                
                if result_type == 'festival':
                    content = f"""
사용자 질문: {message}

축제 정보:
- 제목: {result.get('title')}
- 기간: {result.get('start_date')} ~ {result.get('end_date')}
- 설명: {result.get('description')}

친절하게 최대한 모든 내용을 활용해서 답변하세요."""
                else:
                    content = f"""
사용자 질문: {message}

관광명소 정보:
- 이름: {result.get('title')}
- 주소: {result.get('address')}
- 운영시간: {result.get('hours_of_operation')}
- 설명: {result.get('description')}

친절하게 최대한 모든 내용을 활용해서 답변하세요.."""
                
                response_messages = [
                    {
                        "role": "system", 
                        "content": "당신은 친절한 관광 가이드입니다. 친절하게 최대한 모든 내용을 활용해서 답변하세요."
                    },
                    {
                        "role": "user",
                        "content": content
                    }
                ]
                
                return chat_with_gpt(response_messages)
                
            else:
                return "안녕하세요! 축제나 관광명소에 대해 궁금한 것이 있으시면 언제든 물어보세요! 😊"
                
        except Exception as e:
            if results_data:
                result = results_data[0]
                return f"🎯 {result.get('title')}을(를) 찾았습니다! 아래 정보를 확인해주세요 😊"
            else:
                return "안녕하세요! 궁금한 것이 있으시면 언제든 물어보세요! 😊"
    
    @staticmethod
    def get_conversation_history(db: Session, user_id: int, limit: int = 50) -> List[Dict]:
        """
        대화 히스토리 조회
        """
        conversations = db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).order_by(Conversation.datetime.desc()).limit(limit).all()
        
        return [
            {
                "conversation_id": conv.convers_id,
                "message": conv.question,
                "response": conv.response,
                "created_at": conv.datetime.isoformat()
            }
            for conv in reversed(conversations)
        ]