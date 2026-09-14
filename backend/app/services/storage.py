import os
import uuid
import boto3
from fastapi import UploadFile, HTTPException
from botocore.exceptions import ClientError
from app.config import settings

# Initialize S3 client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION,
)

ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"]
MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

async def upload_prescription_page(file: UploadFile, user_id: int, prescription_id: int) -> dict:
    """
    Validates and uploads a single prescription page to AWS S3.
    Never logs raw file contents or stores them on local disk.
    """
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}. Must be jpeg, png, or pdf.")
    
    # Check file size (by seeking to end, then back)
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"File too large. Maximum allowed size is 10MB.")
        
    # Generate unique filename for S3
    ext = file.filename.split(".")[-1] if "." in file.filename else ""
    s3_key = f"prescriptions/user_{user_id}/presc_{prescription_id}/{uuid.uuid4()}.{ext}"
    
    try:
        # Upload directly from memory/spooled file to S3
        s3_client.upload_fileobj(
            file.file,
            settings.AWS_S3_BUCKET_NAME,
            s3_key,
            ExtraArgs={"ContentType": file.content_type}
        )
    except ClientError as e:
        raise HTTPException(status_code=500, detail="Failed to upload file to storage.")
        
    s3_url = f"https://{settings.AWS_S3_BUCKET_NAME}.s3.{settings.AWS_S3_REGION}.amazonaws.com/{s3_key}"
    
    return {
        "file_url": s3_url,
        "file_type": file.content_type,
        "file_size_bytes": file_size,
        "original_filename": file.filename
    }
