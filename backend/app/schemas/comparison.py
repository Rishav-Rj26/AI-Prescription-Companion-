from pydantic import BaseModel
from typing import List, Optional

class CompareRequest(BaseModel):
    prescription_id_a: int
    prescription_id_b: int

class MedicineSummary(BaseModel):
    id: int
    name: str
    strength: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None

class MedicineDiffItem(BaseModel):
    medicine_name: str
    strength_a: Optional[str] = None
    strength_b: Optional[str] = None
    dosage_a: Optional[str] = None
    dosage_b: Optional[str] = None
    frequency_a: Optional[str] = None
    frequency_b: Optional[str] = None
    duration_a: Optional[str] = None
    duration_b: Optional[str] = None

class CompareResponse(BaseModel):
    prescription_a_id: int
    prescription_b_id: int
    added: List[MedicineSummary]
    removed: List[MedicineSummary]
    changed: List[MedicineDiffItem]
    unchanged: List[MedicineSummary]
