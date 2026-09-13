from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base

class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)
    
    test_name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    source = Column(String, nullable=True) # Citation
    
    confidence_score = Column(Float, nullable=True)
    needs_verification = Column(Boolean, default=True)

    prescription = relationship("Prescription", back_populates="tests")
