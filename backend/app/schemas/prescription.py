from pydantic import BaseModel
from datetime import datetime
from typing import List, Literal, Optional
from pydantic import ConfigDict, model_validator

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
    instructions_translated: Optional[str] = None
    translation_uncertain: bool = False
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
    medicines_summary: Optional[str] = None
    test_count: int = 0

    class Config:
        from_attributes = True

class FieldConfirmationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    medicine_id: Optional[int] = None
    test_id: Optional[int] = None
    field_name: Literal["extracted_name", "strength", "dosage", "frequency", "duration", "instructions", "test_name", "description"]
    confirmed_value: str

    @model_validator(mode="after")
    def validate_target_and_field(self):
        if (self.medicine_id is None) == (self.test_id is None):
            raise ValueError("Provide exactly one of medicine_id or test_id")
        medicine_fields = {"extracted_name", "strength", "dosage", "frequency", "duration", "instructions"}
        test_fields = {"test_name", "description"}
        if self.medicine_id is not None and self.field_name not in medicine_fields:
            raise ValueError("That field cannot be updated on a medicine")
        if self.test_id is not None and self.field_name not in test_fields:
            raise ValueError("That field cannot be updated on a test")
        if not self.confirmed_value.strip():
            raise ValueError("confirmed_value cannot be blank")
        return self

class VerifyRequest(BaseModel):
    confirmations: List[FieldConfirmationRequest]
