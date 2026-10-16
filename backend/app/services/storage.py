import uuid
from fastapi import UploadFile, HTTPException
from app.config import settings
from app.services import cloudinary_client
from app.services.cloudinary_client import StorageException

# Re-export storage module methods
upload = cloudinary_client.upload
delete = cloudinary_client.delete
get_url = cloudinary_client.get_url
list = cloudinary_client.list_resources

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
    Validates and uploads a single prescription page to Cloudinary.
    Never logs raw file contents or stores them on local disk.
    Preserves existing function signature and response structure.
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
        raise HTTPException(status_code=400, detail="File too large. Maximum allowed size is 10MB.")
    _validate_file_signature(file.content_type, file.file.read(16))
    file.file.seek(0)
        
    # Map S3 concepts: Bucket/Key -> Cloudinary Folder/Public ID
    folder = f"prescriptions/user_{user_id}/presc_{prescription_id}"
    file_uid = str(uuid.uuid4())
    resource_type = "auto" if file.content_type == "application/pdf" else "image"
    
    try:
        response = cloudinary_client.upload(
            file.file,
            folder=folder,
            public_id=file_uid,
            resource_type=resource_type,
            type="authenticated",
        )
    except StorageException:
        raise HTTPException(status_code=500, detail="Failed to upload file to storage.")
        
    file_url = response.get("secure_url") or response.get("url") or cloudinary_client.get_url(
        f"{folder}/{file_uid}", resource_type=resource_type
    )
    
    return {
        "file_url": file_url,
        "file_type": file.content_type,
        "file_size_bytes": file_size,
        "original_filename": file.filename,
        "public_id": response.get("public_id", f"{folder}/{file_uid}"),
        "resource_type": resource_type,
    }


def delete_prescription_page(public_id: str, resource_type: str) -> None:
    """Best-effort cleanup for an upload whose database transaction failed."""
    try:
        cloudinary_client.delete(public_id, resource_type=resource_type, type="authenticated")
    except StorageException:
        # Never mask the original upload/transaction error with cleanup failure.
        pass
