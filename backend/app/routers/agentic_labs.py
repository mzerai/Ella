"""Agentic AI (Enterprise Workflows) Labs API endpoints."""

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
# Agentic AI Modules (Notebooks)
# ============================================

_AGENTIC_MODULE_FILES = {
    "00_course_positioning": "module_00_cells.json",
    "01_anatomy_of_enterprise_ai_agent": "module_01_cells.json",
    "02_design_agentic_workflow": "module_02_cells.json",
    "03_tool_calling_api_enterprise_integration": "module_03_cells.json",
    "04_rag_memory_context_management": "module_04_cells.json",
    "05_single_agent_multi_agent_architectures": "module_05_cells.json",
    "06_security_governance_compliance": "module_06_cells.json",
    "07_evaluation_observability_production_readiness": "module_07_cells.json",
    "08_deploy_enterprise_ai_agent_pilot": "module_08_cells.json",
}


def _get_agentic_modules_dir() -> str:
    """Resolve path to backend/data/agentic_ai/modules/ relative to this file."""
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "agentic_ai", "modules")
    )


def _get_agentic_labs_dir() -> str:
    """Resolve path to backend/data/agentic_ai/labs/ relative to this file."""
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "agentic_ai", "labs")
    )


@router.get("/modules")
async def list_agentic_modules():
    """List all available Agentic AI modules with metadata."""
    modules_dir = _get_agentic_modules_dir()
    modules = []

    for module_id, filename in _AGENTIC_MODULE_FILES.items():
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
            logger.warning("Failed to load Agentic module %s: %s", filename, e)

    return {"modules": modules}


@router.get("/modules/{module_id}")
async def get_agentic_module_cells(module_id: str):
    """Return the notebook cells for an Agentic AI module."""
    filename = _AGENTIC_MODULE_FILES.get(module_id)
    if not filename:
        raise HTTPException(
            status_code=404,
            detail=f"Module '{module_id}' not found. Available: {list(_AGENTIC_MODULE_FILES.keys())}",
        )

    filepath = os.path.join(_get_agentic_modules_dir(), filename)
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
# Agentic AI Labs (Practical Exercises)
# ============================================

_AGENTIC_LAB_FILES = {
    "00_diagnose_fake_agent_lab": "00_diagnose_fake_agent_lab.json",
    "01_decompose_enterprise_agent_lab": "01_decompose_enterprise_agent_lab.json",
    "01_anatomy_enterprise_agent_lab": "01_decompose_enterprise_agent_lab.json",  # Alias for typo
    "02_map_agentic_workflow_lab": "02_map_agentic_workflow_lab.json",
    "03_specify_agent_tools_lab": "03_specify_agent_tools_lab.json",
    "03_tool_specification_api_integration_lab": "03_specify_agent_tools_lab.json",  # Alias for typo
    "04_design_rag_memory_context_lab": "04_design_rag_memory_context_lab.json",
    "04_rag_memory_strategy_lab": "04_design_rag_memory_context_lab.json",  # Alias for typo
    "05_choose_agent_architecture_lab": "05_choose_agent_architecture_lab.json",
    "06_agentic_risk_review_lab": "06_agentic_risk_review_lab.json",
    "07_agent_evaluation_observability_plan_lab": "07_agent_evaluation_observability_plan_lab.json",
    "08_enterprise_agent_pilot_plan_lab": "08_enterprise_agent_pilot_plan_lab.json",
    "final_governed_enterprise_agent_design_lab": "final_governed_enterprise_agent_design_lab.json",
}


@router.get("/labs")
async def list_agentic_labs():
    """List all available Agentic AI labs."""
    labs_dir = _get_agentic_labs_dir()
    labs = []

    for lab_id, filename in _AGENTIC_LAB_FILES.items():
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
            logger.warning("Failed to load Agentic lab %s: %s", filename, e)

    return {"labs": labs}


@router.get("/labs/{lab_id}")
async def get_agentic_lab_detail(lab_id: str):
    """Get detailed info about a specific Agentic AI lab."""
    filename = _AGENTIC_LAB_FILES.get(lab_id)
    if not filename:
        raise HTTPException(
            status_code=404,
            detail=f"Lab '{lab_id}' not found. Available: {list(_AGENTIC_LAB_FILES.keys())}",
        )

    labs_dir = _get_agentic_labs_dir()
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
# Agentic AI Lab Evaluation (Written Response)
# ============================================


def _load_agentic_lab(lab_id: str) -> Optional[dict]:
    """Load an Agentic AI lab JSON file by lab_id."""
    filename = _AGENTIC_LAB_FILES.get(lab_id)
    if not filename:
        return None
    filepath = os.path.join(_get_agentic_labs_dir(), filename)
    if not os.path.exists(filepath):
        return None
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


class AgenticEvalRequest(BaseModel):
    lab_id: str
    mission_id: str
    student_response: str
    language: str = "fr"


class AgenticEvalResponse(BaseModel):
    feedback: str
    score_qualitative: str  # "excellent", "good", "needs_improvement"


@router.post("/evaluate", response_model=AgenticEvalResponse)
async def evaluate_response(request: AgenticEvalRequest):
    """Evaluate a learner's written response using ELLA."""
    lab = _load_agentic_lab(request.lab_id)
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

    eval_prompt = f"""[AGENTIC_LAB_EVALUATION]

You are evaluating a professional's written response in the Agentic AI for Enterprise Workflows course.

MISSION INSTRUCTIONS (what the learner was asked to do):
{mission_instructions}

LEARNER'S RESPONSE:
{request.student_response}

Evaluate this response. Be direct and constructive — this is a professional, not a student.

Respond in {"French" if lang == "fr" else "English"} with this exact JSON structure:
{{
    "feedback": "Your detailed, constructive feedback (3-5 sentences). Start with what is strong, then what is missing or could be improved. End with one specific, actionable recommendation. NEVER include the correct answer directly — guide with hints and questions.",
    "score_qualitative": "excellent|good|needs_improvement"
}}

Scoring guide:
- "excellent": The response is comprehensive, specific, demonstrates genuine understanding of agentic systems, and includes concrete actionable elements.
- "good": The response covers the main points but lacks specificity, concrete examples, or actionable detail.
- "needs_improvement": The response is generic, superficial, or misses key elements of the mission.

Respond ONLY with the JSON, no other text."""

    messages = [
        {"role": "system", "content": "You are ELLA, an enterprise AI coach embedded in a professional training platform. Evaluate the learner's written response. Respond ONLY with valid JSON."},
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
        return AgenticEvalResponse(
            feedback=parsed.get("feedback", raw_response),
            score_qualitative=parsed.get("score_qualitative", "good")
        )
    except (json_mod.JSONDecodeError, KeyError):
        return AgenticEvalResponse(
            feedback=raw_response,
            score_qualitative="good"
        )
