from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.db.base import Base

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False) # URL or file path
    title = Column(String, nullable=False)
    content_hash = Column(String, unique=True, index=True, nullable=False) # SHA256 of content to prevent duplicate ingestion
    content_text = Column(Text, nullable=False) # The raw full text
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("knowledge_documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    
    content = Column(Text, nullable=False)
    # Gemini embeddings are 768 dimensions
    embedding = Column(Vector(768), nullable=False)
    
    metadata_json = Column(Text, nullable=True) # JSON string for additional context (e.g., section headers)

    document = relationship("KnowledgeDocument", back_populates="chunks")
