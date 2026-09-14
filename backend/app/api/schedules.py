from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import date as date_type
from sqlalchemy import func

from app.db.database import get_db
from app.models.user import User
from app.models.schedule import MedicationSchedule
from app.models.prescription import Prescription
from app.models.medicine import PrescriptionMedicine
from app.schemas.schedule import ScheduleResponse, ScheduleUpdateRequest, ScheduleListResponse
from app.api.deps import get_current_user
from app.services.schedule_service import generate_schedules_for_medicine

router = APIRouter()

@router.get("", response_model=ScheduleListResponse)
async def get_schedules(
    date: date_type = Query(default_factory=date_type.today),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch schedules for the given date that belong to the user
    # We need to join Schedule -> Medicine -> Prescription to filter by user_id
    result = await db.execute(
        select(MedicationSchedule)
        .join(PrescriptionMedicine, MedicationSchedule.prescription_medicine_id == PrescriptionMedicine.id)
        .join(Prescription, PrescriptionMedicine.prescription_id == Prescription.id)
        .options(selectinload(MedicationSchedule.prescription_medicine))
        .where(Prescription.user_id == current_user.id)
        .where(Prescription.deleted_at == None)
        .where(MedicationSchedule.start_date == date)
        .order_by(MedicationSchedule.scheduled_time.asc())
    )
    schedules = result.scalars().all()
    
    # We also need to compute course progress: day_number and total_days
    # For day_number: (date - actual start_date of course) + 1. 
    # But start_date on our row is the date of the dose. 
    # We need the first start_date for this medicine.
    # To keep it simple, we can fetch the min start_date for the medicines involved.
    
    # Let's get all medicine IDs
    med_ids = list(set(s.prescription_medicine_id for s in schedules))
    
    # Fetch course start and end for each medicine to calculate progress
    med_bounds = {}
    if med_ids:
        bounds_result = await db.execute(
            select(
                MedicationSchedule.prescription_medicine_id,
                func.min(MedicationSchedule.start_date).label('course_start'),
                func.max(MedicationSchedule.start_date).label('course_end')
            )
            .where(MedicationSchedule.prescription_medicine_id.in_(med_ids))
            .group_by(MedicationSchedule.prescription_medicine_id)
        )
        for row in bounds_result.all():
            med_bounds[row.prescription_medicine_id] = {
                'start': row.course_start,
                'end': row.course_end
            }

    response_items = []
    for s in schedules:
        med = s.prescription_medicine
        bounds = med_bounds.get(s.prescription_medicine_id)
        
        day_number = None
        total_days = None
        if bounds:
            day_number = (date - bounds['start']).days + 1
            total_days = (bounds['end'] - bounds['start']).days + 1
            
        resp = ScheduleResponse(
            id=s.id,
            prescription_medicine_id=s.prescription_medicine_id,
            scheduled_time=s.scheduled_time,
            status=s.status,
            start_date=s.start_date,
            end_date=s.end_date,
            needs_review=s.needs_review,
            review_reason=s.review_reason,
            created_at=s.created_at,
            medicine_name=med.normalized_name or med.extracted_name,
            strength=med.strength,
            dosage=med.dosage,
            day_number=day_number,
            total_days=total_days
        )
        response_items.append(resp)
        
    return ScheduleListResponse(date=date, schedules=response_items)

@router.patch("/{id}", response_model=ScheduleResponse)
async def update_schedule(
    id: int,
    request: ScheduleUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(MedicationSchedule)
        .join(PrescriptionMedicine, MedicationSchedule.prescription_medicine_id == PrescriptionMedicine.id)
        .join(Prescription, PrescriptionMedicine.prescription_id == Prescription.id)
        .options(selectinload(MedicationSchedule.prescription_medicine))
        .where(MedicationSchedule.id == id)
        .where(Prescription.user_id == current_user.id)
        .where(Prescription.deleted_at == None)
    )
    schedule = result.scalars().first()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    if request.status is not None:
        schedule.status = request.status
        
    if request.scheduled_time is not None:
        schedule.scheduled_time = request.scheduled_time
        schedule.needs_review = False # Clear review flag if user edits time
        schedule.review_reason = None
        
    await db.commit()
    await db.refresh(schedule)
    
    # To return full response, calculate bounds
    bounds_result = await db.execute(
        select(
            func.min(MedicationSchedule.start_date).label('course_start'),
            func.max(MedicationSchedule.start_date).label('course_end')
        )
        .where(MedicationSchedule.prescription_medicine_id == schedule.prescription_medicine_id)
    )
    bounds = bounds_result.first()
    
    day_number = None
    total_days = None
    if bounds and bounds.course_start and bounds.course_end:
        day_number = (schedule.start_date - bounds.course_start).days + 1
        total_days = (bounds.course_end - bounds.course_start).days + 1
        
    med = schedule.prescription_medicine
    return ScheduleResponse(
        id=schedule.id,
        prescription_medicine_id=schedule.prescription_medicine_id,
        scheduled_time=schedule.scheduled_time,
        status=schedule.status,
        start_date=schedule.start_date,
        end_date=schedule.end_date,
        needs_review=schedule.needs_review,
        review_reason=schedule.review_reason,
        created_at=schedule.created_at,
        medicine_name=med.normalized_name or med.extracted_name,
        strength=med.strength,
        dosage=med.dosage,
        day_number=day_number,
        total_days=total_days
    )

@router.post("/generate/{prescription_id}", status_code=status.HTTP_200_OK)
async def manual_generate_schedules(
    prescription_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch prescription and its verified medicines
    result = await db.execute(
        select(Prescription)
        .options(selectinload(Prescription.medicines))
        .where(Prescription.id == prescription_id)
        .where(Prescription.user_id == current_user.id)
        .where(Prescription.deleted_at == None)
    )
    prescription = result.scalars().first()
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    generated_count = 0
    for med in prescription.medicines:
        if not med.needs_verification:
            await generate_schedules_for_medicine(med, db)
            generated_count += 1
            
    return {"message": f"Generated schedules for {generated_count} medicines"}
