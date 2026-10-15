import pytest
from fastapi import HTTPException

from app.services.storage import _validate_file_signature


@pytest.mark.parametrize(
    ("content_type", "header"),
    [
        ("image/jpeg", b"\xff\xd8\xff\xe0payload"),
        ("image/png", b"\x89PNG\r\n\x1a\npayload"),
        ("application/pdf", b"%PDF-1.7"),
    ],
)
def test_accepts_recognized_file_signatures(content_type, header):
    _validate_file_signature(content_type, header)


def test_rejects_a_spoofed_content_type():
    with pytest.raises(HTTPException, match="do not match"):
        _validate_file_signature("image/png", b"not really an image")
