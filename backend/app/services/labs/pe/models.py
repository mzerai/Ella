"""Data models for PE labs."""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any


class PELabRunRequest(BaseModel):
    """Request body for POST /api/labs/pe/run."""
    lab_id: str
    mission_id: str
    student_prompt: str
    language: str = "fr"
    system_prompt: Optional[str] = None  # For Lab 04 (system prompts)


class CriterionScore(BaseModel):
    """Score for a single evaluation criterion."""
    score: int
    feedback: str


class PEEvaluation(BaseModel):
    """Structured evaluation from ELLA."""
    criteria_scores: Dict[str, CriterionScore]
    total_score: int
    max_score: int
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    improved_prompt_hint: str = ""
    pedagogical_note: str = ""


class PELabRunResponse(BaseModel):
    """Response body from POST /api/labs/pe/run."""
    lab_id: str
    mission_id: str
    llm_output: str
    evaluation: PEEvaluation
    execution_time_ms: float = 0.0
