import os
import sys
import json
import asyncio
from PIL import Image

# Add backend to path so we can import from app
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
from app.ai.extractor import extract_prescription_data
from app.config import settings

# Verify API key is set
if not settings.GOOGLE_API_KEY or settings.GOOGLE_API_KEY == "your-gemini-api-key":
    print("WARNING: GOOGLE_API_KEY is not properly set in .env")
    print("Cannot run evaluation against real Gemini API. Skipping actual API calls.")
    sys.exit(1)

SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "samples")

def fuzzy_match(expected: str, actual: str) -> bool:
    if not expected or not actual:
        return expected == actual
    # Simple case-insensitive substring match for now
    return expected.lower() in actual.lower() or actual.lower() in expected.lower()

async def evaluate():
    gt_path = os.path.join(SAMPLES_DIR, "ground_truth.json")
    if not os.path.exists(gt_path):
        print("Run generate_samples.py first to create samples.")
        return

    with open(gt_path, 'r') as f:
        ground_truth = json.load(f)

    total_meds_expected = 0
    correct_med_names = 0
    correct_med_details = 0

    print("Starting AI Evaluation...")
    print("-" * 50)

    for filename, expected_data in ground_truth.items():
        img_path = os.path.join(SAMPLES_DIR, filename)
        
        with open(img_path, 'rb') as f:
            img_bytes = f.read()

        try:
            print(f"Processing {filename}...")
            # Use real API call
            result = await extract_prescription_data([img_bytes])
            
            # Compare Medicines
            expected_meds = expected_data.get("medicines", [])
            actual_meds = result.medicines
            
            total_meds_expected += len(expected_meds)
            
            # Simple greedy match
            for exp in expected_meds:
                matched = False
                for act in actual_meds:
                    if fuzzy_match(exp.get("raw_name"), act.raw_name):
                        correct_med_names += 1
                        matched = True
                        
                        # Check details (dosage, frequency, etc.)
                        details_match = True
                        if exp.get("strength") and not fuzzy_match(exp.get("strength"), act.strength): details_match = False
                        if exp.get("dosage") and not fuzzy_match(exp.get("dosage"), act.dosage): details_match = False
                        if exp.get("frequency") and not fuzzy_match(exp.get("frequency"), act.frequency): details_match = False
                        
                        if details_match:
                            correct_med_details += 1
                        else:
                            print(f"  [~] Med Details Mismatch for '{exp.get('raw_name')}': Expected {exp}, Got {act}")
                        break
                
                if not matched:
                    print(f"  [!] Missing Expected Medicine: {exp.get('raw_name')}")

            # Confidence check
            print(f"  Overall Confidence: {result.overall_confidence}")
            
        except Exception as e:
            print(f"  [X] Failed to process {filename}: {e}")

    print("-" * 50)
    name_accuracy = (correct_med_names / total_meds_expected) * 100 if total_meds_expected else 0
    details_accuracy = (correct_med_details / total_meds_expected) * 100 if total_meds_expected else 0

    print(f"Evaluation Results:")
    print(f"Total Expected Medicines: {total_meds_expected}")
    print(f"Medicine Name Accuracy: {name_accuracy:.1f}% ({correct_med_names}/{total_meds_expected})")
    print(f"Medicine Details Accuracy: {details_accuracy:.1f}% ({correct_med_details}/{total_meds_expected})")

    if name_accuracy >= 70:
        print("\nPASSED (Accuracy >= 70%)")
        sys.exit(0)
    else:
        print("\nFAILED (Accuracy < 70%)")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(evaluate())
