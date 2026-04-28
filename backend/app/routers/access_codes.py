"""Course access codes API."""

import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


def _get_supabase_admin():
    from supabase import create_client
    return create_client(settings.supabase_url, settings.supabase_service_key)


async def _verify_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")

    token = authorization.replace("Bearer ", "")
    supabase = _get_supabase_admin()

    try:
        user_response = supabase.auth.get_user(token)
        return user_response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


class VerifyCodeRequest(BaseModel):
    code: str
    course_id: str


class VerifyCodeResponse(BaseModel):
    success: bool
    message: str


class CourseAccessResponse(BaseModel):
    has_access: bool
    unlocked_at: Optional[str] = None


@router.post("/verify-code", response_model=VerifyCodeResponse)
async def verify_access_code(
    request: VerifyCodeRequest,
    authorization: Optional[str] = Header(None),
):
    """Verify an access code and unlock the course for the user."""
    user = await _verify_user(authorization)
    supabase = _get_supabase_admin()

    user_id = user.id
    code = request.code.strip().upper()
    course_id = request.course_id.strip().lower()

    # Check if already unlocked
    existing = supabase.table("course_unlocks").select("id").eq(
        "user_id", user_id
    ).eq("course_id", course_id).execute()

    if existing.data and len(existing.data) > 0:
        return VerifyCodeResponse(success=True, message="Course already unlocked.")

    # Find the code
    code_result = supabase.table("course_access_codes").select("*").eq(
        "code", code
    ).eq("course_id", course_id).eq("is_active", True).execute()

    if not code_result.data or len(code_result.data) == 0:
        raise HTTPException(status_code=400, detail="Code invalide ou non reconnu.")

    code_record = code_result.data[0]

    # Check expiration
    if code_record.get("expires_at"):
        expires = datetime.fromisoformat(code_record["expires_at"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(status_code=400, detail="Ce code a expiré.")

    # Check max uses
    if code_record.get("max_uses") is not None:
        if code_record["current_uses"] >= code_record["max_uses"]:
            raise HTTPException(
                status_code=400,
                detail="Ce code a atteint le nombre maximum d'utilisations.",
            )

    # Unlock the course
    supabase.table("course_unlocks").insert(
        {"user_id": user_id, "course_id": course_id, "code_used": code}
    ).execute()

    # Increment usage counter
    supabase.table("course_access_codes").update(
        {"current_uses": code_record["current_uses"] + 1}
    ).eq("code", code).execute()

    return VerifyCodeResponse(success=True, message="Cours débloqué avec succès !")


@router.get("/access/{course_id}", response_model=CourseAccessResponse)
async def check_course_access(
    course_id: str,
    authorization: Optional[str] = Header(None),
):
    """Check if the current user has access to a course."""
    user = await _verify_user(authorization)
    supabase = _get_supabase_admin()

    result = supabase.table("course_unlocks").select("unlocked_at").eq(
        "user_id", user.id
    ).eq("course_id", course_id).execute()

    if result.data and len(result.data) > 0:
        return CourseAccessResponse(
            has_access=True,
            unlocked_at=result.data[0].get("unlocked_at"),
        )

    return CourseAccessResponse(has_access=False)
