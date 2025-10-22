"""
대화 관련 데이터베이스 쿼리 모음
"""

class ConversationQueries:
    """대화 테이블 쿼리"""
    
    @staticmethod
    def create_conversation(cursor, user_id: int, question: str, response: str, fullconverse: str = None):
        """새 대화 생성"""
        query = """
        INSERT INTO conversations (user_id, question, response, fullconverse)
        VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (user_id, question, response, fullconverse))
        return cursor.lastrowid
    
    @staticmethod
    def get_conversation_by_id(cursor, convers_id: int):
        """대화 ID로 조회"""
        query = """
        SELECT convers_id, user_id, question, response, fullconverse, datetime
        FROM conversations
        WHERE convers_id = %s
        """
        cursor.execute(query, (convers_id,))
        return cursor.fetchone()
    
    @staticmethod
    def get_user_conversations(cursor, user_id: int, limit: int = 50, offset: int = 0):
        """사용자의 대화 내역 조회 (최신순)"""
        query = """
        SELECT convers_id, question, response, datetime
        FROM conversations
        WHERE user_id = %s
        ORDER BY datetime DESC
        LIMIT %s OFFSET %s
        """
        cursor.execute(query, (user_id, limit, offset))
        return cursor.fetchall()
    
    @staticmethod
    def get_recent_conversations(cursor, user_id: int, limit: int = 10):
        """최근 대화 내역 조회"""
        query = """
        SELECT convers_id, question, response, datetime
        FROM conversations
        WHERE user_id = %s
        ORDER BY datetime DESC
        LIMIT %s
        """
        cursor.execute(query, (user_id, limit))
        return cursor.fetchall()
    
    @staticmethod
    def count_user_conversations(cursor, user_id: int):
        """사용자의 총 대화 수"""
        query = "SELECT COUNT(*) as count FROM conversations WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()
        return result['count']
    
    @staticmethod
    def delete_conversation(cursor, convers_id: int, user_id: int):
        """대화 삭제 (본인 대화만)"""
        query = "DELETE FROM conversations WHERE convers_id = %s AND user_id = %s"
        cursor.execute(query, (convers_id, user_id))
        return cursor.rowcount > 0
