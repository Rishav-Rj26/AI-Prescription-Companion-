from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class CreateSessionRequest(BaseModel):
    prescription_id: int

class CitationResponse(BaseModel):
    source_id: int
    source_title: str
    chunk_text: str

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    citations: List[CitationResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    id: int
    prescription_id: int
    title: Optional[str] = None
    created_at: datetime
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True

class SendMessageRequest(BaseModel):
    content: str
