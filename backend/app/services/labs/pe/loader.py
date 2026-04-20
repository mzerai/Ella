"""Load lab definitions and rubrics from JSON files."""

import os
import json
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

_lab_cache: Dict[str, Any] = {}
_rubric_cache: Dict[str, Any] = {}


def _get_data_dir() -> str:
    """Resolve path to backend/data/pe/."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Going up from backend/app/services/labs/pe/ to backend/
    backend_root = os.path.abspath(os.path.join(current_dir, '..', '..', '..', '..'))
    return os.path.join(backend_root, 'data', 'pe')


def load_lab(lab_id: str) -> Optional[Dict[str, Any]]:
    """Load a lab definition from JSON."""
    if lab_id in _lab_cache:
        return _lab_cache[lab_id]

    data_dir = _get_data_dir()
    lab_path = os.path.join(data_dir, 'labs', f'{lab_id}.json')

    if not os.path.exists(lab_path):
        logger.warning("Lab file not found: %s", lab_path)
        return None

    try:
        with open(lab_path, 'r', encoding='utf-8') as f:
            lab = json.load(f)
        _lab_cache[lab_id] = lab
        logger.info("Loaded lab: %s (%d missions)", lab_id, len(lab.get('missions', [])))
        return lab
    except Exception as e:
        logger.error("Failed to load lab %s: %s", lab_id, e)
        return None


def load_rubric(rubric_id: str) -> Optional[Dict[str, Any]]:
    """Load a rubric definition, merging base + lab-specific criteria."""
    if rubric_id in _rubric_cache:
        return _rubric_cache[rubric_id]

    data_dir = _get_data_dir()

    # Always load base rubric first
    base_path = os.path.join(data_dir, 'rubrics', 'base_rubric.json')
    if not os.path.exists(base_path):
        logger.error("Base rubric not found: %s", base_path)
        return None

    try:
        with open(base_path, 'r', encoding='utf-8') as f:
            base = json.load(f)

        if rubric_id == "base":
            _rubric_cache[rubric_id] = base
            return base

        # Load lab-specific rubric if it exists
        specific_path = os.path.join(data_dir, 'rubrics', f'{rubric_id}_rubric.json')
        if os.path.exists(specific_path):
            with open(specific_path, 'r', encoding='utf-8') as f:
                specific = json.load(f)

            # Merge: base criteria + extra criteria
            merged = {
                "rubric_id": rubric_id,
                "criteria": base["criteria"] + specific.get("extra_criteria", []),
            }
            merged["max_score"] = sum(c["max"] for c in merged["criteria"])
        else:
            merged = base

        _rubric_cache[rubric_id] = merged
        logger.info("Loaded rubric: %s (%d criteria, max=%d)",
                     rubric_id, len(merged["criteria"]), merged.get("max_score", 10))
        return merged
    except Exception as e:
        logger.error("Failed to load rubric %s: %s", rubric_id, e)
        return None


def get_mission(lab_id: str, mission_id: str) -> Optional[Dict[str, Any]]:
    """Get a specific mission from a lab."""
    lab = load_lab(lab_id)
    if lab is None:
        return None

    for mission in lab.get("missions", []):
        if mission["mission_id"] == mission_id:
            return mission

    logger.warning("Mission %s not found in lab %s", mission_id, lab_id)
    return None
