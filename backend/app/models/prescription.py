from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # e.g., 'image/jpeg', 'application/pdf'
    raw_text = Column(String, nullable=True)
    status = Column(String, default="pending") # pending, processing, completed, failed
    confidence_score = Column(Float, nullable=True)
    needs_verification = Column(Boolean, default=False)
    
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", backref="prescriptions")
    medicines = relationship("PrescriptionMedicine", back_populates="prescription")
    tests = relationship("Test", back_populates="prescription")
