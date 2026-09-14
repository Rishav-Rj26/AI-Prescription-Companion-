from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id = Column(Integer, primary_key=True, index=True)
    prescription_medicine_id = Column(Integer, ForeignKey("prescription_medicines.id"), nullable=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=True)
    
    field_name = Column(String, nullable=False)
    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)
    
    confirmed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    confirmed_at = Column(DateTime(timezone=True), server_default=func.now())
