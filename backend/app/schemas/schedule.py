from pydantic import BaseModel
from datetime import date, time, datetime
from typing import Optional, List

class ScheduleBase(BaseModel):
    scheduled_time: time
    status: str
    start_date: date
    end_date: date
    needs_review: bool = False
    review_reason: Optional[str] = None

class ScheduleCreate(ScheduleBase):
    prescription_medicine_id: int

class ScheduleUpdateRequest(BaseModel):
    status: Optional[str] = None
    scheduled_time: Optional[time] = None

class ScheduleResponse(ScheduleBase):
    id: int
    prescription_medicine_id: int
    created_at: datetime
    
    # We will attach these from the medicine when returning to the frontend
    medicine_name: Optional[str] = None
    strength: Optional[str] = None
    dosage: Optional[str] = None
    
    # Computed on the fly for display
    day_number: Optional[int] = None
    total_days: Optional[int] = None

    class Config:
        from_attributes = True

class ScheduleListResponse(BaseModel):
    date: date
    schedules: List[ScheduleResponse]

    class Config:
        from_attributes = True
