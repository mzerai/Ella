"""Admin analytics endpoints — restricted to admin users."""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from app.config import settings

router = APIRouter()

ADMIN_EMAILS = {"mourad.zerai@gmail.com"}


def _get_supabase_admin():
    """Create a Supabase client with service key (bypasses RLS)."""
    from supabase import create_client
    return create_client(settings.supabase_url, settings.supabase_service_key)


async def _verify_admin(authorization: Optional[str] = Header(None)):
    """Verify the caller is an admin by checking their Supabase JWT."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")

    token = authorization.replace("Bearer ", "")
    supabase = _get_supabase_admin()

    try:
        user_response = supabase.auth.get_user(token)
        email = user_response.user.email
        if email not in ADMIN_EMAILS:
            raise HTTPException(status_code=403, detail="Not an admin")
        return email
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


@router.get("/stats")
async def admin_stats(authorization: Optional[str] = Header(None)):
    """Get platform-wide statistics for the admin dashboard."""
    await _verify_admin(authorization)
    supabase = _get_supabase_admin()

    try:
        # Total students
        profiles_resp = supabase.table("profiles").select("id, email, full_name, created_at").execute()
        profiles = profiles_resp.data or []

        # All lab attempts
        attempts_resp = supabase.table("lab_attempts").select(
            "id, user_id, lab_id, mission_id, total_score, max_score, course_id, created_at"
        ).order("created_at", desc=True).limit(500).execute()
        attempts = attempts_resp.data or []

        # All conversations count
        convos_resp = supabase.table("conversations").select("id, user_id, course_id, updated_at").execute()
        convos = convos_resp.data or []

        # Build profile lookup
        profile_map = {p["id"]: p for p in profiles}

        # Recent signups (last 7 days)
        from datetime import datetime, timedelta, timezone
        seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        recent_signups = [p for p in profiles if p.get("created_at", "") >= seven_days_ago]

        # Attempts per student
        student_attempts = {}
        for a in attempts:
            uid = a["user_id"]
            if uid not in student_attempts:
                profile = profile_map.get(uid, {})
                student_attempts[uid] = {
                    "user_id": uid,
                    "name": profile.get("full_name", ""),
                    "email": profile.get("email", ""),
                    "attempts": 0,
                    "best_scores": {},
                }
            student_attempts[uid]["attempts"] += 1
            lab_key = f"{a.get('course_id', 'pe')}:{a['lab_id']}:{a['mission_id']}"
            current_best = student_attempts[uid]["best_scores"].get(lab_key, 0)
            if a["total_score"] > current_best:
                student_attempts[uid]["best_scores"][lab_key] = a["total_score"]

        # Top students by attempts
        top_students = sorted(student_attempts.values(), key=lambda x: x["attempts"], reverse=True)[:20]
        # Clean up best_scores for JSON
        for s in top_students:
            s["unique_labs"] = len(s["best_scores"])
            s["avg_best_score"] = round(
                sum(s["best_scores"].values()) / len(s["best_scores"]), 1
            ) if s["best_scores"] else 0
            del s["best_scores"]

        # Recent activity (last 20 attempts with student info)
        recent_activity = []
        for a in attempts[:20]:
            profile = profile_map.get(a["user_id"], {})
            recent_activity.append({
                "student_name": profile.get("full_name", "Inconnu"),
                "student_email": profile.get("email", ""),
                "lab_id": a["lab_id"],
                "mission_id": a["mission_id"],
                "course_id": a.get("course_id", "pe"),
                "score": a["total_score"],
                "max_score": a["max_score"],
                "created_at": a["created_at"],
            })

        # Lab stats (grouped by lab)
        lab_stats = {}
        for a in attempts:
            lab_key = a["lab_id"]
            if lab_key not in lab_stats:
                lab_stats[lab_key] = {
                    "lab_id": lab_key,
                    "course_id": a.get("course_id", "pe"),
                    "total_attempts": 0,
                    "unique_students": set(),
                    "scores": [],
                }
            lab_stats[lab_key]["total_attempts"] += 1
            lab_stats[lab_key]["unique_students"].add(a["user_id"])
            lab_stats[lab_key]["scores"].append(a["total_score"])

        lab_summary = []
        for lab in lab_stats.values():
            scores = lab["scores"]
            lab_summary.append({
                "lab_id": lab["lab_id"],
                "course_id": lab["course_id"],
                "total_attempts": lab["total_attempts"],
                "unique_students": len(lab["unique_students"]),
                "avg_score": round(sum(scores) / len(scores), 1) if scores else 0,
                "max_score_achieved": max(scores) if scores else 0,
            })
        lab_summary.sort(key=lambda x: x["total_attempts"], reverse=True)

        return {
            "total_students": len(profiles),
            "recent_signups": len(recent_signups),
            "total_attempts": len(attempts),
            "total_conversations": len(convos),
            "top_students": top_students,
            "recent_activity": recent_activity,
            "lab_summary": lab_summary,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
