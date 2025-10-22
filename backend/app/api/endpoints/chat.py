"""
채팅 API 엔드포인트
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime

from app.database.connection import get_db_dependency
from app.services.chat_service import ChatService
from app.core.deps import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])

# Request/Response 모델
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    convers_id: int
    question: str
    response: str
    extracted_destinations: List[str]
    datetime: datetime

class ConversationHistoryItem(BaseModel):
    convers_id: int
    question: str
    response: str
    datetime: datetime

@router.post("/send", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_dependency)
):
    """
    GPT에게 메시지 전송
    - 메시지 전송
    - GPT 응답 받기
    - 여행지 자동 추출 및 저장
    """
    conn, cursor = db
    
    try:
        result = ChatService.send_message(
            conn, cursor,
            user_id=current_user['user_id'],
            message=request.message
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"채팅 오류: {str(e)}")

@router.get("/history", response_model=List[ConversationHistoryItem])
async def get_chat_history(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_dependency)
):
    """
    대화 히스토리 조회
    """
    conn, cursor = db
    
    try:
        conversations = ChatService.get_conversation_history(
            cursor,
            user_id=current_user['user_id'],
            limit=limit
        )
        
        return conversations
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"히스토리 조회 오류: {str(e)}")
