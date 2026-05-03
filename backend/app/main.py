"""ELLA Backend — FastAPI Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import health, ella, pe_labs, rl_labs, aile_labs, agentic_labs, finance_labs, healthcare_labs, manufacturing_labs, literacy_labs, admin, certificates, progress, access_codes


def create_app() -> FastAPI:
    app = FastAPI(
        title="ELLA API",
        description="ESPRIT LearnLab Arena — AI-powered learning platform",
        version=settings.app_version,
        docs_url="/docs" if settings.app_debug else None,
        redoc_url="/redoc" if settings.app_debug else None,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health.router)
    app.include_router(ella.router, prefix="/api/ella", tags=["ELLA AI Tutor"])
    app.include_router(pe_labs.router, prefix="/api/labs/pe", tags=["PE Labs"])
    app.include_router(rl_labs.router, prefix="/api/labs/rl", tags=["RL Labs"])
    app.include_router(aile_labs.router, prefix="/api/labs/aile", tags=["AILE Labs"])
    app.include_router(agentic_labs.router, prefix="/api/labs/agentic", tags=["Agentic AI Labs"])
    app.include_router(finance_labs.router, prefix="/api/labs/finance", tags=["AI Finance & Banking Labs"])
    app.include_router(healthcare_labs.router, prefix="/api/labs/healthcare", tags=["AI Healthcare Labs"])
    app.include_router(manufacturing_labs.router, prefix="/api/labs/manufacturing", tags=["AI Manufacturing & Industry 4.0 Labs"])
    app.include_router(literacy_labs.router, prefix="/api/labs/literacy", tags=["AI Literacy & Digital Transformation Labs"])
    app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
    app.include_router(certificates.router, prefix="/api/certificates", tags=["Certificates"])
    app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
    app.include_router(access_codes.router, prefix="/api/courses", tags=["Course Access"])

    return app



app = create_app()

# Cache invalidation touch
