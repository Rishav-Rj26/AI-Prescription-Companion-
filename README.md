# AI Prescription Companion

A patient-facing assistant that converts prescription documents into structured information. It is designed to make prescriptions easier to review; it **does not provide medical advice** and every uncertain extraction must be verified by a qualified person.

## What it does

- Upload JPEG, PNG, or PDF prescriptions, with size and file-signature validation. PDFs are safely rendered to a bounded number of image pages before extraction.
- Extract medicines and diagnostic tests with confidence scores using Gemini.
- Mark low-confidence fields for manual verification and maintain verification logs.
- Normalize medicine names, compare prescriptions, create schedules, and offer cited knowledge-base chat.
- Support authenticated patient and administrator workflows.

## Architecture

- **Web client:** Next.js, TypeScript, Tailwind CSS, shadcn/ui, React Query.
- **API:** FastAPI, SQLAlchemy async, Pydantic validation, JWT authentication.
- **Data:** PostgreSQL with pgvector, Alembic migrations, and S3-compatible object storage.
- **AI:** Gemini structured extraction, confidence gating, normalization, and retrieval.

## Local development

1. Copy `.env.example` to `.env` and replace every placeholder. Use a unique JWT secret of at least 32 random characters. Never commit this file.
2. Create a PostgreSQL database with pgvector enabled and set `DATABASE_URL`.
3. Set `CORS_ORIGINS` to the exact, comma-separated web origins permitted to call the API. Do not use `*` when credentials are enabled.
4. Create and activate a Python virtual environment, then run `pip install -r backend/requirements.txt`.
5. Apply the schema: `cd backend; alembic upgrade head`.
6. Start the API: `cd backend; uvicorn app.main:app --reload`.
7. In another terminal, run `cd frontend; npm install; npm run dev`.

## Quality checks

Run backend checks from the repository root:

```powershell
$env:PYTHONPATH = "backend"
pytest -q
python -m compileall -q backend/app
```

Run web checks from `frontend`:

```powershell
npm run lint
npm run build
```

## Deployment checklist

- Use a managed secret store for the JWT, database, AWS, and Gemini credentials.
- Restrict S3 access; avoid public patient documents and use short-lived signed URLs where applicable.
- Set explicit HTTPS origins in `CORS_ORIGINS`; terminate TLS before traffic reaches the API.
- Run database migrations as a controlled deployment step and back up the database.
- Send structured application errors and latency metrics to monitored logging; never log prescription content, access tokens, or credentials.
- Keep a human verification requirement for low-confidence or clinically ambiguous fields.

## Current safety boundary

The extracted content is informational only. The product must never be used to start, stop, or change medication without instruction from a licensed clinician or pharmacist.
