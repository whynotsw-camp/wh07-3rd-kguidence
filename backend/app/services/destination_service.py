"""
여행지 서비스
"""
from app.database.queries.destination_queries import DestinationQueries

class DestinationService:
    """여행지 관련 비즈니스 로직"""
    
    @staticmethod
    def add_destinations(conn, cursor, user_id: int, destination_names: list, convers_id: int = None):
        """
        여행지 추가 (중복 제거)
        
        Args:
            conn: DB 연결
            cursor: DB 커서
            user_id: 사용자 ID
            destination_names: 여행지 이름 리스트
            convers_id: 대화 ID (선택)
        
        Returns:
            추가된 여행지 ID 리스트
        """
        added_ids = []
        
        for name in destination_names:
            # 중복 체크
            if not DestinationQueries.destination_exists(cursor, user_id, name):
                dest_id = DestinationQueries.create_destination(
                    cursor, user_id, name, convers_id
                )
                added_ids.append(dest_id)
        
        conn.commit()
        return added_ids
    
    @staticmethod
    def get_user_destinations(cursor, user_id: int, limit: int = 100):
        """
        사용자의 여행지 목록 가져오기
        
        Args:
            cursor: DB 커서
            user_id: 사용자 ID
            limit: 가져올 개수
        
        Returns:
            여행지 리스트
        """
        destinations = DestinationQueries.get_user_destinations(
            cursor, user_id, limit=limit
        )
        
        return destinations
    
    @staticmethod
    def delete_destination(conn, cursor, destination_id: int, user_id: int):
        """
        여행지 삭제
        
        Args:
            conn: DB 연결
            cursor: DB 커서
            destination_id: 여행지 ID
            user_id: 사용자 ID
        
        Returns:
            삭제 성공 여부
        """
        success = DestinationQueries.delete_destination(
            cursor, destination_id, user_id
        )
        
        if success:
            conn.commit()
        
        return success
    
    @staticmethod
    def get_destinations_count(cursor, user_id: int):
        """
        사용자의 총 여행지 수
        
        Args:
            cursor: DB 커서
            user_id: 사용자 ID
        
        Returns:
            여행지 개수
        """
        return DestinationQueries.count_user_destinations(cursor, user_id)
