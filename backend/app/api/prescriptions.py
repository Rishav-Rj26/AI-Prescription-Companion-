from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.db.database import get_db
from app.models.user import User
from app.models.prescription import Prescription
from app.models.prescription_page import PrescriptionPage
from app.schemas.prescription import PrescriptionResponse, PrescriptionListResponse
from app.api.deps import get_current_user
from app.services.storage import upload_prescription_page

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
        .options(selectinload(Prescription.pages))
        .where(Prescription.user_id == current_user.id)
        .where(Prescription.deleted_at == None)
        .order_by(Prescription.uploaded_at.desc())
    )
    prescriptions = result.scalars().all()
    
    response = []
    for p in prescriptions:
        response.append(PrescriptionListResponse(
            id=p.id,
            status=p.status,
            uploaded_at=p.uploaded_at,
            page_count=len(p.pages)
        ))
    return response

@router.get("/{id}", response_model=PrescriptionResponse)
async def get_prescription(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Prescription)
        .options(selectinload(Prescription.pages))
        .where(Prescription.id == id)
        .where(Prescription.user_id == current_user.id)
        .where(Prescription.deleted_at == None)
    )
    prescription = result.scalars().first()
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
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
        
    from sqlalchemy.sql import func
    prescription.deleted_at = func.now()
    await db.commit()
