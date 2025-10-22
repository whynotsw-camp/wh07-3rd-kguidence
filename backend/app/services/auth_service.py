"""
인증 서비스
"""
from app.core.security import verify_password, get_password_hash
from app.core.session import session_manager
from app.database.queries.user_queries import UserQueries

class AuthService:
    """인증 관련 비즈니스 로직"""
    
    @staticmethod
    def signup(conn, cursor, username: str, email: str, password: str, name: str, **kwargs):
        """
        회원가입
        
        Args:
            conn: DB 연결
            cursor: DB 커서
            username: 아이디 (로그인용)
            email: 이메일
            password: 평문 비밀번호
            name: 이름
            **kwargs: 추가 정보 (address, phone, gender, date)
        
        Returns:
            생성된 사용자 정보
        
        Raises:
            Exception: 아이디/이메일 중복 시
        """
        # 아이디 중복 체크
        if UserQueries.username_exists(cursor, username):
            raise Exception("이미 사용 중인 아이디입니다")
        
        # 이메일 중복 체크
        if UserQueries.email_exists(cursor, email):
            raise Exception("이미 사용 중인 이메일입니다")
        
        # 비밀번호 해싱
        hashed_password = get_password_hash(password)
        
        # 사용자 생성
        user_id = UserQueries.create_user(
            cursor,
            username,
            email,
            hashed_password, 
            name,
            kwargs.get('address'),
            kwargs.get('phone'),
            kwargs.get('gender'),
            kwargs.get('date')
        )
        
        conn.commit()
        
        # 생성된 사용자 정보 반환
        user = UserQueries.get_user_by_id(cursor, user_id)
        
        # 비밀번호 제거
        if user and 'password' in user:
            del user['password']
        
        return user
    
    @staticmethod
    def login(conn, cursor, username: str, password: str):
        """
        로그인 (아이디 기반)
        
        Args:
            conn: DB 연결
            cursor: DB 커서
            username: 아이디
            password: 평문 비밀번호
        
        Returns:
            (세션ID, 사용자정보) 튜플
        
        Raises:
            Exception: 로그인 실패 시
        """
        # 사용자 찾기 (아이디로)
        user = UserQueries.get_user_by_username(cursor, username)
        
        if not user:
            raise Exception("아이디 또는 비밀번호가 올바르지 않습니다")
        
        # 비밀번호 확인
        if not verify_password(password, user['password']):
            raise Exception("아이디 또는 비밀번호가 올바르지 않습니다")
        
        # 비밀번호 제거
        user_data = dict(user)
        del user_data['password']
        
        # 세션 생성
        session_id = session_manager.create_session(
            user_id=user['user_id'],
            user_data={
                'username': user['username'],
                'email': user['email'],
                'name': user['name']
            }
        )
        
        return session_id, user_data
    
    @staticmethod
    def logout(session_id: str):
        """
        로그아웃
        
        Args:
            session_id: 세션 ID
        """
        session_manager.delete_session(session_id)
