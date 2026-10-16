import json
import logging
import google.generativeai as genai
from app.config import settings
from app.ai.schemas import PrescriptionExtractionResult

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert medical AI assistant specialized in reading and extracting structured information from prescription images.
Your task is to extract medicines, laboratory/diagnostic tests, and general instructions from the provided prescription image.

CRITICAL RULES:
1. NEVER guess a plausible medicine name if the handwriting is ambiguous. If you are unsure, provide your best attempt but assign a lower `confidence` score (e.g. < 0.6) and set `needs_verification` to true.
2. The output MUST strictly follow the requested JSON schema.
3. Every AI-generated field must be treated as informational, not medical advice.
4. Extract the exact text written for dosages and frequencies.
5. Identify all tests ordered by the doctor.

Return ONLY valid JSON matching the schema."""

async def extract_prescription_data(image_bytes: list[bytes]) -> PrescriptionExtractionResult:
    """
    Send preprocessed images to Gemini and extract structured prescription data.
    Takes a list of image bytes (one for each page).
    Automatically falls back to alternate fast models if quota is saturated.
    """
    api_key = settings.GOOGLE_API_KEY.strip('"' + "'")
    genai.configure(api_key=api_key)
    
    schema_str = json.dumps(PrescriptionExtractionResult.model_json_schema())
    prompt = f"{SYSTEM_PROMPT}\n\nSchema:\n{schema_str}"
    
    contents = []
    for img in image_bytes:
        mime_type = "image/png" if img.startswith(b"\x89PNG") else "image/jpeg"
        contents.append({"mime_type": mime_type, "data": img})
    contents.append(prompt)
    
    candidate_models = [settings.AI_MODEL_NAME, "gemini-3.5-flash-lite", "gemini-flash-latest"]
    # De-duplicate while preserving order
    seen = set()
    models_to_try = [m for m in candidate_models if not (m in seen or seen.add(m))]
    
    last_error = None
    for model_name in models_to_try:
        try:
            logger.info(f"Attempting prescription extraction with model: {model_name}")
            model = genai.GenerativeModel(
                model_name=model_name,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.0,
                }
            )
            response = await model.generate_content_async(contents)
            result = PrescriptionExtractionResult.model_validate_json(response.text)
            logger.info(f"Prescription extraction succeeded with model: {model_name}")
            return result
        except Exception as e:
            logger.warning(f"Model {model_name} failed: {e}. Trying fallback if available...")
            last_error = e
            
    logger.error(f"All candidate models failed extraction: {last_error}")
    raise last_error


