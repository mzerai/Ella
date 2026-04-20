# ELLA — ESPRIT LearnLab Arena

AI-powered immersive learning platform by ESPRIT School of Engineering.

## Stack
- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: Next.js 14 (App Router) — Month 2
- **Database**: Supabase PostgreSQL — Month 2
- **LLM**: Llama-3.1-70B-Instruct via TokenFactory (DGX A100)

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Tests
```bash
cd backend && pytest tests/ -v
```

### API Docs
http://localhost:8000/docs
