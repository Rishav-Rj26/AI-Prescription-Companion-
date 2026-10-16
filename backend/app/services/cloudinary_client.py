import logging
from typing import Optional, Dict, Any, List, Union
import cloudinary
import cloudinary.uploader
import cloudinary.api
from cloudinary.utils import cloudinary_url
from app.config import settings

logger = logging.getLogger(__name__)

# Configure Cloudinary globally
def init_cloudinary():
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )

init_cloudinary()

class StorageException(Exception):
    """Base exception for storage operations."""
    pass

def map_content_type_to_resource_type(content_type: str) -> str:
    """
    Map MIME content-type to Cloudinary resource_type:
    - image/* and application/pdf -> 'image' (or 'auto')
    - video/* -> 'video'
    - other -> 'raw'
    """
    if not content_type:
        return "auto"
    content_type_lower = content_type.lower()
    if content_type_lower.startswith("image/"):
        return "image"
    if content_type_lower == "application/pdf":
        return "auto"
    if content_type_lower.startswith("video/"):
        return "video"
    return "raw"

def upload(
    file: Any,
    public_id: Optional[str] = None,
    folder: Optional[str] = None,
    resource_type: str = "auto",
    use_large: bool = False,
    chunk_size: int = 6000000,
    timeout: int = 60,
    overwrite: bool = True,
    transformations: Optional[Dict[str, Any]] = None,
    **extra_kwargs: Any,
) -> Dict[str, Any]:
    """
    Upload a file to Cloudinary.
    Supports file paths, byte streams, and file-like objects.
    Uses chunked upload (upload_large) for large files or videos.
    """
    options: Dict[str, Any] = {
        "resource_type": resource_type,
        "overwrite": overwrite,
        "timeout": timeout,
        **extra_kwargs,
    }
    if public_id:
        options["public_id"] = public_id
    if folder:
        options["folder"] = folder
    if transformations:
        options["transformation"] = transformations

    try:
        if use_large or resource_type == "video":
            options["chunk_size"] = chunk_size
            response = cloudinary.uploader.upload_large(file, **options)
        else:
            response = cloudinary.uploader.upload(file, **options)
        return response
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        raise StorageException(f"Failed to upload file to Cloudinary: {str(e)}") from e

def delete(
    public_id: str,
    resource_type: str = "image",
    invalidate: bool = True,
    **extra_kwargs: Any,
) -> Dict[str, Any]:
    """
    Delete a resource from Cloudinary by public_id.
    """
    try:
        response = cloudinary.uploader.destroy(
            public_id,
            resource_type=resource_type,
            invalidate=invalidate,
            **extra_kwargs,
        )
        return response
    except Exception as e:
        logger.error(f"Cloudinary delete failed for {public_id}: {e}")
        raise StorageException(f"Failed to delete file from Cloudinary: {str(e)}") from e

def get_url(
    public_id: str,
    resource_type: str = "image",
    transformation: Optional[Union[Dict[str, Any], List[Dict[str, Any]]]] = None,
    sign_url: bool = False,
    secure: bool = True,
    auto_optimize: bool = True,
    **extra_kwargs: Any,
) -> str:
    """
    Generate a CDN delivery URL for a public_id.
    Supports auto-format, quality optimization (f_auto, q_auto), resizing, and signed URLs.
    """
    url_options: Dict[str, Any] = {
        "resource_type": resource_type,
        "secure": secure,
        "sign_url": sign_url,
        **extra_kwargs,
    }
    if auto_optimize and resource_type == "image":
        url_options.setdefault("fetch_format", "auto")
        url_options.setdefault("quality", "auto")

    if transformation:
        url_options["transformation"] = transformation

    url, _ = cloudinary_url(public_id, **url_options)
    return url

def get_signed_upload_params(
    folder: Optional[str] = None,
    resource_type: str = "image",
    expires_in: int = 3600,
    **extra_params: Any,
) -> Dict[str, Any]:
    """
    Generate signed upload parameters (presigned equivalent) for direct client uploads.
    """
    import time
    timestamp = int(time.time())
    params_to_sign = {
        "timestamp": timestamp,
        **extra_params,
    }
    if folder:
        params_to_sign["folder"] = folder

    signature = cloudinary.utils.api_sign_request(params_to_sign, settings.CLOUDINARY_API_SECRET)
    return {
        "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
        "api_key": settings.CLOUDINARY_API_KEY,
        "timestamp": timestamp,
        "signature": signature,
        "folder": folder,
        "upload_url": f"https://api.cloudinary.com/v1_1/{settings.CLOUDINARY_CLOUD_NAME}/{resource_type}/upload",
        **params_to_sign,
    }

def list_resources(
    folder: Optional[str] = None,
    resource_type: str = "image",
    max_results: int = 100,
    next_cursor: Optional[str] = None,
    **extra_kwargs: Any,
) -> Dict[str, Any]:
    """
    List resources under a folder prefix.
    """
    try:
        params: Dict[str, Any] = {
            "resource_type": resource_type,
            "type": "upload",
            "max_results": max_results,
            **extra_kwargs,
        }
        if folder:
            params["prefix"] = folder
        if next_cursor:
            params["next_cursor"] = next_cursor

        response = cloudinary.api.resources(**params)
        return response
    except Exception as e:
        logger.error(f"Cloudinary list failed: {e}")
        raise StorageException(f"Failed to list files from Cloudinary: {str(e)}") from e
