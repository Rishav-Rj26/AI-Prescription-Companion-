import os
import json
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = "samples"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SAMPLES = [
    {
        "filename": "sample_1_single_med.png",
        "text": "Dr. Smith\n\nRx:\nAmoxicillin 500mg\n1 tablet three times a day\nfor 7 days",
        "ground_truth": {
            "medicines": [{"raw_name": "Amoxicillin", "normalized_name": "Amoxicillin", "strength": "500mg", "dosage": "1 tablet", "frequency": "three times a day", "duration": "for 7 days"}],
            "tests": []
        }
    },
    {
        "filename": "sample_2_multi_med_test.png",
        "text": "Dr. Jones Clinic\n\n1. Lisinopril 10mg - 1 tab daily (morning)\n2. Metformin 500mg - 1 tab twice daily with meals\n\nPlease get CBC and Lipid Profile done before next visit.",
        "ground_truth": {
            "medicines": [
                {"raw_name": "Lisinopril", "normalized_name": "Lisinopril", "strength": "10mg", "dosage": "1 tab", "frequency": "daily (morning)"},
                {"raw_name": "Metformin", "normalized_name": "Metformin", "strength": "500mg", "dosage": "1 tab", "frequency": "twice daily", "instructions": "with meals"}
            ],
            "tests": [{"test_name": "CBC"}, {"test_name": "Lipid Profile"}]
        }
    },
    {
        "filename": "sample_3_ambiguous.png",
        "text": "Rx\n\nIbuprofen 400mg PRN for pain\nRest for 3 days",
        "ground_truth": {
            "medicines": [{"raw_name": "Ibuprofen", "normalized_name": "Ibuprofen", "strength": "400mg", "dosage": None, "frequency": "PRN", "instructions": "for pain"}],
            "tests": []
        }
    }
]

def generate_samples():
    ground_truth = {}
    
    # Use a default font, size 30
    try:
        font = ImageFont.truetype("arial.ttf", 30)
    except IOError:
        font = ImageFont.load_default()
        
    for sample in SAMPLES:
        # Create a white background image
        img = Image.new('RGB', (800, 600), color='white')
        d = ImageDraw.Draw(img)
        
        # Draw text
        d.text((50, 50), sample["text"], fill=(0, 0, 0), font=font)
        
        # Save image
        out_path = os.path.join(OUTPUT_DIR, sample["filename"])
        img.save(out_path)
        
        ground_truth[sample["filename"]] = sample["ground_truth"]
        
    # Save ground truth
    with open(os.path.join(OUTPUT_DIR, "ground_truth.json"), "w") as f:
        json.dump(ground_truth, f, indent=2)
        
    print(f"Generated {len(SAMPLES)} samples in {OUTPUT_DIR}/")

if __name__ == "__main__":
    generate_samples()
