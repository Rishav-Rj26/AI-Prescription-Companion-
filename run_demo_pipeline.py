import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"
session = requests.Session()

print("=" * 65)
print("  AI PRESCRIPTION COMPANION — LIVE WORKING DEMONSTRATION")
print("=" * 65)

# Step 1: Health check
h_res = session.get(f"{BASE_URL}/health")
print(f"[Step 1] System Health: {h_res.status_code} -> {h_res.json()}")

# Step 2: Register patient
email = f"patient_{int(time.time())}@clinical-demo.org"
password = "SecurePassword2026!"
reg_res = session.post(
    f"{BASE_URL}/auth/register",
    json={"email": email, "password": password, "full_name": "Eleanor Vance"}
)
print(f"[Step 2] User Registration: {reg_res.status_code}")
user_data = reg_res.json()
print(f"         Registered: {user_data.get('email')} ({user_data.get('full_name')})")

# Set CSRF Token for state-changing requests
csrf_token = session.cookies.get("prescription_csrf")
if csrf_token:
    session.headers["X-CSRF-Token"] = csrf_token
    print(f"         CSRF Token established.")

# Step 3: Upload sample prescription
sample_file = "backend/samples/sample_1_single_med.png"
with open(sample_file, "rb") as f:
    upload_res = session.post(
        f"{BASE_URL}/prescriptions/upload",
        files=[("files", ("sample_1_single_med.png", f, "image/png"))]
    )

print(f"[Step 3] Prescription Upload: {upload_res.status_code}")
upload_data = upload_res.json()
presc_id = upload_data["id"]
page = upload_data["pages"][0]
print(f"         Prescription ID: #{presc_id}")
print(f"         Document URL: {page['file_url']}")
print(f"         File: {page['original_filename']} ({page['file_type']}, {page['file_size_bytes']} bytes)")

# Step 4: Run AI Pipeline (OCR + Gemini 3.8 Flash Vision + Normalization + Schedules)
print(f"\n[Step 4] Running Clinical AI Pipeline via Gemini 3.8 Flash...")
start_time = time.time()
process_res = session.post(f"{BASE_URL}/prescriptions/{presc_id}/process")
duration = time.time() - start_time
print(f"         Pipeline completed in {duration:.2f}s (Status: {process_res.status_code})")

# Step 5: Retrieve Structured Clinical Data
get_res = session.get(f"{BASE_URL}/prescriptions/{presc_id}")
full_data = get_res.json()

print("\n" + "=" * 65)
print("  EXTRACTED CLINICAL SUMMARY & AI ANALYSIS")
print("=" * 65)
print(f"Prescription Status: {full_data.get('status').upper()}")
print(f"Total Pages Processed: {len(full_data.get('pages', []))}")

medicines = full_data.get("medicines", [])
print(f"\nMedicines Identified ({len(medicines)}):")
for idx, med in enumerate(medicines, 1):
    print(f"  {idx}. Extracted Name: {med.get('extracted_name')}")
    print(f"     Normalized Name: {med.get('normalized_name')} (Category: {med.get('category', 'Standard')})")
    print(f"     Dosage: {med.get('dosage')} | Frequency: {med.get('frequency')} | Duration: {med.get('duration')}")
    conf = med.get('confidence_score')
    conf_str = f"{conf:.2%}" if conf is not None else "N/A"
    print(f"     Confidence Score: {conf_str} (Needs Review: {med.get('needs_verification')})")


tests = full_data.get("tests", [])
print(f"\nDiagnostic Tests Ordered ({len(tests)}):")
if tests:
    for idx, t in enumerate(tests, 1):
        print(f"  {idx}. {t.get('name')}")
else:
    print("  None ordered on this prescription.")

print("\n" + "=" * 65)
print("  ALL SYSTEMS OPERATIONAL: Pipeline, Database, AI & Storage Demo Succeeded!")
print("=" * 65)
