import asyncio
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

import app.db.base # Avoid circular import
from app.db.database import get_db
from app.models.medicine import Medicine
from sqlalchemy.future import select

SEED_DATA = [
    # Antibiotics
    {"name": "Amoxicillin", "generic_name": "Amoxicillin", "aliases": "Amoxil,Moxatag", "category": "Antibiotic", "common_strengths": "250mg,500mg"},
    {"name": "Azithromycin", "generic_name": "Azithromycin", "aliases": "Zithromax,Z-Pak", "category": "Antibiotic", "common_strengths": "250mg,500mg"},
    {"name": "Ciprofloxacin", "generic_name": "Ciprofloxacin", "aliases": "Cipro", "category": "Antibiotic", "common_strengths": "250mg,500mg"},
    {"name": "Metronidazole", "generic_name": "Metronidazole", "aliases": "Flagyl", "category": "Antibiotic", "common_strengths": "250mg,400mg,500mg"},
    {"name": "Doxycycline", "generic_name": "Doxycycline", "aliases": "Vibramycin,Doryx", "category": "Antibiotic", "common_strengths": "50mg,100mg"},
    {"name": "Cephalexin", "generic_name": "Cephalexin", "aliases": "Keflex", "category": "Antibiotic", "common_strengths": "250mg,500mg"},
    {"name": "Levofloxacin", "generic_name": "Levofloxacin", "aliases": "Levaquin", "category": "Antibiotic", "common_strengths": "250mg,500mg,750mg"},
    {"name": "Clindamycin", "generic_name": "Clindamycin", "aliases": "Cleocin", "category": "Antibiotic", "common_strengths": "150mg,300mg"},

    # Analgesics/NSAIDs
    {"name": "Paracetamol", "generic_name": "Acetaminophen", "aliases": "Acetaminophen,Tylenol,Panadol,Calpol", "category": "Analgesic", "common_strengths": "500mg,650mg"},
    {"name": "Ibuprofen", "generic_name": "Ibuprofen", "aliases": "Advil,Motrin,Brufen", "category": "NSAID", "common_strengths": "200mg,400mg,600mg"},
    {"name": "Diclofenac", "generic_name": "Diclofenac", "aliases": "Voltaren,Cataflam", "category": "NSAID", "common_strengths": "50mg,75mg"},
    {"name": "Naproxen", "generic_name": "Naproxen", "aliases": "Aleve,Naprosyn", "category": "NSAID", "common_strengths": "220mg,250mg,500mg"},
    {"name": "Aspirin", "generic_name": "Acetylsalicylic acid", "aliases": "Ecotrin,Disprin", "category": "NSAID", "common_strengths": "75mg,81mg,325mg"},

    # Cardiovascular
    {"name": "Amlodipine", "generic_name": "Amlodipine", "aliases": "Norvasc", "category": "Cardiovascular", "common_strengths": "2.5mg,5mg,10mg"},
    {"name": "Atenolol", "generic_name": "Atenolol", "aliases": "Tenormin", "category": "Cardiovascular", "common_strengths": "25mg,50mg,100mg"},
    {"name": "Lisinopril", "generic_name": "Lisinopril", "aliases": "Prinivil,Zestril", "category": "Cardiovascular", "common_strengths": "5mg,10mg,20mg"},
    {"name": "Losartan", "generic_name": "Losartan", "aliases": "Cozaar", "category": "Cardiovascular", "common_strengths": "25mg,50mg,100mg"},
    {"name": "Metoprolol", "generic_name": "Metoprolol", "aliases": "Lopressor,Toprol", "category": "Cardiovascular", "common_strengths": "25mg,50mg,100mg"},
    {"name": "Enalapril", "generic_name": "Enalapril", "aliases": "Vasotec", "category": "Cardiovascular", "common_strengths": "2.5mg,5mg,10mg,20mg"},
    {"name": "Clopidogrel", "generic_name": "Clopidogrel", "aliases": "Plavix", "category": "Cardiovascular", "common_strengths": "75mg"},

    # Diabetes
    {"name": "Metformin", "generic_name": "Metformin", "aliases": "Glucophage", "category": "Diabetes", "common_strengths": "500mg,850mg,1000mg"},
    {"name": "Glimepiride", "generic_name": "Glimepiride", "aliases": "Amaryl", "category": "Diabetes", "common_strengths": "1mg,2mg,4mg"},
    {"name": "Sitagliptin", "generic_name": "Sitagliptin", "aliases": "Januvia", "category": "Diabetes", "common_strengths": "25mg,50mg,100mg"},
    {"name": "Insulin Glargine", "generic_name": "Insulin Glargine", "aliases": "Lantus,Toujeo", "category": "Diabetes", "common_strengths": "100 units/mL"},

    # GI
    {"name": "Omeprazole", "generic_name": "Omeprazole", "aliases": "Prilosec,Losec", "category": "GI", "common_strengths": "10mg,20mg,40mg"},
    {"name": "Pantoprazole", "generic_name": "Pantoprazole", "aliases": "Protonix,Pantoc", "category": "GI", "common_strengths": "20mg,40mg"},
    {"name": "Ranitidine", "generic_name": "Ranitidine", "aliases": "Zantac", "category": "GI", "common_strengths": "75mg,150mg,300mg"},
    {"name": "Domperidone", "generic_name": "Domperidone", "aliases": "Motilium", "category": "GI", "common_strengths": "10mg"},
    {"name": "Ondansetron", "generic_name": "Ondansetron", "aliases": "Zofran", "category": "GI", "common_strengths": "4mg,8mg"},

    # Respiratory
    {"name": "Salbutamol", "generic_name": "Albuterol", "aliases": "Albuterol,Ventolin,ProAir", "category": "Respiratory", "common_strengths": "100mcg"},
    {"name": "Montelukast", "generic_name": "Montelukast", "aliases": "Singulair", "category": "Respiratory", "common_strengths": "4mg,5mg,10mg"},
    {"name": "Cetirizine", "generic_name": "Cetirizine", "aliases": "Zyrtec", "category": "Respiratory", "common_strengths": "5mg,10mg"},
    {"name": "Loratadine", "generic_name": "Loratadine", "aliases": "Claritin", "category": "Respiratory", "common_strengths": "10mg"},
    {"name": "Fluticasone", "generic_name": "Fluticasone", "aliases": "Flonase,Flovent", "category": "Respiratory", "common_strengths": "50mcg"},

    # Neuro/Psych
    {"name": "Sertraline", "generic_name": "Sertraline", "aliases": "Zoloft", "category": "Neuro/Psych", "common_strengths": "25mg,50mg,100mg"},
    {"name": "Escitalopram", "generic_name": "Escitalopram", "aliases": "Lexapro,Cipralex", "category": "Neuro/Psych", "common_strengths": "5mg,10mg,20mg"},
    {"name": "Gabapentin", "generic_name": "Gabapentin", "aliases": "Neurontin", "category": "Neuro/Psych", "common_strengths": "100mg,300mg,400mg"},
    {"name": "Pregabalin", "generic_name": "Pregabalin", "aliases": "Lyrica", "category": "Neuro/Psych", "common_strengths": "50mg,75mg,150mg"},
    {"name": "Amitriptyline", "generic_name": "Amitriptyline", "aliases": "Elavil", "category": "Neuro/Psych", "common_strengths": "10mg,25mg,50mg"},

    # Misc
    {"name": "Prednisolone", "generic_name": "Prednisolone", "aliases": "Omnipred", "category": "Misc", "common_strengths": "5mg,15mg,20mg"},
    {"name": "Multivitamin", "generic_name": "Multivitamins", "aliases": "Vitamins,Supradyn,Centrum", "category": "Misc", "common_strengths": ""},
    {"name": "Folic Acid", "generic_name": "Folic Acid", "aliases": "Vitamin B9", "category": "Misc", "common_strengths": "400mcg,1mg,5mg"},
    {"name": "Iron", "generic_name": "Ferrous Sulfate", "aliases": "Ferrous Sulfate,Feosol", "category": "Misc", "common_strengths": "325mg"},
    {"name": "Vitamin D3", "generic_name": "Cholecalciferol", "aliases": "Cholecalciferol", "category": "Misc", "common_strengths": "400IU,1000IU,60000IU"},
    {"name": "Levothyroxine", "generic_name": "Levothyroxine", "aliases": "Synthroid,Eltroxin", "category": "Misc", "common_strengths": "25mcg,50mcg,100mcg"},
    {"name": "Atorvastatin", "generic_name": "Atorvastatin", "aliases": "Lipitor", "category": "Misc", "common_strengths": "10mg,20mg,40mg"},
    {"name": "Rosuvastatin", "generic_name": "Rosuvastatin", "aliases": "Crestor", "category": "Misc", "common_strengths": "5mg,10mg,20mg"},
]

async def seed_medicines():
    async for db in get_db():
        print("Starting medicine seed process...")
        try:
            for data in SEED_DATA:
                result = await db.execute(select(Medicine).where(Medicine.name == data["name"]))
                existing = result.scalars().first()
                if not existing:
                    med = Medicine(**data)
                    db.add(med)
                    print(f"Added {data['name']}")
                else:
                    # Update fields
                    existing.generic_name = data.get("generic_name")
                    existing.aliases = data.get("aliases")
                    existing.category = data.get("category")
                    existing.common_strengths = data.get("common_strengths")
                    print(f"Updated {data['name']}")
                    
            await db.commit()
            print("Successfully seeded medicines table!")
        except Exception as e:
            print(f"Failed to seed medicines: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(seed_medicines())
