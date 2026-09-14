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

class PrescriptionMedicineResponse(BaseModel):
    id: int
    extracted_name: str
    original_extracted_name: Optional[str] = None
    normalized_name: Optional[str] = None
    suggested_matches: Optional[str] = None
    strength: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    confidence_score: Optional[float] = None
    needs_verification: bool
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TestResponse(BaseModel):
    id: int
    test_name: str
    description: Optional[str] = None
    confidence_score: Optional[float] = None
    needs_verification: bool

    class Config:
        from_attributes = True

class PrescriptionResponse(BaseModel):
    id: int
    user_id: int
    status: str
    failure_reason: Optional[str] = None
    confidence_score: Optional[float] = None
    needs_verification: bool = False
    uploaded_at: datetime
    processed_at: Optional[datetime]
    pages: List[PrescriptionPageResponse]
    medicines: List[PrescriptionMedicineResponse] = []
    tests: List[TestResponse] = []

    class Config:
        from_attributes = True

class PrescriptionListResponse(BaseModel):
    id: int
    status: str
    uploaded_at: datetime
    page_count: int

    class Config:
        from_attributes = True

class FieldConfirmationRequest(BaseModel):
    medicine_id: Optional[int] = None
    test_id: Optional[int] = None
    field_name: str
    confirmed_value: str

class VerifyRequest(BaseModel):
    confirmations: List[FieldConfirmationRequest]
