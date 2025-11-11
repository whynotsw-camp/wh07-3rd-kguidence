# User 스키마들
from .user_schema import (
    UserBase,
    UserCreate, 
    UserResponse,
    UserLogin,
    Token,
    TokenData
)

# Destination 스키마들  
from .destination_schema import (
    DestinationBase,
    DestinationCreate,
    DestinationResponse,
    DestinationFromConversation,
    DestinationAddRequest,
    DestinationAddResponse
)

# Conversation 스키마들
from .conversation_schema import (
    ConversationBase,
    ConversationCreate,
    ConversationResponse,
    ChatMessage,
    ChatResponse
)

# Festival 스키마들
from .festival_schema import (
    FestivalBase,
    FestivalResponse,
    FestivalCard,
    MapMarker
)

from .concert_schema import (
    ConcertBase,
    ConcertCreate,
    ConcertUpdate,
    ConcertResponse,
    ConcertSummary,
    ConcertsResponse,
    OngoingConcertsResponse,
    ConcertSearch,
    ConcertDateRange
)

from .schedule_schema import ScheduleEdit, ScheduleResponse

# KContent 스키마들 <- 새로 추가
from .kcontent_schema import (
    KContentCreate,
    KContentEdit,
    KContentResponse
)

from .schedule_table_meta_schema import (
    ScheduleTableRowData, 
    UpdateScheduleTableRequest, 
    ScheduleTableDataResponse
)
__all__ = [
    # User
    "UserBase", "UserCreate", "UserResponse", 
    "UserLogin", "Token", "TokenData",
    
    # Destination  
    "DestinationBase", "DestinationCreate",
    "DestinationResponse", "DestinationFromConversation",
    "DestinationAddRequest", "DestinationAddResponse",
    
    # Conversation
    "ConversationBase", "ConversationCreate", 
    "ConversationResponse", "ChatMessage", "ChatResponse",
    
      # Concert
    "ConcertBase", "ConcertCreate", "ConcertUpdate", "ConcertResponse",
    "ConcertSummary", "ConcertsResponse", "OngoingConcertsResponse",
    "ConcertSearch", "ConcertDateRange",

    
    # Festival
    "FestivalBase", "FestivalResponse", "FestivalCard", "MapMarker",
    
    # Schedule
    "ScheduleEdit", "ScheduleResponse",

    # KContent <- 새로 추가
    "KContentCreate", "KContentEdit", "KContentResponse",
    
    "ScheduleTableRowData", "UpdateScheduleTableRequest", "ScheduleTableDataResponse"
]

