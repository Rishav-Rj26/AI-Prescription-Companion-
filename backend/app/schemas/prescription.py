from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class PrescriptionPageResponse(BaseModel):
    id: int
    file_url: str
    file_type: str
    page_number: int
    original_filename: Optional[str]
    file_size_bytes: Optional[int]

    class Config:
        from_attributes = True

class PrescriptionResponse(BaseModel):
    id: int
    user_id: int
    status: str
    uploaded_at: datetime
    processed_at: Optional[datetime]
    pages: List[PrescriptionPageResponse]

    class Config:
        from_attributes = True

class PrescriptionListResponse(BaseModel):
    id: int
    status: str
    uploaded_at: datetime
    page_count: int

    class Config:
        from_attributes = True
