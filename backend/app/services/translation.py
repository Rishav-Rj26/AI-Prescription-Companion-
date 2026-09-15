import json
import logging
from typing import Dict, Any, Tuple
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.GOOGLE_API_KEY)
# We can use the same model as for chat
model = genai.GenerativeModel(settings.AI_MODEL_NAME)

SUPPORTED_LANGUAGES = [
    {"code": "en", "name": "English"},
    {"code": "hi", "name": "हिन्दी (Hindi)"}
]

TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "hi": {
        "twice daily": "दिन में दो बार",
        "once daily": "दिन में एक बार",
        "three times a day": "दिन में तीन बार",
        "four times a day": "दिन में चार बार",
        "before meals": "खाने से पहले",
        "after meals": "खाने के बाद",
        "at bedtime": "सोने से पहले",
        "as needed": "ज़रूरत पड़ने पर",
        "with food": "खाने के साथ",
        "empty stomach": "खाली पेट",
        "1 tablet": "1 गोली",
        "2 tablets": "2 गोलियां",
        "morning": "सुबह",
        "night": "रात",
        "evening": "शाम",
        "afternoon": "दोपहर"
    }
}

async def translate_text(text: str, target_lang: str) -> Tuple[str, bool]:
    """
    Translates free-text using LLM. 
    Returns a tuple: (translated_text, is_uncertain)
    """
    if not text or target_lang == "en":
        return text, False
        
    prompt = f"""You are a professional medical translator. 
Translate the following medical instruction into {target_lang}.
Output MUST be in valid JSON format with two keys:
"translated_text": the translated string
"confidence": a float between 0.0 and 1.0 indicating your confidence in the medical accuracy of this translation.

TEXT TO TRANSLATE:
{text}
"""
    try:
        response = await model.generate_content_async(prompt)
        content = response.text
        
        # Clean up possible markdown formatting
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
            
        data = json.loads(content)
        translated = data.get("translated_text", text)
        confidence = float(data.get("confidence", 0.0))
        
        is_uncertain = confidence < 0.85
        return translated, is_uncertain
    except Exception as e:
        logger.error(f"Translation failed: {e}")
        # On failure, return original text and flag as uncertain
        return text, True

async def translate_instruction(instruction: str, target_lang: str) -> Tuple[str, bool]:
    """
    Translates an instruction. Tries static dictionary first, falls back to LLM.
    Returns (translated_text, is_uncertain)
    """
    if not instruction or target_lang == "en":
        return instruction, False
        
    # Check static dictionary (case-insensitive exact match)
    lower_inst = instruction.lower().strip()
    lang_dict = TRANSLATIONS.get(target_lang, {})
    
    if lower_inst in lang_dict:
        return lang_dict[lower_inst], False
        
    # Check if we can do a simple string replace for known terms 
    # (Optional enhancement, but can be risky. Let's rely on LLM for complex sentences)
    
    # Fallback to LLM
    return await translate_text(instruction, target_lang)

def get_supported_languages():
    return SUPPORTED_LANGUAGES
