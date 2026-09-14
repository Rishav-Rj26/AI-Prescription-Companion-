import base64
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from app.config import settings
from app.ai.schemas import PrescriptionExtractionResult

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert medical AI assistant specialized in reading and extracting structured information from prescription images.
Your task is to extract medicines, laboratory/diagnostic tests, and general instructions from the provided prescription image.

CRITICAL RULES:
1. NEVER guess a plausible medicine name if the handwriting is ambiguous. If you are unsure, provide your best attempt but assign a lower `confidence` score and set `needs_verification` to true.
2. The output MUST strictly follow the requested JSON schema.
3. Every AI-generated field must be treated as informational, not medical advice.
4. Extract the exact text written for dosages and frequencies.
5. Identify all tests ordered by the doctor.

Return ONLY the structured data."""

async def extract_prescription_data(image_bytes: list[bytes]) -> PrescriptionExtractionResult:
    """
    Send preprocessed images to Gemini and extract structured prescription data.
    Takes a list of image bytes (one for each page).
    """
    try:
        # Initialize the Gemini model with structured output
        llm = ChatGoogleGenerativeAI(
            model=settings.AI_MODEL_NAME,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.0, # low temperature for more deterministic extraction
            timeout=settings.AI_REQUEST_TIMEOUT
        )
        
        structured_llm = llm.with_structured_output(PrescriptionExtractionResult)
        
        # Construct message content with text prompt and images
        content = [{"type": "text", "text": SYSTEM_PROMPT}]
        
        for img in image_bytes:
            img_b64 = base64.b64encode(img).decode('utf-8')
            content.append({
                "type": "image_url",
                "image_url": f"data:image/jpeg;base64,{img_b64}"
            })
            
        message = HumanMessage(content=content)
        
        # Invoke the model
        result = await structured_llm.ainvoke([message])
        return result
        
    except Exception as e:
        logger.error(f"Failed to extract prescription data: {e}")
        raise e
