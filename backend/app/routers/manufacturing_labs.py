"""AI for Manufacturing & Industry 4.0 Labs API endpoints."""

import json
import logging
import os
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ella.client import request_chat_completion

logger = logging.getLogger(__name__)

router = APIRouter()

# ============================================
# Manufacturing Modules (Notebooks)
# ============================================

_MANUFACTURING_MODULE_FILES = {
    "00_course_positioning": "module_00_course_positioning_cells.json",
    "01_industrial_data_iot_it_ot_architecture": "module_01_industrial_data_iot_it_ot_architecture_cells.json",
    "02_predictive_maintenance_machine_learning": "module_02_predictive_maintenance_machine_learning_cells.json",
    "03_computer_vision_quality_control": "module_03_computer_vision_quality_control_cells.json",
    "04_ai_production_flow_supply_chain_optimization": "module_04_ai_production_flow_supply_chain_optimization_cells.json",
    "05_digital_twins_simulation_industrial_scenarios": "module_05_digital_twins_simulation_industrial_scenarios_cells.json",
    "06_deployment_ot_cybersecurity_industrial_ai_roadmap": "module_06_deployment_ot_cybersecurity_industrial_ai_roadmap_cells.json",
}


def _get_manufacturing_modules_dir() -> str:
    """Resolve path to backend/data/industry_4_0/modules/ relative to this file."""
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "industry_4_0", "modules")
    )


def _get_manufacturing_labs_dir() -> str:
    """Resolve path to backend/data/industry_4_0/labs/ relative to this file."""
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "industry_4_0", "labs")
    )


@router.get("/modules")
async def list_manufacturing_modules():
    """List all available Manufacturing modules with metadata."""
    modules_dir = _get_manufacturing_modules_dir()
    modules = []

    for module_id, filename in _MANUFACTURING_MODULE_FILES.items():
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
            logger.warning("Failed to load Manufacturing module %s: %s", filename, e)

    return {"modules": modules}


@router.get("/modules/{module_id}")
async def get_manufacturing_module_cells(module_id: str):
    """Return the notebook cells for a Manufacturing module."""
    filename = _MANUFACTURING_MODULE_FILES.get(module_id)
    if not filename:
        raise HTTPException(
            status_code=404,
            detail=f"Module '{module_id}' not found. Available: {list(_MANUFACTURING_MODULE_FILES.keys())}",
        )

    filepath = os.path.join(_get_manufacturing_modules_dir(), filename)
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
# Manufacturing Labs (Practical Exercises)
# ============================================

_MANUFACTURING_LAB_FILES = {
    "00_industrial_ai_framing_lab": "lab_00_industrial_ai_framing_lab.json",
    "01_industrial_data_architecture_lab": "lab_01_industrial_data_architecture_lab.json",
    "02_predictive_maintenance_strategy_lab": "lab_02_predictive_maintenance_strategy_lab.json",
    "03_computer_vision_quality_control_lab": "lab_03_computer_vision_quality_control_lab.json",
    "04_flow_supply_chain_optimization_lab": "lab_04_flow_supply_chain_optimization_lab.json",
    "05_digital_twin_scenario_lab": "lab_05_digital_twin_scenario_lab.json",
    "06_final_industrial_ai_roadmap_lab": "lab_06_final_industrial_ai_roadmap_lab.json",
}


@router.get("/labs")
async def list_manufacturing_labs():
    """List all available Manufacturing labs."""
    labs_dir = _get_manufacturing_labs_dir()
    labs = []

    for lab_id, filename in _MANUFACTURING_LAB_FILES.items():
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
            logger.warning("Failed to load Manufacturing lab %s: %s", filename, e)

    return {"labs": labs}


@router.get("/labs/{lab_id}")
async def get_manufacturing_lab_detail(lab_id: str):
    """Get detailed info about a specific Manufacturing lab."""
    filename = _MANUFACTURING_LAB_FILES.get(lab_id)
    if not filename:
        raise HTTPException(
            status_code=404,
            detail=f"Lab '{lab_id}' not found. Available: {list(_MANUFACTURING_LAB_FILES.keys())}",
        )

    labs_dir = _get_manufacturing_labs_dir()
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
# Manufacturing Lab Evaluation (Written Response)
# ============================================


def _load_manufacturing_lab(lab_id: str) -> Optional[dict]:
    """Load a Manufacturing lab JSON file by lab_id."""
    filename = _MANUFACTURING_LAB_FILES.get(lab_id)
    if not filename:
        return None
    filepath = os.path.join(_get_manufacturing_labs_dir(), filename)
    if not os.path.exists(filepath):
        return None
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


class ManufacturingEvalRequest(BaseModel):
    lab_id: str
    mission_id: str
    student_response: str
    language: str = "fr"


class ManufacturingEvalResponse(BaseModel):
    feedback: str
    score_qualitative: str  # "excellent", "good", "needs_improvement"


@router.post("/evaluate", response_model=ManufacturingEvalResponse)
async def evaluate_manufacturing_response(request: ManufacturingEvalRequest):
    """Evaluate a learner's written response using ELLA."""
    lab = _load_manufacturing_lab(request.lab_id)
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

    eval_prompt = f"""[MANUFACTURING_LAB_EVALUATION]

You are evaluating an industrial manager or engineer's written response in the "AI for Manufacturing & Industry 4.0" course.

MISSION INSTRUCTIONS (what the learner was asked to do):
{mission_instructions}

LEARNER'S RESPONSE:
{request.student_response}

Evaluate this response. Be direct, technical, and constructive — this is an industrial professional.
Focus on:
- Technical feasibility (OT constraints, IT/OT integration).
- Industrial impact (KPIs: OEE/TRS, Quality, Maintenance costs).
- Safety and Cybersecurity (ISA-95, IEC 62443).
- Operational realism (field adoption, change management).

Respond in {"French" if lang == "fr" else "English"} with this exact JSON structure:
{{
    "feedback": "Your detailed, constructive feedback (3-5 sentences). Start with what is strong, then what is missing. End with one specific, actionable recommendation. NEVER give the correct answer directly — guide with hints and industrial-specific questions.",
    "score_qualitative": "excellent|good|needs_improvement"
}}

Scoring guide:
- "excellent": Comprehensive, specific, demonstrates genuine understanding of industrial constraints (OT, IT/OT, Safety). Includes concrete actionable elements.
- "good": Covers main points but lacks technical specificity or operational detail.
- "needs_improvement": Generic, superficial, or misses key industrial elements (OEE impact, cybersecurity, field constraints).

Respond ONLY with the JSON, no other text."""

    messages = [
        {"role": "system", "content": "You are ELLA, an AI expert coach in Industry 4.0 and Manufacturing embedded in a professional training platform. Evaluate the learner's response with industrial rigor. Respond ONLY with valid JSON."},
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

        parsed = json.loads(cleaned)
        return ManufacturingEvalResponse(
            feedback=parsed.get("feedback", raw_response),
            score_qualitative=parsed.get("score_qualitative", "good")
        )
    except (json.JSONDecodeError, KeyError):
        return ManufacturingEvalResponse(
            feedback=raw_response,
            score_qualitative="good"
        )
