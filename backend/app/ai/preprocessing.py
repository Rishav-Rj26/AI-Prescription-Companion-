import io
import httpx
import fitz
from PIL import Image, ImageOps
import logging

logger = logging.getLogger(__name__)

async def download_image_from_url(url: str) -> bytes:
    """Download image from a public S3 URL."""
    async with httpx.AsyncClient(timeout=httpx.Timeout(30.0), follow_redirects=False) as client:
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


def render_pdf_pages(pdf_bytes: bytes, max_pages: int) -> list[bytes]:
    """Render a bounded number of PDF pages to JPEG for the vision model."""
    try:
        document = fitz.open(stream=pdf_bytes, filetype="pdf")
        if document.page_count == 0:
            raise ValueError("The PDF contains no pages")
        if document.page_count > max_pages:
            raise ValueError(f"PDF has too many pages (maximum {max_pages})")

        pages = []
        for page in document:
            pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            pages.append(preprocess_image(pixmap.tobytes("jpeg")))
        return pages
    except Exception as exc:
        logger.warning("PDF rendering failed: %s", exc)
        raise ValueError("The uploaded PDF could not be read") from exc
