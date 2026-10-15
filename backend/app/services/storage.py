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

ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "application/pdf": ".pdf"}

def _validate_file_signature(content_type: str, header: bytes) -> None:
    """Reject content-type spoofing before persisting a patient document."""
    valid = (
        (content_type == "image/jpeg" and header.startswith(b"\xff\xd8\xff"))
        or (content_type == "image/png" and header.startswith(b"\x89PNG\r\n\x1a\n"))
        or (content_type == "application/pdf" and header.startswith(b"%PDF-"))
    )
    if not valid:
        raise HTTPException(status_code=400, detail="File contents do not match the declared file type.")

async def upload_prescription_page(file: UploadFile, user_id: int, prescription_id: int) -> dict:
    """
    Validates and uploads a single prescription page to AWS S3.
    Never logs raw file contents or stores them on local disk.
    """
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}. Must be jpeg, png, or pdf.")
    
    # Check file size (by seeking to end, then back)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Empty files cannot be uploaded.")
    if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"File too large. Maximum allowed size is 10MB.")
    _validate_file_signature(file.content_type, file.file.read(16))
    file.file.seek(0)
        
    # Generate unique filename for S3
    ext = ALLOWED_TYPES[file.content_type]
    s3_key = f"prescriptions/user_{user_id}/presc_{prescription_id}/{uuid.uuid4()}{ext}"
    
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
