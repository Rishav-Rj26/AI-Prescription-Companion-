from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base
from pgvector.sqlalchemy import Vector

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    generic_name = Column(String, nullable=True)
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
    extracted_name = Column(String, nullable=False) # The raw string from prescription
    strength = Column(String, nullable=True)
    dosage = Column(String, nullable=True)
    frequency = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    instructions = Column(String, nullable=True)
    
    confidence_score = Column(Float, nullable=True)
    needs_verification = Column(Boolean, default=True)

    prescription = relationship("Prescription", back_populates="medicines")
    medicine = relationship("Medicine")
