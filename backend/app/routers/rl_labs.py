"""Reinforcement Learning Labs API endpoints."""

import json
import logging
import os
from fastapi import APIRouter, HTTPException
from app.services.labs.rl.models import RLLabRunRequest, RLLabRunResponse, RLLabTrainRequest, RLLabTrainResponse
from app.services.labs.rl.executor import run_rl_lab, run_rl_training

logger = logging.getLogger(__name__)

router = APIRouter()

# ============================================
# RL Modules (Notebooks)
# ============================================

# Map module_id to filename
_RL_MODULE_FILES = {
    "rl_00_culture": "module_00_cells.json",
    "rl_01_bellman": "module_01_cells.json",
    "rl_02_planning": "module_02_cells.json",
    "rl_03_td_mc": "module_03_cells.json",
    "rl_04_control": "module_04_cells.json",
    "rl_05_deep_rl": "module_05_cells.json",
}


def _get_rl_modules_dir() -> str:
    """Resolve path to backend/data/rl/modules/ relative to this file."""
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "rl", "modules")
    )


@router.get("/modules")
async def list_rl_modules():
    """List all available RL modules with metadata."""
    modules_dir = _get_rl_modules_dir()
    modules = []

    for module_id, filename in _RL_MODULE_FILES.items():
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
            logger.warning("Failed to load RL module %s: %s", filename, e)

    return {"modules": modules}


@router.get("/modules/{module_id}")
async def get_rl_module_cells(module_id: str):
    """Return the notebook cells for an RL module."""
    filename = _RL_MODULE_FILES.get(module_id)
    if not filename:
        raise HTTPException(
            status_code=404,
            detail=f"Module '{module_id}' not found. Available: {list(_RL_MODULE_FILES.keys())}",
        )

    filepath = os.path.join(_get_rl_modules_dir(), filename)
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
# RL Lab Execution
# ============================================

@router.post("/run", response_model=RLLabRunResponse)
async def run_rl_algorithm(request: RLLabRunRequest):
    """Run an RL planning algorithm on FrozenLake and return full results."""
    try:
        return run_rl_lab(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("RL lab execution error: %s", e)
        raise HTTPException(status_code=500, detail=f"Lab execution failed: {str(e)}")


@router.post("/train", response_model=RLLabTrainResponse)
async def train_rl_agent(request: RLLabTrainRequest):
    """Train a model-free RL agent on FrozenLake and return results."""
    try:
        return run_rl_training(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("RL training error: %s", e)
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")
