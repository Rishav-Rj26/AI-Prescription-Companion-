from sqlalchemy import Column, Integer, String, Date, Time, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class MedicationSchedule(Base):
    __tablename__ = "medication_schedules"

    id = Column(Integer, primary_key=True, index=True)
    prescription_medicine_id = Column(Integer, ForeignKey("prescription_medicines.id"), nullable=False)
    
    scheduled_time = Column(Time, nullable=False)
    status = Column(String, default="pending") # pending, taken, skipped, snoozed
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    
    needs_review = Column(Boolean, default=False)
    review_reason = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prescription_medicine = relationship("PrescriptionMedicine", backref="schedules")
