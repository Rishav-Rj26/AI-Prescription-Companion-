import io
import pytest
from unittest.mock import patch, MagicMock
from fastapi import UploadFile, HTTPException

from app.services import cloudinary_client
from app.services.cloudinary_client import StorageException
from app.services.storage import upload_prescription_page


def test_cloudinary_upload_standard():
    dummy_file = io.BytesIO(b"fake image data")
    expected_response = {
        "public_id": "test_folder/sample123",
        "secure_url": "https://res.cloudinary.com/test_cloud/image/upload/v1/test_folder/sample123.jpg",
        "bytes": len(b"fake image data"),
        "resource_type": "image",
    }
    with patch("cloudinary.uploader.upload", return_value=expected_response) as mock_upload:
        res = cloudinary_client.upload(
            dummy_file,
            public_id="sample123",
            folder="test_folder",
            resource_type="image",
        )
        assert res["public_id"] == "test_folder/sample123"
        assert res["secure_url"] == expected_response["secure_url"]
        mock_upload.assert_called_once()
        _, kwargs = mock_upload.call_args
        assert kwargs["public_id"] == "sample123"
        assert kwargs["folder"] == "test_folder"
        assert kwargs["resource_type"] == "image"


def test_cloudinary_upload_large():
    dummy_file = io.BytesIO(b"large data" * 1000)
    expected_response = {
        "public_id": "test_folder/large123",
        "secure_url": "https://res.cloudinary.com/test_cloud/video/upload/v1/test_folder/large123.mp4",
        "bytes": 10000,
        "resource_type": "video",
    }
    with patch("cloudinary.uploader.upload_large", return_value=expected_response) as mock_large:
        res = cloudinary_client.upload(
            dummy_file,
            public_id="large123",
            folder="test_folder",
            resource_type="video",
        )
        assert res["public_id"] == "test_folder/large123"
        mock_large.assert_called_once()


def test_cloudinary_upload_failure():
    dummy_file = io.BytesIO(b"fake image data")
    with patch("cloudinary.uploader.upload", side_effect=Exception("API connection timeout")):
        with pytest.raises(StorageException, match="Failed to upload file to Cloudinary"):
            cloudinary_client.upload(dummy_file, folder="test")


def test_cloudinary_delete():
    with patch("cloudinary.uploader.destroy", return_value={"result": "ok"}) as mock_destroy:
        res = cloudinary_client.delete("test_folder/sample123", resource_type="image")
        assert res["result"] == "ok"
        mock_destroy.assert_called_once_with(
            "test_folder/sample123",
            resource_type="image",
            invalidate=True,
        )


def test_cloudinary_delete_failure():
    with patch("cloudinary.uploader.destroy", side_effect=Exception("Resource not found")):
        with pytest.raises(StorageException, match="Failed to delete file from Cloudinary"):
            cloudinary_client.delete("bad_id")


def test_cloudinary_get_url_with_optimizations():
    url = cloudinary_client.get_url(
        "prescriptions/user_1/presc_2/sample",
        resource_type="image",
        auto_optimize=True,
    )
    assert "f_auto" in url
    assert "q_auto" in url
    assert "prescriptions/user_1/presc_2/sample" in url


def test_cloudinary_get_url_signed():
    url = cloudinary_client.get_url(
        "prescriptions/user_1/presc_2/sample",
        sign_url=True,
    )
    assert "/s--" in url


def test_cloudinary_list_resources():
    fake_list = {
        "resources": [
            {"public_id": "prescriptions/user_1/presc_2/p1", "format": "jpg"}
        ],
        "next_cursor": "abc123cursor",
    }
    with patch("cloudinary.api.resources", return_value=fake_list) as mock_resources:
        res = cloudinary_client.list_resources(folder="prescriptions/user_1/presc_2")
        assert len(res["resources"]) == 1
        assert res["next_cursor"] == "abc123cursor"
        mock_resources.assert_called_once()


@pytest.mark.asyncio
async def test_upload_prescription_page_success():
    # Valid JPEG header
    content = b"\xff\xd8\xff\xe0" + b"x" * 100
    upload_file = UploadFile(
        file=io.BytesIO(content),
        filename="rx_doc.jpg",
        headers={"content-type": "image/jpeg"},
    )

    mock_cloudinary_response = {
        "public_id": "prescriptions/user_5/presc_10/generated_uid",
        "secure_url": "https://res.cloudinary.com/test_cloud/image/upload/v1/rx_doc.jpg",
        "bytes": len(content),
    }

    with patch("app.services.cloudinary_client.upload", return_value=mock_cloudinary_response):
        result = await upload_prescription_page(upload_file, user_id=5, prescription_id=10)

        assert result["file_url"] == "https://res.cloudinary.com/test_cloud/image/upload/v1/rx_doc.jpg"
        assert result["file_type"] == "image/jpeg"
        assert result["file_size_bytes"] == len(content)
        assert result["original_filename"] == "rx_doc.jpg"
        assert result["public_id"] == "prescriptions/user_5/presc_10/generated_uid"


@pytest.mark.asyncio
async def test_upload_prescription_page_pdf():
    # Valid PDF header
    content = b"%PDF-1.4" + b"x" * 100
    upload_file = UploadFile(
        file=io.BytesIO(content),
        filename="rx_doc.pdf",
        headers={"content-type": "application/pdf"},
    )

    mock_cloudinary_response = {
        "public_id": "prescriptions/user_5/presc_10/generated_uid",
        "secure_url": "https://res.cloudinary.com/test_cloud/image/upload/v1/rx_doc.pdf",
        "bytes": len(content),
    }

    with patch("app.services.cloudinary_client.upload", return_value=mock_cloudinary_response) as mock_upload:
        result = await upload_prescription_page(upload_file, user_id=5, prescription_id=10)

        assert result["file_url"] == "https://res.cloudinary.com/test_cloud/image/upload/v1/rx_doc.pdf"
        assert result["file_type"] == "application/pdf"
        _, kwargs = mock_upload.call_args
        assert kwargs["resource_type"] == "auto"


@pytest.mark.asyncio
async def test_upload_prescription_page_unsupported_type():
    upload_file = UploadFile(
        file=io.BytesIO(b"hello world"),
        filename="rx.txt",
        headers={"content-type": "text/plain"},
    )
    with pytest.raises(HTTPException) as exc_info:
        await upload_prescription_page(upload_file, user_id=1, prescription_id=1)
    assert exc_info.value.status_code == 400
    assert "Unsupported file type" in exc_info.value.detail


@pytest.mark.asyncio
async def test_upload_prescription_page_empty_file():
    upload_file = UploadFile(
        file=io.BytesIO(b""),
        filename="empty.jpg",
        headers={"content-type": "image/jpeg"},
    )
    with pytest.raises(HTTPException) as exc_info:
        await upload_prescription_page(upload_file, user_id=1, prescription_id=1)
    assert exc_info.value.status_code == 400
    assert "Empty files cannot be uploaded" in exc_info.value.detail


@pytest.mark.asyncio
async def test_upload_prescription_page_cloudinary_failure():
    content = b"\xff\xd8\xff\xe0" + b"x" * 100
    upload_file = UploadFile(
        file=io.BytesIO(content),
        filename="rx_doc.jpg",
        headers={"content-type": "image/jpeg"},
    )

    with patch("app.services.cloudinary_client.upload", side_effect=StorageException("Network timeout")):
        with pytest.raises(HTTPException) as exc_info:
            await upload_prescription_page(upload_file, user_id=5, prescription_id=10)
        assert exc_info.value.status_code == 500
        assert "Failed to upload file to storage" in exc_info.value.detail
