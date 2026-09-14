import json
import logging
from difflib import SequenceMatcher
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.medicine import Medicine, PrescriptionMedicine

logger = logging.getLogger(__name__)

FUZZY_THRESHOLD = 0.85
AMBIGUITY_MARGIN = 0.05

def fuzzy_match_ratio(s1: str, s2: str) -> float:
    return SequenceMatcher(None, s1.lower(), s2.lower()).ratio()

async def normalize_prescription_medicines(prescription_id: int, db: AsyncSession):
    """
    Run post-extraction normalization on the medicines of a given prescription.
    Updates the rows with normalized_name, medicine_id, and suggested_matches.
    """
    # 1. Fetch all canonical medicines
    result = await db.execute(select(Medicine))
    all_canonical_meds = result.scalars().all()
    
    if not all_canonical_meds:
        logger.warning("No canonical medicines found in DB. Normalization skipped.")
        return

    # 2. Fetch the extracted medicines for this prescription
    result = await db.execute(
        select(PrescriptionMedicine)
        .where(PrescriptionMedicine.prescription_id == prescription_id)
    )
    presc_meds = result.scalars().all()

    for pmed in presc_meds:
        raw = pmed.extracted_name.strip()
        if not raw:
            continue

        best_match = None
        best_score = 0.0
        candidates = []

        # Compare against all canonical meds
        for med in all_canonical_meds:
            # Check exact match on name or aliases
            possible_names = [med.name]
            if med.aliases:
                possible_names.extend([a.strip() for a in med.aliases.split(",")])
                
            exact_match = False
            for name in possible_names:
                if name.lower() == raw.lower():
                    exact_match = True
                    break
            
            if exact_match:
                best_match = med
                best_score = 1.0
                candidates = [(med, 1.0)]
                break
                
            # Fuzzy match
            for name in possible_names:
                score = fuzzy_match_ratio(raw, name)
                if score >= FUZZY_THRESHOLD:
                    candidates.append((med, score))
                    
        if best_score == 1.0:
            # Exact match found
            pmed.normalized_name = best_match.name
            pmed.medicine_id = best_match.id
        elif candidates:
            # Sort by score descending
            candidates.sort(key=lambda x: x[1], reverse=True)
            top_score = candidates[0][1]
            
            # Find all candidates within AMBIGUITY_MARGIN of the top score
            close_matches = [c for c in candidates if top_score - c[1] <= AMBIGUITY_MARGIN]
            
            # Deduplicate by medicine ID (in case multiple aliases of same med matched)
            unique_matches = {}
            for med, score in close_matches:
                if med.id not in unique_matches:
                    unique_matches[med.id] = med
            
            unique_list = list(unique_matches.values())
            
            if len(unique_list) == 1:
                # Single confident match
                pmed.normalized_name = unique_list[0].name
                pmed.medicine_id = unique_list[0].id
                # Only clear needs_verification if model was also confident, but we leave it as is if model flagged it
            else:
                # Ambiguous! 2+ close matches. NEVER pick one automatically.
                pmed.normalized_name = None
                pmed.medicine_id = None
                pmed.needs_verification = True
                
                # Store suggested matches
                suggested = [m.name for m in unique_list[:3]] # Keep top 3 max
                pmed.suggested_matches = json.dumps(suggested)
        else:
            # No match
            pmed.normalized_name = None
            pmed.medicine_id = None
            pmed.needs_verification = True
            pmed.suggested_matches = None

    await db.commit()
