from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base
from pgvector.sqlalchemy import Vector

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    generic_name = Column(String, nullable=True)
    aliases = Column(String, nullable=True)
    category = Column(String, nullable=True)
    common_strengths = Column(String, nullable=True)
    description = Column(String, nullable=True)
    source = Column(String, nullable=True) # Citation for explanations
    # For future RAG use
    # embedding = Column(Vector(1536), nullable=True) 

class PrescriptionMedicine(Base):
    __tablename__ = "prescription_medicines"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=True) # Could be null if exact match not found
    
    # Extracted fields
    original_extracted_name = Column(String, nullable=True)
    extracted_name = Column(String, nullable=False) # The raw string from prescription
    normalized_name = Column(String, nullable=True)
    suggested_matches = Column(String, nullable=True) # JSON list
    
    strength = Column(String, nullable=True)
    dosage = Column(String, nullable=True)
    frequency = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    instructions = Column(String, nullable=True)
    
    confidence_score = Column(Float, nullable=True)
    needs_verification = Column(Boolean, default=True)
    
    from sqlalchemy import DateTime
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    prescription = relationship("Prescription", back_populates="medicines")
    medicine = relationship("Medicine")
