"""ELLA Backend — FastAPI Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import health, ella, pe_labs, rl_labs, admin, certificates, progress


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
    app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
    app.include_router(certificates.router, prefix="/api/certificates", tags=["Certificates"])
    app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
    return app


app = create_app()
