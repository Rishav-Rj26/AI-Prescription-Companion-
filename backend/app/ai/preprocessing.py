import io
import httpx
from PIL import Image, ImageOps
import logging

logger = logging.getLogger(__name__)

async def download_image_from_url(url: str) -> bytes:
    """Download image from a public S3 URL."""
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.content

def preprocess_image(image_bytes: bytes) -> bytes:
    """
    Apply preprocessing to the image before sending to the vision model:
    1. EXIF orientation correction (auto-rotate)
    2. Convert to RGB (to handle PDFs or PNGs with alpha channel properly if needed, though mostly images)
    
    Returns the preprocessed image as JPEG bytes.
    """
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_bytes))
        
        # Apply EXIF orientation
        image = ImageOps.exif_transpose(image)
        
        # Convert to RGB if necessary (e.g., RGBA pngs)
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        # Optional: could add whitespace cropping here if needed
        # For now, EXIF correction is the most critical for OCR
            
        # Save back to bytes
        output_io = io.BytesIO()
        image.save(output_io, format='JPEG', quality=85)
        return output_io.getvalue()
        
    except Exception as e:
        logger.warning(f"Image preprocessing failed, returning original bytes: {e}")
        return image_bytes
