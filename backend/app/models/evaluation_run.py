from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.db.base import Base

class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=True) # Null for generic RAG queries
    
    run_type = Column(String, nullable=False, index=True) # e.g., 'extraction', 'rag_query', 'evaluation_script'
    model_name = Column(String, nullable=False)
    model_version = Column(String, nullable=True)
    
    confidence_score = Column(Float, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    
    status = Column(String, nullable=False, index=True) # 'pass' or 'fail'
    error_summary = Column(String(255), nullable=True) # Truncated to avoid raw data logging
    
    metric_json = Column(JSON, nullable=True) # Flexible metrics (e.g., retrieval hits, chunk counts)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
