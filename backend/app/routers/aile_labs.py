"""AI Leadership (AILE) Labs API endpoints."""

import json
import json as json_mod
import logging
import os
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ella.orchestrator import generate_response
from app.services.ella.models import ConversationRequest, PageContextSchema

logger = logging.getLogger(__name__)

router = APIRouter()

# ============================================
# AILE Modules (Notebooks)
# ============================================

_AILE_MODULE_FILES = {
    "aile_00_wakeup": "module_00_cells.json",
    "aile_01_demystify": "module_01_cells.json",
    "aile_02_strategy": "module_02_cells.json",
    "aile_03_governance": "module_03_cells.json",
    "aile_04_roi": "module_04_cells.json",
    "aile_05_roadmap": "module_05_cells.json",
}


def _get_aile_modules_dir() -> str:
    """Resolve path to backend/data/aile/modules/ relative to this file."""
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "aile", "modules")
    )


def _get_aile_labs_dir() -> str:
    """Resolve path to backend/data/aile/labs/ relative to this file."""
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "aile", "labs")
    )


@router.get("/modules")
async def list_aile_modules():
    """List all available AILE modules with metadata."""
    modules_dir = _get_aile_modules_dir()
    modules = []

    for module_id, filename in _AILE_MODULE_FILES.items():
        filepath = os.path.join(modules_dir, filename)
        if not os.path.exists(filepath):
            continue
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            modules.append({
                "module_id": data.get("module_id", module_id),
                "title": data.get("title", {}),
                "description": data.get("description", {}),
                "cell_count": len(data.get("cells", [])),
            })
        except Exception as e:
            logger.warning("Failed to load AILE module %s: %s", filename, e)

    return {"modules": modules}


@router.get("/modules/{module_id}")
async def get_aile_module_cells(module_id: str):
    """Return the notebook cells for an AILE module."""
    filename = _AILE_MODULE_FILES.get(module_id)
    if not filename:
        raise HTTPException(
            status_code=404,
            detail=f"Module '{module_id}' not found. Available: {list(_AILE_MODULE_FILES.keys())}",
        )

    filepath = os.path.join(_get_aile_modules_dir(), filename)
    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=404,
            detail=f"Module file '{filename}' not found on disk.",
        )

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.error("Invalid JSON in %s: %s", filename, e)
        raise HTTPException(status_code=500, detail="Module file contains invalid JSON.")
    except Exception as e:
        logger.error("Error reading module file %s: %s", filename, e)
        raise HTTPException(status_code=500, detail="Failed to load module content.")


# ============================================
# AILE Labs (Case Studies)
# ============================================

_AILE_LAB_FILES = {
    "01_self_assessment": "lab_01_self_assessment.json",
    "02_genai_demo": "lab_02_genai_demo.json",
    "03_competitive_analysis": "lab_03_competitive_analysis.json",
    "04_risk_audit": "lab_04_risk_audit.json",
    "05_business_case": "lab_05_business_case.json",
    "06_maturity_diagnostic": "lab_06_maturity_diagnostic.json",
}


@router.get("/labs")
async def list_aile_labs():
    """List all available AILE labs (case studies)."""
    labs_dir = _get_aile_labs_dir()
    labs = []

    for lab_id, filename in _AILE_LAB_FILES.items():
        filepath = os.path.join(labs_dir, filename)
        if not os.path.exists(filepath):
            continue
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            labs.append({
                "lab_id": data.get("lab_id", lab_id),
                "title": data.get("title", {}),
                "description": data.get("description", {}),
                "mission_count": len(data.get("missions", [])),
            })
        except Exception as e:
            logger.warning("Failed to load AILE lab %s: %s", filename, e)

    return {"labs": labs}


@router.get("/labs/{lab_id}")
async def get_aile_lab_detail(lab_id: str):
    """Get detailed info about a specific AILE lab."""
    filename = _AILE_LAB_FILES.get(lab_id)
    if not filename:
        raise HTTPException(
            status_code=404,
            detail=f"Lab '{lab_id}' not found. Available: {list(_AILE_LAB_FILES.keys())}",
        )

    labs_dir = _get_aile_labs_dir()
    filepath = os.path.join(labs_dir, filename)
    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=404,
            detail=f"Lab file '{filename}' not found on disk.",
        )

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.error("Invalid JSON in %s: %s", filename, e)
        raise HTTPException(status_code=500, detail="Lab file contains invalid JSON.")
    except Exception as e:
        logger.error("Error reading lab file %s: %s", filename, e)
        raise HTTPException(status_code=500, detail="Failed to load lab content.")


# ============================================
# AILE Lab Evaluation (Written / Rédactionnel)
# ============================================


def _load_lab(lab_id: str) -> Optional[dict]:
    """Load a lab JSON file by lab_id."""
    filename = _AILE_LAB_FILES.get(lab_id)
    if not filename:
        return None
    filepath = os.path.join(_get_aile_labs_dir(), filename)
    if not os.path.exists(filepath):
        return None
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


class AILEEvalRequest(BaseModel):
    lab_id: str
    mission_id: str
    student_response: str
    language: str = "fr"


class AILEEvalResponse(BaseModel):
    feedback: str
    score_qualitative: str  # "excellent", "good", "needs_improvement"


@router.post("/evaluate", response_model=AILEEvalResponse)
async def evaluate_response(request: AILEEvalRequest):
    """Evaluate a student's written response using ELLA."""
    lab = _load_lab(request.lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail=f"Lab '{request.lab_id}' not found.")

    mission = None
    for m in lab.get("missions", []):
        if m["mission_id"] == request.mission_id:
            mission = m
            break
    if not mission:
        raise HTTPException(status_code=404, detail=f"Mission '{request.mission_id}' not found.")

    lang = request.language
    mission_instructions = mission["instructions"].get(lang, mission["instructions"].get("fr", ""))
    expected = mission.get("expected_behavior", "")

    eval_prompt = f"""[AILE_LAB_EVALUATION]

You are evaluating an executive's written response in the AILE (Executive AI Leadership) course.

MISSION INSTRUCTIONS (what the executive was asked to do):
{mission_instructions}

EXPECTED BEHAVIOR:
{expected}

EXECUTIVE'S RESPONSE:
{request.student_response}

Evaluate this response. Be direct and professional — this is a senior executive, not a student.

Respond in {"French" if lang == "fr" else "English"} with this exact JSON structure:
{{
    "feedback": "Your detailed, constructive feedback (3-5 paragraphs). Start with what's strong, then what's missing or could be improved. End with one specific, actionable recommendation.",
    "score_qualitative": "excellent|good|needs_improvement"
}}

Scoring guide:
- "excellent": The response is comprehensive, specific to their sector, demonstrates genuine strategic thinking, and includes concrete actionable elements.
- "good": The response covers the main points but lacks specificity, concrete examples, or actionable detail.
- "needs_improvement": The response is generic, superficial, or misses key elements of the mission.

Respond ONLY with the JSON, no other text."""

    conv_request = ConversationRequest(
        query=eval_prompt,
        history=[],
        context=PageContextSchema(
            page_id=request.lab_id,
            lab_name=request.lab_id,
            extra={"course_id": "aile", "lab_evaluation": True}
        )
    )

    raw_response = generate_response(conv_request)

    # Try to parse JSON from the response
    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()

        parsed = json_mod.loads(cleaned)
        return AILEEvalResponse(
            feedback=parsed.get("feedback", raw_response),
            score_qualitative=parsed.get("score_qualitative", "good")
        )
    except (json_mod.JSONDecodeError, KeyError):
        return AILEEvalResponse(
            feedback=raw_response,
            score_qualitative="good"
        )
