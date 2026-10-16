#!/usr/bin/env python3
"""
One-off migration script to copy existing prescription files from AWS S3 to Cloudinary.
Preserves folder hierarchy:
  s3://bucket/prescriptions/user_X/presc_Y/uuid.jpg
  -> Cloudinary folder: prescriptions/user_X/presc_Y, public_id: uuid

Usage:
  python scripts/migrate_s3_to_cloudinary.py --dry-run
  python scripts/migrate_s3_to_cloudinary.py --s3-bucket my-bucket
"""

import os
import sys
import argparse
import logging
from typing import Dict, Any, List

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("s3_to_cloudinary_migration")


def parse_args():
    parser = argparse.ArgumentParser(description="Migrate assets from AWS S3 to Cloudinary.")
    parser.add_argument("--s3-bucket", default=os.getenv("AWS_S3_BUCKET_NAME", ""), help="S3 Bucket name")
    parser.add_argument("--s3-prefix", default="prescriptions/", help="Prefix of keys to migrate")
    parser.add_argument("--aws-region", default=os.getenv("AWS_S3_REGION", "us-east-1"), help="AWS Region")
    parser.add_argument("--aws-access-key", default=os.getenv("AWS_ACCESS_KEY_ID", ""), help="AWS Access Key")
    parser.add_argument("--aws-secret-key", default=os.getenv("AWS_SECRET_ACCESS_KEY", ""), help="AWS Secret Key")
    parser.add_argument("--cloud-name", default=os.getenv("CLOUDINARY_CLOUD_NAME", ""), help="Cloudinary cloud name")
    parser.add_argument("--api-key", default=os.getenv("CLOUDINARY_API_KEY", ""), help="Cloudinary API key")
    parser.add_argument("--api-secret", default=os.getenv("CLOUDINARY_API_SECRET", ""), help="Cloudinary API secret")
    parser.add_argument("--dry-run", action="store_true", help="Simulate migration without modifying Cloudinary")
    return parser.parse_args()


def get_resource_type(key: str) -> str:
    ext = os.path.splitext(key)[1].lower()
    if ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        return "image"
    elif ext in [".pdf"]:
        return "auto"
    elif ext in [".mp4", ".mov", ".avi"]:
        return "video"
    return "raw"


def migrate(args):
    try:
        import cloudinary
        import cloudinary.uploader
    except ImportError:
        logger.error("Cloudinary package not installed. Run 'pip install cloudinary'")
        sys.exit(1)

    if not args.dry_run:
        if not (args.cloud_name and args.api_key and args.api_secret):
            logger.error("Cloudinary credentials are missing. Provide --cloud-name, --api-key, and --api-secret or set env vars.")
            sys.exit(1)
        cloudinary.config(
            cloud_name=args.cloud_name,
            api_key=args.api_key,
            api_secret=args.api_secret,
            secure=True,
        )

    try:
        import boto3
        from botocore.exceptions import ClientError
    except ImportError:
        logger.warning("boto3 is not installed in the current environment. To connect directly to S3, install boto3.")
        boto3 = None

    if not args.s3_bucket:
        logger.error("S3 bucket name required. Specify --s3-bucket or set AWS_S3_BUCKET_NAME.")
        sys.exit(1)

    if boto3 is None:
        logger.error("Cannot proceed without boto3 to list S3 objects.")
        sys.exit(1)

    session = boto3.Session(
        aws_access_key_id=args.aws_access_key or None,
        aws_secret_access_key=args.aws_secret_key or None,
        region_name=args.aws_region,
    )
    s3_client = session.client("s3")

    logger.info(f"Starting migration from s3://{args.s3_bucket}/{args.s3_prefix} (Dry run: {args.dry_run})")

    paginator = s3_client.get_paginator("list_objects_v2")
    pages = paginator.paginate(Bucket=args.s3_bucket, Prefix=args.s3_prefix)

    total_scanned = 0
    total_migrated = 0
    failures: List[Dict[str, Any]] = []

    for page in pages:
        contents = page.get("Contents", [])
        for item in contents:
            key = item["Key"]
            size = item.get("Size", 0)

            # Skip directory markers
            if key.endswith("/"):
                continue

            total_scanned += 1

            # Extract folder and public_id
            dirname, filename = os.path.split(key)
            name_without_ext = os.path.splitext(filename)[0]
            resource_type = get_resource_type(key)

            target_folder = dirname
            target_public_id = name_without_ext

            if args.dry_run:
                logger.info(
                    f"[DRY-RUN] Would migrate: s3://{args.s3_bucket}/{key} ({size} bytes) "
                    f"-> Cloudinary folder='{target_folder}', public_id='{target_public_id}', type='{resource_type}'"
                )
                total_migrated += 1
                continue

            try:
                # Stream object directly from S3 to Cloudinary
                s3_obj = s3_client.get_object(Bucket=args.s3_bucket, Key=key)
                file_stream = s3_obj["Body"]

                resp = cloudinary.uploader.upload(
                    file_stream,
                    folder=target_folder,
                    public_id=target_public_id,
                    resource_type=resource_type,
                    overwrite=True,
                )
                logger.info(f"[SUCCESS] {key} -> {resp.get('secure_url')}")
                total_migrated += 1
            except Exception as e:
                logger.error(f"[FAILED] Error migrating {key}: {e}")
                failures.append({"key": key, "error": str(e)})

    logger.info("=" * 60)
    logger.info(f"Migration completed. Scanned: {total_scanned}, Migrated: {total_migrated}, Failures: {len(failures)}")
    if failures:
        logger.warning("Failures encountered:")
        for fail in failures:
            logger.warning(f"  - {fail['key']}: {fail['error']}")
    logger.info("=" * 60)


if __name__ == "__main__":
    args = parse_args()
    migrate(args)
