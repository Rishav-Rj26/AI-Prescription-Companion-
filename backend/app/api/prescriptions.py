from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import func
from typing import List

from app.db.database import get_db
from app.models.user import User
from app.models.prescription import Prescription
from app.models.prescription_page import PrescriptionPage
from app.schemas.prescription import PrescriptionResponse, PrescriptionListResponse, VerifyRequest
from app.api.deps import get_current_user
from app.services.storage import upload_prescription_page
from app.ai.pipeline import process_prescription_pipeline
from app.models.medicine import PrescriptionMedicine
from app.models.test import Test
from app.models.verification_log import VerificationLog
from app.services.schedule_service import generate_schedules_for_medicine

router = APIRouter()

@router.post("/upload", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
async def upload_prescription(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    # 1. Create Prescription record first to get an ID
    prescription = Prescription(user_id=current_user.id, status="uploaded")
    db.add(prescription)
    await db.flush()  # Get ID without committing

    pages = []
    # 2. Process and upload each file
    for i, file in enumerate(files):
        try:
            upload_result = await upload_prescription_page(file, current_user.id, prescription.id)
            
            page = PrescriptionPage(
                prescription_id=prescription.id,
                file_url=upload_result["file_url"],
                file_type=upload_result["file_type"],
                page_number=i + 1,
                original_filename=upload_result["original_filename"],
                file_size_bytes=upload_result["file_size_bytes"]
            )
            db.add(page)
            pages.append(page)
        except Exception as e:
            # If any upload fails, rollback DB and raise
            await db.rollback()
            raise e
            
    await db.commit()
    await db.refresh(prescription)
    
    # Eagerly load pages for the response
    result = await db.execute(
        select(Prescription)
        .options(selectinload(Prescription.pages))
        .where(Prescription.id == prescription.id)
    )
    return result.scalars().first()

@router.get("", response_model=List[PrescriptionListResponse])
async def list_prescriptions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Prescription)
        .options(
            selectinload(Prescription.pages),
            selectinload(Prescription.medicines),
            selectinload(Prescription.tests)
        )
        .where(Prescription.user_id == current_user.id)
        .where(Prescription.deleted_at == None)
        .order_by(Prescription.uploaded_at.desc())
    )
    prescriptions = result.scalars().all()
    
    response = []
    for p in prescriptions:
        # Build medicines summary
        meds = [m.normalized_name or m.extracted_name for m in p.medicines]
        summary = None
        if meds:
            summary = ", ".join(meds[:3])
            if len(meds) > 3:
                summary += f" and {len(meds) - 3} more"
                
        response.append(PrescriptionListResponse(
            id=p.id,
            status=p.status,
            uploaded_at=p.uploaded_at,
            page_count=len(p.pages),
            medicines_summary=summary,
            test_count=len(p.tests)
        ))
    return response

from typing import Optional as TypingOptional
from app.services.translation import translate_instruction

@router.get("/{id}", response_model=PrescriptionResponse)
async def get_prescription(
    id: int,
    lang: TypingOptional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Prescription)
        .options(
            selectinload(Prescription.pages),
            selectinload(Prescription.medicines),
            selectinload(Prescription.tests)
        )
        .where(Prescription.id == id)
        .where(Prescription.user_id == current_user.id)
        .where(Prescription.deleted_at == None)
    )
    prescription = result.scalars().first()
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    # Translate instructions if lang is provided
    if lang and lang != "en":
        for med in prescription.medicines:
            if med.instructions:
                translated, uncertain = await translate_instruction(med.instructions, lang)
                # Since we don't want to save this to the DB, we just attach it to the object
                # Pydantic from_attributes will pick it up
                med.instructions_translated = translated
                med.translation_uncertain = uncertain
        
    return prescription

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prescription(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Prescription)
        .where(Prescription.id == id)
        .where(Prescription.user_id == current_user.id)
        .where(Prescription.deleted_at == None)
    )
    prescription = result.scalars().first()
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    prescription.deleted_at = func.now()
    await db.commit()

@router.post("/{id}/process", response_model=PrescriptionResponse)
async def process_prescription(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch prescription
    result = await db.execute(
        select(Prescription)
        .where(Prescription.id == id)
        .where(Prescription.user_id == current_user.id)
        .where(Prescription.deleted_at == None)
    )
    prescription = result.scalars().first()
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    if prescription.status != "uploaded" and prescription.status != "failed":
        raise HTTPException(status_code=400, detail=f"Prescription is already {prescription.status}")
        
    # 2. Update status to processing
    prescription.status = "processing"
    prescription.failure_reason = None
    await db.commit()
    
    # 3. Run pipeline
    # Ideally this should be a background task, but for Phase 3 we await it inline
    await process_prescription_pipeline(prescription.id, db)
    
    # 4. Fetch the updated prescription with all relationships to return
    result = await db.execute(
        select(Prescription)
        .options(
            selectinload(Prescription.pages),
            selectinload(Prescription.medicines),
            selectinload(Prescription.tests)
        )
        .where(Prescription.id == id)
    )
    
    updated_prescription = result.scalars().first()
    return updated_prescription

@router.post("/{id}/verify", response_model=PrescriptionResponse)
async def verify_prescription_fields(
    id: int,
    request: VerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch prescription
    result = await db.execute(
        select(Prescription)
        .options(
            selectinload(Prescription.medicines),
            selectinload(Prescription.tests)
        )
        .where(Prescription.id == id)
        .where(Prescription.user_id == current_user.id)
        .where(Prescription.deleted_at == None)
    )
    prescription = result.scalars().first()
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    if prescription.status != "completed":
        raise HTTPException(status_code=400, detail="Can only verify completed prescriptions")

    meds_by_id = {m.id: m for m in prescription.medicines}
    tests_by_id = {t.id: t for t in prescription.tests}
    
    verified_medicines = set()
    
    for conf in request.confirmations:
        if conf.medicine_id:
            med = meds_by_id.get(conf.medicine_id)
            if med:
                old_val = getattr(med, conf.field_name, None)
                
                # If modifying extracted_name for the first time, save original
                if conf.field_name == "extracted_name" and not med.original_extracted_name:
                    med.original_extracted_name = med.extracted_name
                
                setattr(med, conf.field_name, conf.confirmed_value)
                med.needs_verification = False
                med.verified_by = current_user.id
                med.verified_at = func.now()
                
                log = VerificationLog(
                    prescription_medicine_id=med.id,
                    field_name=conf.field_name,
                    old_value=str(old_val) if old_val is not None else None,
                    new_value=conf.confirmed_value,
                    confirmed_by=current_user.id
                )
                db.add(log)
                verified_medicines.add(med)
                
        elif conf.test_id:
            test = tests_by_id.get(conf.test_id)
            if test:
                old_val = getattr(test, conf.field_name, None)
                setattr(test, conf.field_name, conf.confirmed_value)
                test.needs_verification = False
                
                log = VerificationLog(
                    test_id=test.id,
                    field_name=conf.field_name,
                    old_value=str(old_val) if old_val is not None else None,
                    new_value=conf.confirmed_value,
                    confirmed_by=current_user.id
                )
                db.add(log)
                
    await db.commit()
    
    # Generate schedules for newly verified medicines
    for med in verified_medicines:
        await generate_schedules_for_medicine(med, db)
    
    # Refetch to return full updated response
    result = await db.execute(
        select(Prescription)
        .options(
            selectinload(Prescription.pages),
            selectinload(Prescription.medicines),
            selectinload(Prescription.tests)
        )
        .where(Prescription.id == id)
    )
    return result.scalars().first()

from app.schemas.comparison import CompareRequest, CompareResponse
from app.services.comparison import compare_prescriptions

@router.post("/compare", response_model=CompareResponse)
async def compare_prescriptions_endpoint(
    request: CompareRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch both prescriptions
    result_a = await db.execute(
        select(Prescription)
        .options(selectinload(Prescription.medicines))
        .where(Prescription.id == request.prescription_id_a)
        .where(Prescription.user_id == current_user.id)
        .where(Prescription.deleted_at == None)
    )
    presc_a = result_a.scalars().first()
    
    result_b = await db.execute(
        select(Prescription)
        .options(selectinload(Prescription.medicines))
        .where(Prescription.id == request.prescription_id_b)
        .where(Prescription.user_id == current_user.id)
        .where(Prescription.deleted_at == None)
    )
    presc_b = result_b.scalars().first()
    
    if not presc_a or not presc_b:
        raise HTTPException(status_code=404, detail="One or both prescriptions not found")
        
    return compare_prescriptions(
        presc_a.id, presc_a.medicines,
        presc_b.id, presc_b.medicines
    )
