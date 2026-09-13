# AI Prescription Companion

A full-stack app that reads prescription images/PDFs and converts them into structured, understandable information for patients.

## Architecture
- **Frontend**: Next.js, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, PostgreSQL, pgvector, SQLAlchemy

## Setup Instructions

### Backend Setup
1. Create a virtual environment: `python -m venv venv`
2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
3. Install dependencies: `pip install -r backend/requirements.txt`
4. Create PostgreSQL database and update `.env`
5. Run migrations: `cd backend && alembic upgrade head`
6. Start the server: `cd backend && uvicorn app.main:app --reload`

### Frontend Setup
1. Install dependencies: `cd frontend && npm install`
2. Start the dev server: `npm run dev`
