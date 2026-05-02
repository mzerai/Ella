"""AI for Finance & Banking Labs API endpoints."""

import json
import json as json_mod
import logging
import os
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ella.client import request_chat_completion

logger = logging.getLogger(__name__)

router = APIRouter()

# ============================================
# Finance Modules (Notebooks)
# ============================================

_FINANCE_MODULE_FILES = {
    "00_welcome_intro": "module_00_welcome_intro_cells.json",
    "01_credit_scoring_intro": "module_01_credit_scoring_intro_cells.json",
    "02_credit_scoring_data": "module_02_credit_scoring_data_cells.json",
    "03_credit_scoring_models": "module_03_credit_scoring_models_cells.json",
    "04_credit_scoring_metrics_thresholds": "module_04_credit_scoring_metrics_thresholds_cells.json",
}


def _get_finance_modules_dir() -> str:
    """Resolve path to backend/data/finance/modules/ relative to this file."""
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "finance", "modules")
    )


def _get_finance_labs_dir() -> str:
    """Resolve path to backend/data/finance/labs/ relative to this file."""
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "finance", "labs")
    )


@router.get("/modules")
async def list_finance_modules():
    """List all available Finance modules with metadata."""
    modules_dir = _get_finance_modules_dir()
    modules = []

    for module_id, filename in _FINANCE_MODULE_FILES.items():
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
            logger.warning("Failed to load Finance module %s: %s", filename, e)

    return {"modules": modules}


@router.get("/modules/{module_id}")
async def get_finance_module_cells(module_id: str):
    """Return the notebook cells for a Finance module."""
    filename = _FINANCE_MODULE_FILES.get(module_id)
    if not filename:
        raise HTTPException(
            status_code=404,
            detail=f"Module '{module_id}' not found. Available: {list(_FINANCE_MODULE_FILES.keys())}",
        )

    filepath = os.path.join(_get_finance_modules_dir(), filename)
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
# Finance Labs (Practical Exercises)
# ============================================

_FINANCE_LAB_FILES = {
    "00_course_orientation_lab": "lab_00_course_orientation_lab.json",
    "01_credit_scoring_intro_lab": "lab_01_credit_scoring_intro_lab.json",
    "02_credit_scoring_data_lab": "lab_02_credit_scoring_data_lab.json",
    "03_credit_scoring_models_lab": "lab_03_credit_scoring_models_lab.json",
    "04_credit_scoring_metrics_thresholds_lab": "lab_04_credit_scoring_metrics_thresholds_lab.json",
}


@router.get("/labs")
async def list_finance_labs():
    """List all available Finance labs."""
    labs_dir = _get_finance_labs_dir()
    labs = []

    for lab_id, filename in _FINANCE_LAB_FILES.items():
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
            logger.warning("Failed to load Finance lab %s: %s", filename, e)

    return {"labs": labs}


@router.get("/labs/{lab_id}")
async def get_finance_lab_detail(lab_id: str):
    """Get detailed info about a specific Finance lab."""
    filename = _FINANCE_LAB_FILES.get(lab_id)
    if not filename:
        raise HTTPException(
            status_code=404,
            detail=f"Lab '{lab_id}' not found. Available: {list(_FINANCE_LAB_FILES.keys())}",
        )

    labs_dir = _get_finance_labs_dir()
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
# Finance Lab Evaluation (Written Response)
# ============================================


def _load_finance_lab(lab_id: str) -> Optional[dict]:
    """Load a Finance lab JSON file by lab_id."""
    filename = _FINANCE_LAB_FILES.get(lab_id)
    if not filename:
        return None
    filepath = os.path.join(_get_finance_labs_dir(), filename)
    if not os.path.exists(filepath):
        return None
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


class FinanceEvalRequest(BaseModel):
    lab_id: str
    mission_id: str
    student_response: str
    language: str = "fr"


class FinanceEvalResponse(BaseModel):
    feedback: str
    score_qualitative: str  # "excellent", "good", "needs_improvement"


@router.post("/evaluate", response_model=FinanceEvalResponse)
async def evaluate_finance_response(request: FinanceEvalRequest):
    """Evaluate a learner's written response using ELLA."""
    lab = _load_finance_lab(request.lab_id)
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

    eval_prompt = f"""[FINANCE_LAB_EVALUATION]

You are evaluating a financial professional's written response in the "AI for Finance & Banking" course.

MISSION INSTRUCTIONS (what the learner was asked to do):
{mission_instructions}

LEARNER'S RESPONSE:
{request.student_response}

Evaluate this response. Be direct and constructive — this is a finance professional, not a student.

Respond in {"French" if lang == "fr" else "English"} with this exact JSON structure:
{{
    "feedback": "Your detailed, constructive feedback (3-5 sentences). Start with what is strong, then what is missing. End with one specific, actionable recommendation. NEVER give the correct answer directly — guide with hints and finance-specific questions.",
    "score_qualitative": "excellent|good|needs_improvement"
}}

Scoring guide:
- "excellent": Comprehensive, specific, demonstrates genuine understanding of financial AI risks, governance, or compliance. Includes concrete actionable elements.
- "good": Covers main points but lacks specificity, concrete finance examples, or actionable detail.
- "needs_improvement": Generic, superficial, or misses key elements (risk, compliance, explainability, human oversight).

Respond ONLY with the JSON, no other text."""

    messages = [
        {"role": "system", "content": "You are ELLA, an AI expert coach in financial services and banking embedded in a professional training platform. Evaluate the learner's written response with the rigor expected in the finance industry. Respond ONLY with valid JSON."},
        {"role": "user", "content": eval_prompt}
    ]

    raw_response = request_chat_completion(messages, force_json=True)

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
        return FinanceEvalResponse(
            feedback=parsed.get("feedback", raw_response),
            score_qualitative=parsed.get("score_qualitative", "good")
        )
    except (json_mod.JSONDecodeError, KeyError):
        return FinanceEvalResponse(
            feedback=raw_response,
            score_qualitative="good"
        )
