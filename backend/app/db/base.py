from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import all models here so Alembic can find them
# We will add imports as we create models
from app.models.user import User
from app.models.prescription import Prescription
from app.models.prescription_page import PrescriptionPage
from app.models.medicine import Medicine, PrescriptionMedicine
from app.models.test import Test
from app.models.verification_log import VerificationLog
