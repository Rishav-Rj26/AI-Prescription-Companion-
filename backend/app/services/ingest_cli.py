import argparse
import asyncio
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from app.db.database import get_db
from app.services.ingestion import ingest_document

async def main():
    parser = argparse.ArgumentParser(description="Ingest a document into the RAG knowledge base.")
    parser.add_argument("--source", required=True, help="Path to the source file (e.g. .txt or .md)")
    parser.add_argument("--title", required=True, help="Title of the document")
    
    args = parser.parse_args()
    
    async for db in get_db():
        try:
            await ingest_document(args.source, args.title, db)
        except Exception as e:
            print(f"Error during ingestion: {e}")
        finally:
            break

if __name__ == "__main__":
    asyncio.run(main())
