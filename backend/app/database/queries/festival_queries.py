"""
축제 관련 데이터베이스 쿼리 모음
"""

class FestivalQueries:
    """축제 테이블 쿼리"""
    
    @staticmethod
    def get_all(cursor, filter_type: str = None, limit: int = 100, offset: int = 0):
        """모든 축제 조회"""
        if filter_type:
            query = """
            SELECT * FROM fastival 
            WHERE filter_type = %s
            LIMIT %s OFFSET %s
            """
            cursor.execute(query, (filter_type, limit, offset))
        else:
            query = """
            SELECT * FROM fastival 
            LIMIT %s OFFSET %s
            """
            cursor.execute(query, (limit, offset))
        
        return cursor.fetchall()
    
    
    @staticmethod
    def get_by_id(cursor, festival_id: int):
        """특정 축제 조회"""
        query = """
        SELECT * FROM fastival 
        WHERE fastival_id = %s
        """
        cursor.execute(query, (festival_id,))
        return cursor.fetchone()
    
    
    @staticmethod
    def get_ongoing(cursor):
        """진행 중인 축제 조회"""
        query = """
        SELECT * FROM fastival 
        WHERE start_date <= CURDATE() 
        AND end_date >= CURDATE()
        """
        cursor.execute(query)
        return cursor.fetchall()
    
    
    @staticmethod
    def get_upcoming(cursor):
        """예정된 축제 조회"""
        query = """
        SELECT * FROM fastival 
        WHERE start_date > CURDATE()
        ORDER BY start_date ASC
        """
        cursor.execute(query)
        return cursor.fetchall()
    
    
    @staticmethod
    def search(cursor, search_query: str):
        """축제 검색 (제목, 설명)"""
        query = """
        SELECT * FROM fastival 
        WHERE title LIKE %s 
        OR description LIKE %s
        """
        search_term = f"%{search_query}%"
        cursor.execute(query, (search_term, search_term))
        return cursor.fetchall()
    
    
    @staticmethod
    def count_all(cursor, filter_type: str = None):
        """전체 축제 수 조회"""
        if filter_type:
            query = "SELECT COUNT(*) as count FROM fastival WHERE filter_type = %s"
            cursor.execute(query, (filter_type,))
        else:
            query = "SELECT COUNT(*) as count FROM fastival"
            cursor.execute(query)
        
        result = cursor.fetchone()
        return result['count']
    
    
    @staticmethod
    def get_by_date_range(cursor, start_date, end_date):
        """특정 날짜 범위의 축제 조회"""
        query = """
        SELECT * FROM fastival 
        WHERE (start_date BETWEEN %s AND %s)
        OR (end_date BETWEEN %s AND %s)
        OR (start_date <= %s AND end_date >= %s)
        ORDER BY start_date ASC
        """
        cursor.execute(query, (start_date, end_date, start_date, end_date, start_date, end_date))
        return cursor.fetchall()
    
    
    @staticmethod
    def festival_exists(cursor, festival_id: int) -> bool:
        """축제 존재 여부 확인"""
        query = "SELECT COUNT(*) as count FROM fastival WHERE fastival_id = %s"
        cursor.execute(query, (festival_id,))
        result = cursor.fetchone()
        return result['count'] > 0