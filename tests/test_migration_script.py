import sys
from unittest.mock import MagicMock, patch
from scripts.migrate_s3_to_cloudinary import get_resource_type, migrate


def test_get_resource_type():
    assert get_resource_type("path/to/image.jpg") == "image"
    assert get_resource_type("path/to/image.PNG") == "image"
    assert get_resource_type("path/to/document.pdf") == "auto"
    assert get_resource_type("path/to/clip.mp4") == "video"
    assert get_resource_type("path/to/data.csv") == "raw"


def test_migrate_dry_run():
    mock_args = MagicMock()
    mock_args.dry_run = True
    mock_args.s3_bucket = "my-test-bucket"
    mock_args.s3_prefix = "prescriptions/"
    mock_args.aws_access_key = "test_key"
    mock_args.aws_secret_key = "test_secret"
    mock_args.aws_region = "us-east-1"
    mock_args.cloud_name = "test_cloud"
    mock_args.api_key = "test_api_key"
    mock_args.api_secret = "test_api_secret"

    mock_paginator = MagicMock()
    mock_paginator.paginate.return_value = [
        {
            "Contents": [
                {"Key": "prescriptions/user_1/presc_2/item1.jpg", "Size": 1024},
                {"Key": "prescriptions/user_1/presc_2/item2.pdf", "Size": 2048},
                {"Key": "prescriptions/user_1/presc_2/", "Size": 0},  # Directory marker
            ]
        }
    ]

    mock_s3_client = MagicMock()
    mock_s3_client.get_paginator.return_value = mock_paginator

    mock_session = MagicMock()
    mock_session.client.return_value = mock_s3_client

    mock_boto3 = MagicMock()
    mock_boto3.Session.return_value = mock_session
    mock_botocore = MagicMock()

    with patch.dict(sys.modules, {"boto3": mock_boto3, "botocore": mock_botocore, "botocore.exceptions": mock_botocore}):
        with patch("cloudinary.uploader.upload") as mock_upload:
            migrate(mock_args)
            mock_upload.assert_not_called()


def test_migrate_live_execution():
    mock_args = MagicMock()
    mock_args.dry_run = False
    mock_args.s3_bucket = "my-test-bucket"
    mock_args.s3_prefix = "prescriptions/"
    mock_args.aws_access_key = "test_key"
    mock_args.aws_secret_key = "test_secret"
    mock_args.aws_region = "us-east-1"
    mock_args.cloud_name = "test_cloud"
    mock_args.api_key = "test_api_key"
    mock_args.api_secret = "test_api_secret"

    mock_paginator = MagicMock()
    mock_paginator.paginate.return_value = [
        {
            "Contents": [
                {"Key": "prescriptions/user_1/presc_2/item1.jpg", "Size": 1024},
            ]
        }
    ]

    mock_s3_client = MagicMock()
    mock_s3_client.get_paginator.return_value = mock_paginator
    mock_s3_client.get_object.return_value = {"Body": b"image bytes"}

    mock_session = MagicMock()
    mock_session.client.return_value = mock_s3_client

    mock_boto3 = MagicMock()
    mock_boto3.Session.return_value = mock_session
    mock_botocore = MagicMock()

    with patch.dict(sys.modules, {"boto3": mock_boto3, "botocore": mock_botocore, "botocore.exceptions": mock_botocore}):
        with patch("cloudinary.uploader.upload", return_value={"secure_url": "https://res.cloudinary.com/test.jpg"}) as mock_upload:
            migrate(mock_args)
            mock_upload.assert_called_once()
