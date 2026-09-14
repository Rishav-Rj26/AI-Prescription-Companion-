from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class PrescriptionPage(Base):
    __tablename__ = "prescription_pages"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # e.g., 'image/jpeg', 'application/pdf'
    page_number = Column(Integer, nullable=False)
    original_filename = Column(String, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prescription = relationship("Prescription", back_populates="pages")
