from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.models.knowledge import KnowledgeDocument
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

class SourceResponse(BaseModel):
    id: int
    title: str
    source: str
    content_text: str

@router.get("/{id}", response_model=SourceResponse)
async def get_source(
    id: int,
    db: AsyncSession = Depends(get_db)
    # We do not strictly require current_user if sources are public, but for security:
    # current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(KnowledgeDocument).where(KnowledgeDocument.id == id)
    )
    doc = result.scalars().first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Source document not found")
        
    return SourceResponse(
        id=doc.id,
        title=doc.title,
        source=doc.source,
        content_text=doc.content_text
    )
