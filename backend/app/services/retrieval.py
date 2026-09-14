import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from app.models.knowledge import DocumentChunk, KnowledgeDocument
from app.services.ingestion import generate_embeddings
from app.config import settings

logger = logging.getLogger(__name__)

class RetrievedChunk:
    def __init__(self, document_id: int, title: str, source: str, content: str, distance: float):
        self.document_id = document_id
        self.title = title
        self.source = source
        self.content = content
        self.distance = distance

async def retrieve_relevant_chunks(query: str, db: AsyncSession, top_k: int = settings.RAG_TOP_K) -> List[RetrievedChunk]:
    # 1. Embed the query
    try:
        # generate_embeddings expects a list, so we pass [query]
        query_embeddings = await generate_embeddings([query])
        query_embedding = query_embeddings[0]
    except Exception as e:
        logger.error(f"Failed to generate embedding for query '{query}': {e}")
        return []
    
    # 2. Perform cosine similarity search using pgvector
    # The <=> operator is cosine distance in pgvector.
    # We want to order by distance ascending (closest first)
    
    # SQLAlchemy ORM approach with pgvector
    stmt = (
        select(DocumentChunk, KnowledgeDocument)
        .join(KnowledgeDocument, DocumentChunk.document_id == KnowledgeDocument.id)
        .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))
        .limit(top_k)
    )
    
    result = await db.execute(stmt)
    rows = result.all()
    
    retrieved = []
    for chunk, doc in rows:
        # In a real app we'd also calculate the distance again or extract it from the query if needed, 
        # but ordering is sufficient. Since SQLAlchemy doesn't return the distance easily without 
        # adding it to the select list, we'll just return distance=0 or calculate it in Python if needed.
        # To get actual distance:
        # distance = db.scalar(select(chunk.embedding.cosine_distance(query_embedding)))
        retrieved.append(
            RetrievedChunk(
                document_id=doc.id,
                title=doc.title,
                source=doc.source,
                content=chunk.content,
                distance=0.0 # Placeholder, as it's already sorted
            )
        )
        
    return retrieved
