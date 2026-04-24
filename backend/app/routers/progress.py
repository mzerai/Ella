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
    dynamic_question: str = ""
    student_response: str = ""
    ella_feedback: str = ""
    passed: bool = False
    attempts: int = 0


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
    """Upsert checkpoint progress for the authenticated user.

    Called at two moments:
    1. After generating a dynamic question (to freeze it)
    2. After student submits and receives feedback (to persist the result)
    """
    user = await _verify_user(authorization)
    supabase = _get_supabase_admin()

    row = {
        "user_id": str(user.id),
        "course_id": request.course_id,
        "module_id": request.module_id,
        "checkpoint_id": request.checkpoint_id,
        "dynamic_question": request.dynamic_question,
        "student_response": request.student_response,
        "ella_feedback": request.ella_feedback,
        "passed": request.passed,
        "attempts": request.attempts,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        supabase.table("lesson_checkpoints_progress") \
            .upsert(row, on_conflict="user_id,course_id,module_id,checkpoint_id") \
            .execute()

        return {"status": "saved"}
    except Exception as e:
        logger.error("Failed to save checkpoint progress: %s", e)
        raise HTTPException(status_code=500, detail="Failed to save progress")
