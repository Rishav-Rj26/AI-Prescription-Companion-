from typing import List
from app.models.medicine import PrescriptionMedicine
from app.schemas.comparison import CompareResponse, MedicineSummary, MedicineDiffItem

def _get_med_name(med: PrescriptionMedicine) -> str:
    return med.normalized_name or med.extracted_name

def _to_summary(med: PrescriptionMedicine) -> MedicineSummary:
    return MedicineSummary(
        id=med.id,
        name=_get_med_name(med),
        strength=med.strength,
        dosage=med.dosage,
        frequency=med.frequency,
        duration=med.duration
    )

def compare_prescriptions(
    prescription_a_id: int, 
    medicines_a: List[PrescriptionMedicine], 
    prescription_b_id: int, 
    medicines_b: List[PrescriptionMedicine]
) -> CompareResponse:
    
    # Create dicts mapped by normalized name (lower) to easily find matches
    dict_a = { _get_med_name(m).lower(): m for m in medicines_a }
    dict_b = { _get_med_name(m).lower(): m for m in medicines_b }
    
    added = []
    removed = []
    changed = []
    unchanged = []
    
    # Find Removed and matches (Changed/Unchanged)
    for name_key, med_a in dict_a.items():
        if name_key not in dict_b:
            removed.append(_to_summary(med_a))
        else:
            med_b = dict_b[name_key]
            
            # Check fields
            if (med_a.strength != med_b.strength or 
                med_a.dosage != med_b.dosage or 
                med_a.frequency != med_b.frequency or 
                med_a.duration != med_b.duration):
                
                changed.append(MedicineDiffItem(
                    medicine_name=_get_med_name(med_b),
                    strength_a=med_a.strength,
                    strength_b=med_b.strength,
                    dosage_a=med_a.dosage,
                    dosage_b=med_b.dosage,
                    frequency_a=med_a.frequency,
                    frequency_b=med_b.frequency,
                    duration_a=med_a.duration,
                    duration_b=med_b.duration
                ))
            else:
                unchanged.append(_to_summary(med_b))
                
    # Find Added
    for name_key, med_b in dict_b.items():
        if name_key not in dict_a:
            added.append(_to_summary(med_b))
            
    return CompareResponse(
        prescription_a_id=prescription_a_id,
        prescription_b_id=prescription_b_id,
        added=added,
        removed=removed,
        changed=changed,
        unchanged=unchanged
    )
