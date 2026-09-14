import os
import hashlib
import json
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from langchain_text_splitters import RecursiveCharacterTextSplitter
import google.generativeai as genai

from app.models.knowledge import KnowledgeDocument, DocumentChunk
from app.config import settings

genai.configure(api_key=settings.GOOGLE_API_KEY)

async def generate_embeddings(texts: List[str]) -> List[List[float]]:
    # Gemini embeddings model
    result = genai.embed_content(
        model=settings.EMBEDDING_MODEL_NAME,
        content=texts,
        task_type="retrieval_document"
    )
    return result['embedding']

async def ingest_document(source_path: str, title: str, db: AsyncSession):
    print(f"Ingesting: {title} from {source_path}")
    
    # 1. Read content
    if not os.path.exists(source_path):
        raise FileNotFoundError(f"Source file not found: {source_path}")
        
    with open(source_path, 'r', encoding='utf-8') as f:
        content_text = f.read()
        
    if not content_text.strip():
        print("Empty file, skipping.")
        return
        
    # 2. Compute hash and check if exists
    content_hash = hashlib.sha256(content_text.encode('utf-8')).hexdigest()
    
    result = await db.execute(
        select(KnowledgeDocument).where(KnowledgeDocument.content_hash == content_hash)
    )
    existing_doc = result.scalars().first()
    
    if existing_doc:
        print(f"Document already ingested (hash match): {existing_doc.id}")
        return existing_doc.id
        
    # 3. Save KnowledgeDocument
    doc = KnowledgeDocument(
        source=source_path,
        title=title,
        content_hash=content_hash,
        content_text=content_text
    )
    db.add(doc)
    await db.flush() # get doc.id
    
    # 4. Chunk content
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
        is_separator_regex=False,
    )
    
    chunks = text_splitter.split_text(content_text)
    print(f"Split into {len(chunks)} chunks.")
    
    # 5. Generate embeddings in batches
    BATCH_SIZE = 100
    for i in range(0, len(chunks), BATCH_SIZE):
        batch_chunks = chunks[i:i + BATCH_SIZE]
        print(f"Embedding batch {i//BATCH_SIZE + 1}...")
        embeddings = await generate_embeddings(batch_chunks)
        
        # 6. Save chunks
        for j, (chunk_text, embedding) in enumerate(zip(batch_chunks, embeddings)):
            chunk_index = i + j
            db_chunk = DocumentChunk(
                document_id=doc.id,
                chunk_index=chunk_index,
                content=chunk_text,
                embedding=embedding,
                metadata_json=json.dumps({"chunk_index": chunk_index})
            )
            db.add(db_chunk)
            
    await db.commit()
    print(f"Successfully ingested document '{title}' (ID: {doc.id})")
    return doc.id
