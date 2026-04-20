"""Execute student prompts via TokenFactory and evaluate with ELLA."""

import os
import json
import time
import logging
from typing import Dict, Any, Optional

from app.config import settings
from app.services.ella.client import request_chat_completion, is_configured
from app.services.labs.pe.loader import load_lab, load_rubric, get_mission
from app.services.labs.pe.models import (
    PELabRunRequest,
    PELabRunResponse,
    PEEvaluation,
    CriterionScore,
)

logger = logging.getLogger(__name__)


def _load_evaluator_prompt() -> str:
    """Load the ELLA PE evaluator system prompt from file."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # backend/app/services/labs/pe/ -> backend/
    backend_root = os.path.abspath(os.path.join(current_dir, '..', '..', '..', '..'))
    prompt_path = os.path.join(backend_root, 'data', 'pe', 'prompts', 'evaluator_system_prompt.txt')

    try:
        with open(prompt_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        logger.error("Failed to load evaluator prompt: %s", e)
        return ""


def _execute_student_prompt(
    student_prompt: str,
    input_text: str,
    language: str,
    system_prompt: Optional[str] = None,
) -> str:
    """Execute the student's prompt against TokenFactory.

    For most labs: student_prompt is the user message, input_text is appended.
    For Lab 04 (system prompts): system_prompt is the student's system prompt,
    and input_text is the user message.
    """
    if system_prompt:
        # Lab 04: student wrote a system prompt
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": input_text},
        ]
    else:
        # Standard labs: student prompt + input text as user message
        full_user_message = f"{student_prompt}\n\n{input_text}"
        messages = [
            {"role": "user", "content": full_user_message},
        ]

    # For PE labs, we usually want text, but TokenFactory might return JSON if configured globally.
    # However, the user request says TokenFactory supports JSON response format.
    # We use request_chat_completion from app.services.ella.client.
    raw_response = request_chat_completion(messages)

    # Try to parse and extract text if it's JSON-formatted by the tutor engine's client logic
    try:
        data = json.loads(raw_response)
        if isinstance(data, dict):
            if "answer" in data:
                return data["answer"]
            return json.dumps(data, indent=2, ensure_ascii=False)
        return raw_response
    except (json.JSONDecodeError, ValueError):
        return raw_response


def _evaluate_with_ella(
    mission: Dict[str, Any],
    student_prompt: str,
    llm_output: str,
    rubric: Dict[str, Any],
    language: str,
) -> PEEvaluation:
    """Send the student's work to ELLA for evaluation."""
    evaluator_system = _load_evaluator_prompt()
    if not evaluator_system:
        # Fallback if prompt file is missing
        return PEEvaluation(
            criteria_scores={},
            total_score=0,
            max_score=10,
            improvements=["Evaluator prompt missing."],
        )

    lang_key = language if language in ("fr", "en") else "fr"
    mission_text = mission.get("instructions", {}).get(lang_key, "")
    expected = mission.get("expected_behavior", "")

    # Format rubric criteria for the LLM
    rubric_text = "## Evaluation Rubric\n"
    for criterion in rubric.get("criteria", []):
        title = criterion.get("title", {}).get("en", criterion.get("id", ""))
        rubric_text += f"\n### {criterion['id']} — {title} (max: {criterion['max']})\n"
        for level, desc in criterion.get("levels", {}).items():
            desc_text = desc.get("en", desc) if isinstance(desc, dict) else desc
            rubric_text += f"  Score {level}: {desc_text}\n"

    evaluation_message = f"""## MISSION
{mission_text}

## EXPECTED BEHAVIOR
{expected}

## STUDENT'S PROMPT
---
{student_prompt}
---

## LLM OUTPUT (result of executing the student's prompt)
---
{llm_output}
---

{rubric_text}

Evaluate this student's prompt according to the rubric above. Respond in {"French" if lang_key == "fr" else "English"}."""

    messages = [
        {"role": "system", "content": evaluator_system},
        {"role": "user", "content": evaluation_message},
    ]

    # The evaluator MUST respond in JSON
    raw_eval = request_chat_completion(messages)

    try:
        data = json.loads(raw_eval)
        # Handle cases where request_chat_completion might have wrapped the JSON in another JSON {"answer": "..."}
        if isinstance(data, dict) and "answer" in data and isinstance(data["answer"], str):
             try:
                 data = json.loads(data["answer"])
             except:
                 pass

        if not isinstance(data, dict) or "criteria_scores" not in data:
            raise ValueError("Invalid evaluation format")

        criteria_scores = {}
        for crit_id, crit_data in data.get("criteria_scores", {}).items():
            if isinstance(crit_data, dict):
                criteria_scores[crit_id] = CriterionScore(
                    score=crit_data.get("score", 0),
                    feedback=crit_data.get("feedback", ""),
                )

        return PEEvaluation(
            criteria_scores=criteria_scores,
            total_score=data.get("total_score", sum(c.score for c in criteria_scores.values())),
            max_score=data.get("max_score", rubric.get("max_score", 10)),
            strengths=data.get("strengths", []),
            improvements=data.get("improvements", []),
            improved_prompt_hint=data.get("improved_prompt_hint", ""),
            pedagogical_note=data.get("pedagogical_note", ""),
        )
    except (json.JSONDecodeError, ValueError, TypeError) as e:
        logger.warning("Failed to parse ELLA evaluation: %s", e)
        return _fallback_evaluation(raw_eval)


def _fallback_evaluation(raw_text: str) -> PEEvaluation:
    """Return a basic evaluation when parsing fails."""
    return PEEvaluation(
        criteria_scores={},
        total_score=0,
        max_score=10,
        strengths=[],
        improvements=["Could not parse evaluation — please try again."],
        improved_prompt_hint="",
        pedagogical_note=raw_text[:200] if raw_text else "",
    )


def run_pe_lab(request: PELabRunRequest) -> PELabRunResponse:
    """Execute the full PE lab flow: run student prompt + evaluate with ELLA."""
    start_time = time.time()

    mission = get_mission(request.lab_id, request.mission_id)
    if mission is None:
        raise ValueError(f"Mission {request.mission_id} not found in lab {request.lab_id}")

    lab = load_lab(request.lab_id)
    rubric_id = lab.get("rubric_id", "base") if lab else "base"
    rubric = load_rubric(rubric_id)
    if rubric is None:
        raise ValueError(f"Rubric {rubric_id} not found")

    lang_key = request.language if request.language in ("fr", "en") else "fr"
    input_text = mission.get("input_text", {}).get(lang_key, "")

    # Execute
    llm_output = _execute_student_prompt(
        student_prompt=request.student_prompt,
        input_text=input_text,
        language=request.language,
        system_prompt=request.system_prompt,
    )

    # Evaluate
    evaluation = _evaluate_with_ella(
        mission=mission,
        student_prompt=request.student_prompt,
        llm_output=llm_output,
        rubric=rubric,
        language=request.language,
    )

    elapsed_ms = (time.time() - start_time) * 1000

    return PELabRunResponse(
        lab_id=request.lab_id,
        mission_id=request.mission_id,
        llm_output=llm_output,
        evaluation=evaluation,
        execution_time_ms=round(elapsed_ms, 1),
    )
