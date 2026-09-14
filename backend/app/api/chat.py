import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.models.user import User
from app.models.prescription import Prescription
from app.models.chat import ChatSession, ChatMessage
from app.api.deps import get_current_user
from app.schemas.chat import CreateSessionRequest, ChatSessionResponse, SendMessageRequest, ChatMessageResponse
from app.services.retrieval import retrieve_relevant_chunks
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

genai.configure(api_key=settings.GOOGLE_API_KEY)
model = genai.GenerativeModel(settings.AI_MODEL_NAME)

SYSTEM_PROMPT = """You are an AI Medical Assistant answering questions about a specific prescription.
You will be provided with two sources of context:
1. PRESCRIPTION DATA: Information extracted directly from the user's uploaded prescription.
2. KNOWLEDGE BASE: Verified reference information retrieved from a medical knowledge base, with [Source ID]s.

CRITICAL RULES:
1. You MUST distinguish between "what is written on the prescription" (from PRESCRIPTION DATA) and "general information" (from KNOWLEDGE BASE).
2. For EVERY general-knowledge claim you make, you MUST cite the source from the KNOWLEDGE BASE using the format [Source: <ID>].
3. If the KNOWLEDGE BASE does not contain the answer, you MUST say "I don't have verified information about this" rather than guessing. Do not use your own internal knowledge.
4. You MUST NEVER claim that a medicine confirms, rules out, or suggests a specific diagnosis for the user. Do not give medical advice.
"""

@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_session(
    request: CreateSessionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify prescription exists and belongs to user
    result = await db.execute(
        select(Prescription)
        .where(Prescription.id == request.prescription_id)
        .where(Prescription.user_id == current_user.id)
        .where(Prescription.deleted_at == None)
    )
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Prescription not found")

    session = ChatSession(
        user_id=current_user.id,
        prescription_id=request.prescription_id,
        title=f"Chat about Prescription #{request.prescription_id}"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return session

@router.get("/sessions", response_model=list[ChatSessionResponse])
async def list_chat_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
    )
    return result.scalars().all()

@router.get("/sessions/{id}", response_model=ChatSessionResponse)
async def get_chat_session(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ChatSession)
        .options(selectinload(ChatSession.messages))
        .where(ChatSession.id == id)
        .where(ChatSession.user_id == current_user.id)
    )
    session = result.scalars().first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # parse citations for the response model
    session_dict = session.__dict__.copy()
    
    messages = []
    for msg in session.messages:
        citations = []
        if msg.citations_json:
            try:
                citations = json.loads(msg.citations_json)
            except:
                pass
                
        messages.append(ChatMessageResponse(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            citations=citations,
            created_at=msg.created_at
        ))
        
    session_dict["messages"] = messages
    return session_dict

@router.post("/sessions/{id}/messages", response_model=ChatMessageResponse)
async def send_message(
    id: int,
    request: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch session and prescription
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.id == id)
        .where(ChatSession.user_id == current_user.id)
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    presc_result = await db.execute(
        select(Prescription)
        .options(
            selectinload(Prescription.medicines),
            selectinload(Prescription.tests)
        )
        .where(Prescription.id == session.prescription_id)
    )
    prescription = presc_result.scalars().first()
    
    # 2. Save User Message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=request.content
    )
    db.add(user_msg)
    await db.flush()

    # 3. Retrieve relevant chunks
    retrieved_chunks = await retrieve_relevant_chunks(request.content, db)
    
    # 4. Build Context
    prescription_data = []
    for m in prescription.medicines:
        prescription_data.append(f"- Medicine: {m.extracted_name} (Normalized: {m.normalized_name}) - {m.strength}, {m.dosage}, {m.frequency}")
    for t in prescription.tests:
        prescription_data.append(f"- Test: {t.test_name} - {t.description}")
        
    kb_data = []
    citations_data = []
    for chunk in retrieved_chunks:
        kb_data.append(f"Source ID: {chunk.document_id}\nSource Title: {chunk.title}\nContent: {chunk.content}\n---")
        citations_data.append({
            "source_id": chunk.document_id,
            "source_title": chunk.title,
            "chunk_text": chunk.content
        })
        
    prompt = f"""{SYSTEM_PROMPT}

=== PRESCRIPTION DATA ===
{chr(10).join(prescription_data) if prescription_data else 'No data extracted.'}

=== KNOWLEDGE BASE ===
{chr(10).join(kb_data) if kb_data else 'No relevant knowledge found.'}

USER QUESTION:
{request.content}
"""

    # 5. Call LLM
    try:
        response = await model.generate_content_async(prompt)
        assistant_content = response.text
    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate response")

    # 6. Save Assistant Message
    # In a real app we'd parse `[Source: X]` from assistant_content and only store those in citations_json.
    # For now, we store all retrieved chunks that were provided to the prompt as citations if the LLM successfully responded.
    
    ast_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=assistant_content,
        citations_json=json.dumps(citations_data) if citations_data else None
    )
    db.add(ast_msg)
    await db.commit()
    
    return ChatMessageResponse(
        id=ast_msg.id,
        role=ast_msg.role,
        content=ast_msg.content,
        citations=citations_data,
        created_at=ast_msg.created_at
    )
