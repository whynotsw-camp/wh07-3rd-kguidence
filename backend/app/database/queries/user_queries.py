"""
사용자 관련 데이터베이스 쿼리 모음
"""

class UserQueries:
    """사용자 테이블 쿼리"""
    
    @staticmethod
    def create_user(cursor, username: str, email: str, hashed_password: str, name: str, 
                   address: str = None, phone: str = None, gender: str = None, date=None):
        """새 사용자 생성"""
        query = """
        INSERT INTO users (username, email, password, name, address, phone, gender, date)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (username, email, hashed_password, name, address, phone, gender, date))
        return cursor.lastrowid
    
    @staticmethod
    def get_user_by_username(cursor, username: str):
        """아이디로 사용자 찾기"""
        query = """
        SELECT user_id, username, email, password, name, address, phone, gender, date, permit, created_at
        FROM users
        WHERE username = %s
        """
        cursor.execute(query, (username,))
        return cursor.fetchone()
    
    @staticmethod
    def get_user_by_email(cursor, email: str):
        """이메일로 사용자 찾기"""
        query = """
        SELECT user_id, username, email, password, name, address, phone, gender, date, permit, created_at
        FROM users
        WHERE email = %s
        """
        cursor.execute(query, (email,))
        return cursor.fetchone()
    
    @staticmethod
    def get_user_by_id(cursor, user_id: int):
        """사용자 ID로 찾기"""
        query = """
        SELECT user_id, username, email, name, address, phone, gender, date, permit, created_at
        FROM users
        WHERE user_id = %s
        """
        cursor.execute(query, (user_id,))
        return cursor.fetchone()
    
    @staticmethod
    def username_exists(cursor, username: str) -> bool:
        """아이디 중복 체크"""
        query = "SELECT COUNT(*) as count FROM users WHERE username = %s"
        cursor.execute(query, (username,))
        result = cursor.fetchone()
        return result['count'] > 0
    
    @staticmethod
    def email_exists(cursor, email: str) -> bool:
        """이메일 중복 체크"""
        query = "SELECT COUNT(*) as count FROM users WHERE email = %s"
        cursor.execute(query, (email,))
        result = cursor.fetchone()
        return result['count'] > 0
    
    @staticmethod
    def update_user(cursor, user_id: int, **kwargs):
        """사용자 정보 업데이트"""
        # 동적으로 UPDATE 쿼리 생성
        fields = []
        values = []
        for key, value in kwargs.items():
            if value is not None and key != 'user_id':
                fields.append(f"{key} = %s")
                values.append(value)
        
        if not fields:
            return False
        
        values.append(user_id)
        query = f"UPDATE users SET {', '.join(fields)} WHERE user_id = %s"
        cursor.execute(query, values)
        return cursor.rowcount > 0
