import pytest
from pydantic import ValidationError

from app.schemas.prescription import FieldConfirmationRequest


def test_accepts_a_valid_medicine_confirmation():
    confirmation = FieldConfirmationRequest(
        medicine_id=12,
        field_name="dosage",
        confirmed_value="Take one tablet after breakfast",
    )
    assert confirmation.medicine_id == 12


@pytest.mark.parametrize(
    "payload",
    [
        {"field_name": "dosage", "confirmed_value": "one"},
        {"medicine_id": 1, "test_id": 2, "field_name": "dosage", "confirmed_value": "one"},
        {"medicine_id": 1, "field_name": "is_admin", "confirmed_value": "true"},
        {"medicine_id": 1, "field_name": "test_name", "confirmed_value": "one"},
        {"test_id": 1, "field_name": "description", "confirmed_value": "  "},
    ],
)
def test_rejects_unsafe_or_invalid_confirmation(payload):
    with pytest.raises(ValidationError):
        FieldConfirmationRequest(**payload)
