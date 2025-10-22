from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import date
from pydantic import BaseModel
from app.database.connection import get_db
from app.database.queries.festival_queries import FestivalQueries

router = APIRouter(
    prefix="/api/festivals",
    tags=["festivals"]
)

# Response 모델
class FestivalResponse(BaseModel):
    fastival_id: int
    filter_type: Optional[str]
    title: str
    start_date: Optional[date]
    end_date: Optional[date]
    image_url: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    description: Optional[str]
    detail_url: Optional[str]

    class Config:
        from_attributes = True


# 모든 축제 조회
@router.get("/", response_model=List[FestivalResponse])
async def get_all_festivals(
    filter_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    """모든 축제 목록 조회"""
    try:
        with get_db() as (conn, cursor):
            festivals = FestivalQueries.get_all(cursor, filter_type, limit, skip)
            return festivals
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# 특정 축제 조회
@router.get("/{festival_id}", response_model=FestivalResponse)
async def get_festival_by_id(festival_id: int):
    """특정 축제 상세 정보"""
    try:
        with get_db() as (conn, cursor):
            festival = FestivalQueries.get_by_id(cursor, festival_id)
            
            if not festival:
                raise HTTPException(status_code=404, detail="Festival not found")
            
            return festival
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# 진행 중인 축제
@router.get("/status/ongoing", response_model=List[FestivalResponse])
async def get_ongoing_festivals():
    """현재 진행 중인 축제"""
    try:
        with get_db() as (conn, cursor):
            festivals = FestivalQueries.get_ongoing(cursor)
            return festivals
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# 예정된 축제
@router.get("/status/upcoming", response_model=List[FestivalResponse])
async def get_upcoming_festivals():
    """예정된 축제"""
    try:
        with get_db() as (conn, cursor):
            festivals = FestivalQueries.get_upcoming(cursor)
            return festivals
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# 검색
@router.get("/search/query", response_model=List[FestivalResponse])
async def search_festivals(q: str):
    """축제 검색"""
    try:
        with get_db() as (conn, cursor):
            festivals = FestivalQueries.search(cursor, q)
            return festivals
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))