import pymysql
from pymysql.cursors import DictCursor
from contextlib import contextmanager
from app.core.config import settings

# 데이터베이스 연결 설정
DB_CONFIG = {
    'host': settings.DATABASE_HOST,
    'port': settings.DATABASE_PORT,
    'user': settings.DATABASE_USER,
    'password': settings.DATABASE_PASSWORD,
    'database': settings.DATABASE_NAME,
    'charset': 'utf8mb4',
    'cursorclass': DictCursor,  # 결과를 딕셔너리로 반환
    'autocommit': False
}

def get_db_connection():
    """데이터베이스 연결 생성"""
    return pymysql.connect(**DB_CONFIG)

@contextmanager
def get_db():
    """
    데이터베이스 컨텍스트 매니저
    
    사용 예:
    with get_db() as (conn, cursor):
        cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        yield conn, cursor
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# FastAPI 의존성으로 사용할 함수
def get_db_dependency():
    """FastAPI 엔드포인트에서 사용할 DB 의존성"""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        yield conn, cursor
        conn.commit()
    except Exception:
        if conn:
            conn.rollback()
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
