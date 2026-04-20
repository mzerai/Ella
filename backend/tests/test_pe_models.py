"""Tests for PE lab models."""

from app.services.labs.pe.models import (
    PELabRunRequest,
    PELabRunResponse,
    PEEvaluation,
    CriterionScore,
)


def test_pe_run_request_defaults():
    req = PELabRunRequest(
        lab_id="01_zero_shot",
        mission_id="summarize_article",
        student_prompt="Summarize this article",
    )
    assert req.language == "fr"
    assert req.system_prompt is None


def test_pe_run_request_with_system_prompt():
    req = PELabRunRequest(
        lab_id="04_system_prompts",
        mission_id="hr_assistant",
        student_prompt="",
        system_prompt="You are an HR assistant...",
    )
    assert req.system_prompt is not None


def test_pe_evaluation_structure():
    eval = PEEvaluation(
        criteria_scores={
            "clarity": CriterionScore(score=2, feedback="Clear objective."),
            "specificity": CriterionScore(score=1, feedback="Could be more specific."),
        },
        total_score=3,
        max_score=10,
        strengths=["Good start"],
        improvements=["Add constraints"],
        improved_prompt_hint="Try specifying the format.",
        pedagogical_note="In zero-shot, clarity is key.",
    )
    assert eval.total_score == 3
    assert len(eval.criteria_scores) == 2
    assert eval.criteria_scores["clarity"].score == 2
