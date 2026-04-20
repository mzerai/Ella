"""Prompt Engineering Labs API endpoints."""

import logging
from fastapi import APIRouter, HTTPException

from app.services.ella.client import is_configured
from app.services.labs.pe.models import PELabRunRequest, PELabRunResponse
from app.services.labs.pe.executor import run_pe_lab
from app.services.labs.pe.loader import load_lab, get_mission

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/run", response_model=PELabRunResponse)
async def run_lab(request: PELabRunRequest):
    """Execute a PE lab mission: run the student's prompt and evaluate it.

    Flow:
    1. Student's prompt is executed via TokenFactory
    2. ELLA evaluates the prompt + result against the mission rubric
    3. Both the LLM output and evaluation are returned
    """
    if not request.student_prompt.strip() and not request.system_prompt:
        # System prompt might be required for Lab 04
        raise HTTPException(status_code=422, detail="Student prompt or system prompt must be provided.")

    if not is_configured():
        raise HTTPException(status_code=503, detail="TokenFactory is not configured.")

    # Validate lab and mission exist
    mission = get_mission(request.lab_id, request.mission_id)
    if mission is None:
        raise HTTPException(
            status_code=404,
            detail=f"Mission '{request.mission_id}' not found in lab '{request.lab_id}'.",
        )

    try:
        response = run_pe_lab(request)
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error("PE lab error: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while running the lab.")


@router.get("/labs")
async def list_labs():
    """List all available PE labs."""
    lab_ids = [
        "01_zero_shot",
        "02_few_shot",
        "03_chain_of_thought",
        "04_system_prompts",
        "05_structured_output",
    ]
    labs = []
    for lab_id in lab_ids:
        lab = load_lab(lab_id)
        if lab:
            labs.append({
                "lab_id": lab["lab_id"],
                "title": lab["title"],
                "description": lab["description"],
                "mission_count": len(lab.get("missions", [])),
            })
    return {"labs": labs}


@router.get("/labs/{lab_id}")
async def get_lab_detail(lab_id: str):
    """Get detailed info about a specific PE lab including its missions."""
    lab = load_lab(lab_id)
    if lab is None:
        raise HTTPException(status_code=404, detail=f"Lab '{lab_id}' not found.")

    missions = []
    for m in lab.get("missions", []):
        missions.append({
            "mission_id": m["mission_id"],
            "title": m["title"],
            "audience": m.get("audience", ""),
            "difficulty": m.get("difficulty", ""),
            "instructions": m["instructions"],
            "hints": m.get("hints", []),
        })

    return {
        "lab_id": lab["lab_id"],
        "title": lab["title"],
        "description": lab["description"],
        "concept": lab.get("concept", {}),
        "missions": missions,
    }
