"""AI Literacy & Digital Transformation Labs API endpoints."""

import json
import logging
import os
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ella.client import request_chat_completion

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/debug-paths")
async def debug_paths():
    mod_dir = _get_literacy_modules_dir()
    lab_dir = _get_literacy_labs_dir()
    return {
        "modules_dir": mod_dir,
        "modules_dir_exists": os.path.exists(mod_dir),
        "labs_dir": lab_dir,
        "labs_dir_exists": os.path.exists(lab_dir),
        "files_in_modules": os.listdir(mod_dir) if os.path.exists(mod_dir) else []
    }


# ============================================
# Literacy Modules (Notebooks)
# ============================================

_LITERACY_MODULE_FILES = {
    "00_course_positioning": "module_00_course_positioning_cells.json",
    "01_understand_ai_without_jargon": "module_01_understand_ai_without_jargon_cells.json",
    "02_daily_generative_ai_work": "module_02_daily_generative_ai_work_cells.json",
    "03_practical_prompting_business_work": "module_03_practical_prompting_business_work_cells.json",
    "04_identify_ai_opportunities_department": "module_04_identify_ai_opportunities_department_cells.json",
    "05_risks_ethics_data_responsible_use": "module_05_risks_ethics_data_responsible_use_cells.json",
    "06_from_individual_use_to_digital_transformation": "module_06_from_individual_use_to_digital_transformation_cells.json",
}


def _get_literacy_modules_dir() -> str:
    """Resolve path to backend/data/ai_literacy/modules/ relative to this file."""
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "ai_literacy", "modules")
    )


def _get_literacy_labs_dir() -> str:
    """Resolve path to backend/data/ai_literacy/labs/ relative to this file."""
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "ai_literacy", "labs")
    )


@router.get("/modules/{module_id}")
async def get_literacy_module_cells(module_id: str):
    """Return the notebook cells for a Literacy module."""
    filename = _LITERACY_MODULE_FILES.get(module_id)
    if not filename:
        raise HTTPException(
            status_code=404, 
            detail=f"Module '{module_id}' not found. Available: {list(_LITERACY_MODULE_FILES.keys())}"
        )

    file_path = os.path.join(_get_literacy_modules_dir(), filename)
    if not os.path.exists(file_path):
        logger.error(f"Literacy module file not found: {file_path}")
        raise HTTPException(status_code=404, detail="Module data file missing on server.")

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


# ============================================
# Literacy Labs
# ============================================

_LITERACY_LAB_FILES = {
    "00_ai_literacy_framing_lab": "lab_00_ai_literacy_framing_lab.json",
    "01_explain_ai_without_jargon_lab": "lab_01_explain_ai_without_jargon_lab.json",
    "02_daily_ai_use_control_lab": "lab_02_daily_ai_use_control_lab.json",
    "03_prompting_business_brief_lab": "lab_03_prompting_business_brief_lab.json",
    "04_ai_opportunity_canvas_lab": "lab_04_ai_opportunity_canvas_lab.json",
    "05_responsible_ai_use_lab": "lab_05_responsible_ai_use_lab.json",
    "06_digital_transformation_roadmap_lab": "lab_06_digital_transformation_roadmap_lab.json",
}


@router.get("/labs/{lab_id}")
async def get_literacy_lab_content(lab_id: str):
    """Return the instructions and missions for a Literacy lab."""
    filename = _LITERACY_LAB_FILES.get(lab_id)
    if not filename:
        raise HTTPException(status_code=404, detail="Lab not found.")

    file_path = os.path.join(_get_literacy_labs_dir(), filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Lab file missing.")

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


# ============================================
# Literacy Evaluation (Ella)
# ============================================

class EvaluationRequest(BaseModel):
    lab_id: str
    mission_id: str
    student_response: str
    context: Optional[str] = None


@router.post("/evaluate")
async def evaluate_literacy_mission(req: EvaluationRequest):
    """Call Ella to evaluate a student's mission response."""
    # 1. Load lab data to get mission instructions
    lab_filename = _LITERACY_LAB_FILES.get(req.lab_id)
    if not lab_filename:
        raise HTTPException(status_code=404, detail="Lab not found.")

    lab_path = os.path.join(_get_literacy_labs_dir(), lab_filename)
    with open(lab_path, "r", encoding="utf-8") as f:
        lab_data = json.load(f)

    # 2. Find the specific mission
    mission = next((m for m in lab_data.get("missions", []) if m["id"] == req.mission_id), None)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found.")

    # 3. Build evaluation prompt
    system_prompt = (
        "Tu es Ella, coach experte en Littératie IA chez ESPRIT. "
        "Évalue la réponse de l'étudiant pour la mission suivante.\n\n"
        f"CONTEXTE DU LAB : {lab_data.get('title')}\n"
        f"OBJECTIF MISSION : {mission.get('instruction')}\n"
        "CONSIGNES D'ÉVALUATION :\n"
        "- Sois encourageante mais exigeante sur la clarté et l'impact business.\n"
        "- Si la réponse est trop vague, demande des précisions.\n"
        "- Ne donne JAMAIS la solution, guide-les avec des questions.\n"
    )

    user_message = (
        f"Voici ma réponse pour la mission '{mission.get('title')}':\n\n"
        f"{req.student_response}\n\n"
        "Peux-tu me donner un feedback constructif ?"
    )

    try:
        feedback = await request_chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7
        )
        return {"feedback": feedback}
    except Exception as e:
        logger.error(f"Error calling Ella for Literacy evaluation: {e}")
        raise HTTPException(status_code=500, detail="Ella is temporarily unavailable.")
