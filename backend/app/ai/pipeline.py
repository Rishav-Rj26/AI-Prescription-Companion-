import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.prescription import Prescription
from app.models.prescription_page import PrescriptionPage
from app.models.medicine import PrescriptionMedicine
from app.models.test import Test
from app.ai.preprocessing import download_image_from_url, preprocess_image
from app.ai.extractor import extract_prescription_data
from app.ai.normalizer import normalize_prescription_medicines
from app.config import settings
from datetime import datetime
from app.services.telemetry import log_evaluation_run
import time

logger = logging.getLogger(__name__)

async def process_prescription_pipeline(prescription_id: int, db: AsyncSession) -> None:
    """
    Run the full AI extraction pipeline for a prescription.
    """
    # 1. Load prescription and pages
    result = await db.execute(
        select(Prescription)
        .options(selectinload(Prescription.pages))
        .where(Prescription.id == prescription_id)
    )
    prescription = result.scalars().first()
    
    if not prescription or not prescription.pages:
        logger.error(f"Prescription {prescription_id} not found or has no pages.")
        return
        
    try:
        # 2 & 3. Download and preprocess each page
        image_bytes_list = []
        for page in prescription.pages:
            # Skip non-images for now, or handle PDF to image conversion if necessary
            # The current prompt only handles images well. We assume images or we let preprocessing try.
            # (In a production app, we'd use fitz/PyMuPDF to render PDFs to images first)
            if page.file_type == "application/pdf":
                # For Phase 3, we'll try to process it but usually Gemini API needs images.
                # If it's a PDF, we might need a converter. We will assume the frontend 
                # handles PDF by generating image previews, but if it uploads raw PDF,
                # we pass it to download. (Gemini 1.5 Pro supports PDF natively, 
                # but we're passing it as image_url, which might fail. Let's wrap in try/except)
                pass 
                
            raw_bytes = await download_image_from_url(page.file_url)
            processed_bytes = preprocess_image(raw_bytes)
            image_bytes_list.append(processed_bytes)
            
        if not image_bytes_list:
            raise ValueError("No valid images found for prescription.")
            
        # 4. Extract data using Gemini
        start_time = time.perf_counter()
        extraction_result = await extract_prescription_data(image_bytes_list)
        latency_ms = int((time.perf_counter() - start_time) * 1000)
        
        # 5. Apply confidence threshold and write to DB
        threshold = settings.AI_CONFIDENCE_THRESHOLD
        
        for med in extraction_result.medicines:
            needs_verification = med.needs_verification or (med.confidence < threshold)
            
            db_med = PrescriptionMedicine(
                prescription_id=prescription.id,
                extracted_name=med.raw_name,
                strength=med.strength,
                dosage=med.dosage,
                frequency=med.frequency,
                duration=med.duration,
                instructions=med.instructions,
                confidence_score=med.confidence,
                needs_verification=needs_verification
            )
            db.add(db_med)
            
        for test in extraction_result.tests:
            needs_verification = test.needs_verification or (test.confidence < threshold)
            
            db_test = Test(
                prescription_id=prescription.id,
                test_name=test.test_name,
                description=test.description,
                confidence_score=test.confidence,
                needs_verification=needs_verification
            )
            db.add(db_test)
            
        # Update prescription status
        prescription.status = "completed"
        prescription.confidence_score = extraction_result.overall_confidence
        prescription.processed_at = datetime.utcnow()
        
        await db.commit()
        
        # 6. Post-extraction normalization
        await normalize_prescription_medicines(prescription.id, db)
        
        # Log successful telemetry
        await log_evaluation_run(
            run_type="extraction",
            model_name=settings.AI_MODEL_NAME,
            status="pass",
            prescription_id=prescription.id,
            confidence_score=extraction_result.overall_confidence,
            latency_ms=latency_ms
        )
        
    except Exception as e:
        logger.error(f"Pipeline failed for prescription {prescription_id}: {e}")
        await db.rollback()
        
        # Reload to update status safely
        prescription = (await db.execute(select(Prescription).where(Prescription.id == prescription_id))).scalars().first()
        if prescription:
            prescription.status = "failed"
            prescription.failure_reason = str(e)[:255] # Truncate to fit
            await db.commit()
            
        await log_evaluation_run(
            run_type="extraction",
            model_name=settings.AI_MODEL_NAME,
            status="fail",
            prescription_id=prescription_id,
            error_summary=str(e)
        )
