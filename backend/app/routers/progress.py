"""Lesson checkpoint progress endpoints — persists student state across refreshes."""

import logging
from typing import Optional, List
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================
# Pydantic models
# ============================================

class CheckpointSaveRequest(BaseModel):
    course_id: str
    module_id: str
    checkpoint_id: str
    dynamic_question: Optional[str] = None
    student_response: Optional[str] = None
    ella_feedback: Optional[str] = None
    passed: Optional[bool] = None
    attempts: Optional[int] = None


class CheckpointProgressItem(BaseModel):
    checkpoint_id: str
    dynamic_question: str
    student_response: str
    ella_feedback: str
    passed: bool
    attempts: int


class CheckpointProgressResponse(BaseModel):
    checkpoints: List[CheckpointProgressItem]


# ============================================
# Auth helper (reuses pattern from certificates.py)
# ============================================

def _get_supabase_admin():
    """Create a Supabase client with service key (bypasses RLS)."""
    from supabase import create_client
    return create_client(settings.supabase_url, settings.supabase_service_key)


async def _verify_user(authorization: Optional[str] = Header(None)):
    """Extract user from Supabase JWT. Returns user object or raises 401."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")

    token = authorization.replace("Bearer ", "")
    supabase = _get_supabase_admin()

    try:
        user_response = supabase.auth.get_user(token)
        return user_response.user
    except Exception as e:
        logger.warning("JWT verification failed: %s", e)
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ============================================
# Endpoints
# ============================================

@router.get("/checkpoints/{course_id}/{module_id}", response_model=CheckpointProgressResponse)
async def get_checkpoint_progress(
    course_id: str,
    module_id: str,
    authorization: Optional[str] = Header(None),
):
    """Retrieve all saved checkpoint progress for a user in a specific module."""
    user = await _verify_user(authorization)
    supabase = _get_supabase_admin()

    try:
        result = supabase.table("lesson_checkpoints_progress") \
            .select("checkpoint_id, dynamic_question, student_response, ella_feedback, passed, attempts") \
            .eq("user_id", str(user.id)) \
            .eq("course_id", course_id) \
            .eq("module_id", module_id) \
            .execute()

        return {"checkpoints": result.data or []}
    except Exception as e:
        logger.error("Failed to fetch checkpoint progress: %s", e)
        raise HTTPException(status_code=500, detail="Failed to load progress")


@router.post("/checkpoints")
async def save_checkpoint_progress(
    request: CheckpointSaveRequest,
    authorization: Optional[str] = Header(None),
):
    """Surgically merge checkpoint progress for the authenticated user to prevent data loss."""
    user = await _verify_user(authorization)
    supabase = _get_supabase_admin()

    # 1. Fetch existing state
    existing_row = None
    try:
        result = supabase.table("lesson_checkpoints_progress") \
            .select("*") \
            .eq("user_id", str(user.id)) \
            .eq("course_id", request.course_id) \
            .eq("module_id", request.module_id) \
            .eq("checkpoint_id", request.checkpoint_id) \
            .execute()
        if result.data:
            existing_row = result.data[0]
    except Exception as e:
        logger.warning("Could not fetch existing row for merge: %s", e)

    # 2. Build the final row by merging
    row = {
        "user_id": str(user.id),
        "course_id": request.course_id,
        "module_id": request.module_id,
        "checkpoint_id": request.checkpoint_id,
        "dynamic_question": (existing_row.get("dynamic_question") if existing_row else ""),
        "student_response": (existing_row.get("student_response") if existing_row else ""),
        "ella_feedback": (existing_row.get("ella_feedback") if existing_row else ""),
        "passed": (existing_row.get("passed") if existing_row else False),
        "attempts": (existing_row.get("attempts") if existing_row else 0),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    # Only overwrite if provided
    if request.dynamic_question is not None:
        row["dynamic_question"] = request.dynamic_question
    if request.student_response is not None:
        row["student_response"] = request.student_response
    if request.ella_feedback is not None:
        row["ella_feedback"] = request.ella_feedback
    if request.passed is not None:
        row["passed"] = request.passed
    if request.attempts is not None:
        row["attempts"] = request.attempts

    try:
        supabase.table("lesson_checkpoints_progress") \
            .upsert(row, on_conflict="user_id,course_id,module_id,checkpoint_id") \
            .execute()

        return {"status": "saved"}
    except Exception as e:
        logger.error("Failed to save checkpoint progress: %s", e)
        raise HTTPException(status_code=500, detail="Failed to save progress")
