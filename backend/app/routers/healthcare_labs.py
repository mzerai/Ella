"""AI for Healthcare Labs API endpoints."""

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
# Healthcare Sequences (Notebooks)
# ============================================

_HEALTHCARE_SEQUENCE_FILES = {
    "00_healthcare_intro": "module_00_cells.json",
    "01_medical_cv": "module_01_cells.json",
    "02_clinical_nlp": "module_02_cells.json",
    "03_ethics_privacy": "module_03_cells.json",
    "04_predictive_risk": "module_04_cells.json",
    "05_regulatory_compliance": "module_05_cells.json",
}

def _get_healthcare_sequences_dir() -> str:
    """Resolve path to backend/data/healthcare/modules/ relative to this file."""
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "healthcare", "modules")
    )

def _get_healthcare_labs_dir() -> str:
    """Resolve path to backend/data/healthcare/labs/ relative to this file."""
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "healthcare", "labs")
    )

@router.get("/sequences")
async def list_healthcare_sequences():
    """List all available Healthcare sequences with metadata."""
    sequences_dir = _get_healthcare_sequences_dir()
    sequences = []

    for sequence_id, filename in _HEALTHCARE_SEQUENCE_FILES.items():
        filepath = os.path.join(sequences_dir, filename)
        if not os.path.exists(filepath):
            continue
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            sequences.append({
                "sequence_id": sequence_id,
                "title": data.get("title", {}),
                "description": data.get("description", {}),
                "cell_count": len(data.get("cells", [])),
            })
        except Exception as e:
            logger.warning("Failed to load Healthcare sequence %s: %s", filename, e)

    return {"sequences": sequences}

@router.get("/sequences/{sequence_id}")
async def get_healthcare_sequence_cells(sequence_id: str):
    """Return the notebook cells for a Healthcare sequence."""
    filename = _HEALTHCARE_SEQUENCE_FILES.get(sequence_id)
    if not filename:
        raise HTTPException(
            status_code=404,
            detail=f"Sequence '{sequence_id}' not found. Available: {list(_HEALTHCARE_SEQUENCE_FILES.keys())}",
        )

    filepath = os.path.join(_get_healthcare_sequences_dir(), filename)
    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=404,
            detail=f"Sequence file '{filename}' not found on disk.",
        )

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.error("Invalid JSON in %s: %s", filename, e)
        raise HTTPException(status_code=500, detail="Sequence file contains invalid JSON.")
    except Exception as e:
        logger.error("Error reading sequence file %s: %s", filename, e)
        raise HTTPException(status_code=500, detail="Failed to load sequence content.")

# ============================================
# Healthcare Workshops (Practical Exercises)
# ============================================

_HEALTHCARE_WORKSHOP_FILES = {
    "00_healthcare_ai_use_case_framing_lab": "lab_00_healthcare_ai_use_case_framing_lab.json",
    "01_medical_cv_diagnostic_support_lab": "lab_01_medical_cv_diagnostic_support_lab.json",
    "02_clinical_nlp_information_extraction_lab": "lab_02_clinical_nlp_information_extraction_lab.json",
    "03_healthcare_ai_ethics_anonymization_lab": "lab_03_healthcare_ai_ethics_anonymization_lab.json",
    "04_predictive_risk_decision_support_lab": "lab_04_predictive_risk_decision_support_lab.json",
    "05_healthcare_ai_regulatory_compliance_tunisia_lab": "lab_05_healthcare_ai_regulatory_compliance_tunisia_lab.json",
    "final": "lab_final_healthcare_ai_governed_solution_lab.json",
}

@router.get("/workshops")
async def list_healthcare_workshops():
    """List all available Healthcare workshops."""
    labs_dir = _get_healthcare_labs_dir()
    workshops = []

    for workshop_id, filename in _HEALTHCARE_WORKSHOP_FILES.items():
        filepath = os.path.join(labs_dir, filename)
        if not os.path.exists(filepath):
            continue
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            workshops.append({
                "workshop_id": workshop_id,
                "title": data.get("title", {}),
                "description": data.get("description", {}),
                "mission_count": len(data.get("missions", [])),
            })
        except Exception as e:
            logger.warning("Failed to load Healthcare workshop %s: %s", filename, e)

    return {"workshops": workshops}

@router.get("/workshops/{workshop_id}")
async def get_healthcare_workshop_detail(workshop_id: str):
    """Get detailed info about a specific Healthcare workshop."""
    filename = _HEALTHCARE_WORKSHOP_FILES.get(workshop_id)
    if not filename:
        raise HTTPException(
            status_code=404,
            detail=f"Workshop '{workshop_id}' not found. Available: {list(_HEALTHCARE_WORKSHOP_FILES.keys())}",
        )

    labs_dir = _get_healthcare_labs_dir()
    filepath = os.path.join(labs_dir, filename)
    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=404,
            detail=f"Workshop file '{filename}' not found on disk.",
        )

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.error("Invalid JSON in %s: %s", filename, e)
        raise HTTPException(status_code=500, detail="Workshop file contains invalid JSON.")
    except Exception as e:
        logger.error("Error reading workshop file %s: %s", filename, e)
        raise HTTPException(status_code=500, detail="Failed to load workshop content.")

# ============================================
# Healthcare Workshop Evaluation
# ============================================

def _load_healthcare_workshop(workshop_id: str) -> Optional[dict]:
    """Load a Healthcare workshop JSON file by workshop_id."""
    filename = _HEALTHCARE_WORKSHOP_FILES.get(workshop_id)
    if not filename:
        return None
    filepath = os.path.join(_get_healthcare_labs_dir(), filename)
    if not os.path.exists(filepath):
        return None
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None

class HealthcareEvalRequest(BaseModel):
    workshop_id: str
    mission_id: str
    student_response: str
    language: str = "fr"

class HealthcareEvalResponse(BaseModel):
    feedback: str
    score_qualitative: str  # "excellent", "good", "needs_improvement"

@router.post("/evaluate", response_model=HealthcareEvalResponse)
async def evaluate_healthcare_response(request: HealthcareEvalRequest):
    """Evaluate a learner's written response using ELLA."""
    workshop = _load_healthcare_workshop(request.workshop_id)
    if not workshop:
        raise HTTPException(status_code=404, detail=f"Workshop '{request.workshop_id}' not found.")

    mission = None
    for m in workshop.get("missions", []):
        if m["mission_id"] == request.mission_id:
            mission = m
            break
    if not mission:
        raise HTTPException(status_code=404, detail=f"Mission '{request.mission_id}' not found.")

    lang = request.language
    mission_instructions = mission["instructions"].get(lang, mission["instructions"].get("fr", ""))

    eval_prompt = f"""[HEALTHCARE_WORKSHOP_EVALUATION]

You are evaluating a healthcare professional's written response in the "AI for Healthcare" workshop.

MISSION INSTRUCTIONS (what the learner was asked to do):
{mission_instructions}

LEARNER'S RESPONSE:
{request.student_response}

Evaluate this response with medical and ethical rigor. Be direct and constructive.

Respond in {"French" if lang == "fr" else "English"} with this exact JSON structure:
{{
    "feedback": "Your detailed, constructive feedback (3-5 sentences). Start with clinical/technical strengths, then gaps (ethics, safety, compliance). End with one specific recommendation. NEVER give the correct answer directly.",
    "score_qualitative": "excellent|good|needs_improvement"
}}

Respond ONLY with the JSON, no other text."""

    messages = [
        {"role": "system", "content": "You are ELLA, an AI expert coach in healthcare and medicine. Respond ONLY with valid JSON."},
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
        return HealthcareEvalResponse(
            feedback=parsed.get("feedback", raw_response),
            score_qualitative=parsed.get("score_qualitative", "good")
        )
    except (json_mod.JSONDecodeError, KeyError):
        return HealthcareEvalResponse(
            feedback=raw_response,
            score_qualitative="good"
        )
