"""Certificate generation and verification endpoints."""

import io
import os
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.config import settings

router = APIRouter()

# ============================================
# Course definitions
# ============================================

COURSE_CONFIG = {
    "pe": {
        "title": "Prompt Engineering",
        "title_fr": "Prompt Engineering",
        "labs": ["01_zero_shot", "02_few_shot", "03_chain_of_thought", "04_system_prompts", "05_structured_output"],
        "duration": "15 heures",
        "competencies": [
            "Formuler des prompts zero-shot clairs et structurés (4C)",
            "Concevoir des exemples few-shot pour guider un LLM",
            "Appliquer le raisonnement Chain-of-Thought pour les tâches complexes",
            "Rédiger des system prompts professionnels",
            "Obtenir des sorties structurées (JSON, tableaux) d'un LLM",
        ],
    },
    "rl": {
        "title": "Reinforcement Learning",
        "title_fr": "Reinforcement Learning",
        "labs": ["rl_00_culture", "rl_01_bellman", "rl_02_planning", "rl_03_td_mc", "rl_04_control", "rl_05_deep_rl"],
        "duration": "15 heures",
        "competencies": [
            "Modéliser un problème sous forme de MDP (états, actions, récompenses)",
            "Appliquer les équations de Bellman pour évaluer une politique",
            "Implémenter les algorithmes de planification (Value Iteration, Policy Iteration)",
            "Comprendre les méthodes TD et Monte Carlo",
            "Implémenter Q-Learning et expliquer les fondements du Deep RL (DQN)",
        ],
    },
}

VERIFY_BASE_URL = "https://ella-frontend-322382658983.us-central1.run.app/verify"


def _get_supabase_admin():
    from supabase import create_client
    return create_client(settings.supabase_url, settings.supabase_service_key)


def _get_supabase_user(token: str):
    from supabase import create_client
    client = create_client(settings.supabase_url, settings.supabase_key)
    client.auth.set_session(token, "")
    return client


async def _get_user_from_token(authorization: Optional[str] = Header(None)):
    """Verify user from Supabase JWT and return user info."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")
    token = authorization.replace("Bearer ", "")
    supabase = _get_supabase_admin()
    try:
        user_response = supabase.auth.get_user(token)
        return user_response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def _check_eligibility(user_id: str, course_id: str) -> dict:
    """Check if student is eligible for a certificate.
    
    Returns: {"eligible": bool, "scores": dict, "average": float, "missing": list}
    """
    config = COURSE_CONFIG.get(course_id)
    if not config:
        return {"eligible": False, "scores": {}, "average": 0, "missing": ["Unknown course"]}

    supabase = _get_supabase_admin()
    
    # Get all attempts for this user and course
    attempts_resp = supabase.table("lab_attempts").select("lab_id, total_score, max_score").eq("user_id", user_id).execute()
    attempts = attempts_resp.data or []

    # Find best score per lab
    best_scores = {}
    for a in attempts:
        lab_id = a["lab_id"]
        if lab_id in config["labs"]:
            score_10 = round((a["total_score"] / a["max_score"]) * 10, 1) if a["max_score"] > 0 else 0
            if lab_id not in best_scores or score_10 > best_scores[lab_id]:
                best_scores[lab_id] = score_10

    # Check each lab
    missing = []
    below_threshold = []
    for lab_id in config["labs"]:
        if lab_id not in best_scores:
            missing.append(lab_id)
        elif best_scores[lab_id] < 8:
            below_threshold.append(f"{lab_id} ({best_scores[lab_id]}/10)")

    if missing or below_threshold:
        return {
            "eligible": False,
            "scores": best_scores,
            "average": round(sum(best_scores.values()) / len(best_scores), 1) if best_scores else 0,
            "missing": missing,
            "below_threshold": below_threshold,
        }

    average = round(sum(best_scores.values()) / len(best_scores), 1)
    return {
        "eligible": average >= 8,
        "scores": best_scores,
        "average": average,
        "missing": [],
        "below_threshold": [],
    }


def _generate_certificate_pdf(
    cert_id: str,
    student_name: str,
    course_title: str,
    competencies: list,
    score: float,
    issued_date: str,
    duration: str,
) -> bytes:
    """Generate a professional certificate PDF using reportlab.
    
    Design: White background, double gold border, corner ornaments.
    Layout (top to bottom):
      - Header: ESPRIT logo (left) | separator | LearnLab logo (right)
      - Subtitle: Honoris United Universities
      - Gold decorative line
      - Title: CERTIFICAT DE COMPÉTENCES / Certificate of competency
      - Body: "Ce certificat atteste que" / Student Name / gold line / course / score
      - Bottom row: Competencies (left) | QR code (center) | Date+Signature (right)
    
    Logo files must exist at:
      - backend/data/logos/logo_esprit.png  (ESPRIT logo on white background)
      - backend/data/logos/logo_learnlab.png (LearnLab Arena triangle icon)
    """
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.units import cm
    from reportlab.lib.colors import HexColor
    from reportlab.pdfgen import canvas
    from reportlab.lib.utils import ImageReader
    import qrcode
    import os

    buf = io.BytesIO()
    width, height = landscape(A4)
    c = canvas.Canvas(buf, pagesize=landscape(A4))

    # Colors
    primary = HexColor("#1a1a2e")
    text_mid = HexColor("#777777")
    text_light = HexColor("#999999")
    gold = HexColor("#c9a84c")

    # ── Background ──
    c.setFillColor(HexColor("#ffffff"))
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # ── Double gold border ──
    c.setStrokeColor(gold)
    c.setLineWidth(2)
    c.rect(1.5 * cm, 1.5 * cm, width - 3 * cm, height - 3 * cm, fill=0, stroke=1)
    c.setLineWidth(0.5)
    c.rect(1.8 * cm, 1.8 * cm, width - 3.6 * cm, height - 3.6 * cm, fill=0, stroke=1)
    # Inner subtle border
    c.setStrokeColor(HexColor("#c9a84c"))
    c.setLineWidth(0.25)
    c.setStrokeAlpha(0.35)
    c.rect(2.0 * cm, 2.0 * cm, width - 4.0 * cm, height - 4.0 * cm, fill=0, stroke=1)
    c.setStrokeAlpha(1)

    # ── Corner ornaments ──
    corner_size = 1.2 * cm
    corners = [
        (2.2 * cm, height - 2.2 * cm, 0, -1, 1, 0),     # top-left
        (width - 2.2 * cm, height - 2.2 * cm, 0, -1, -1, 0),  # top-right
        (2.2 * cm, 2.2 * cm, 0, 1, 1, 0),                # bottom-left
        (width - 2.2 * cm, 2.2 * cm, 0, 1, -1, 0),       # bottom-right
    ]
    c.setStrokeColor(gold)
    c.setLineWidth(1.5)
    for cx, cy, dy1, dy2, dx1, dx2 in corners:
        c.line(cx, cy, cx, cy + dy2 * corner_size)
        c.line(cx, cy, cx + dx1 * corner_size, cy)

    # ── Logos ──
    logo_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "logos")
    esprit_logo_path = os.path.join(logo_dir, "logo_esprit.png")
    learnlab_logo_path = os.path.join(logo_dir, "logo_learnlab.png")
    
    logo_y = height - 3.5 * cm
    # ESPRIT logo (left of center)
    if os.path.exists(esprit_logo_path):
        c.drawImage(esprit_logo_path, width / 2 - 5.5 * cm, logo_y, width=4.5 * cm, height=1.6 * cm, preserveAspectRatio=True, mask='auto')
    else:
        c.setFont("Helvetica-Bold", 14)
        c.setFillColor(primary)
        c.drawRightString(width / 2 - 0.5 * cm, logo_y + 0.3 * cm, "ESPRIT")
    
    # Separator
    c.setStrokeColor(HexColor("#dddddd"))
    c.setLineWidth(0.5)
    c.line(width / 2, logo_y, width / 2, logo_y + 1 * cm)
    
    # LearnLab logo (right of center)
    if os.path.exists(learnlab_logo_path):
        c.drawImage(learnlab_logo_path, width / 2 + 1 * cm, logo_y, width=3.5 * cm, height=1.2 * cm, preserveAspectRatio=True, mask='auto')
        
        # "ESPRIT LearnLab Arena - ELLA" branding with red initials
        brand_x = width / 2 + 1 * cm + 4 * cm  # position after learnlab logo
        brand_y = logo_y + 0.4 * cm
        
        c.setFont("Helvetica-Bold", 8)
        brand_parts = [
            ("E", "#e94560"), ("SPRIT ", "#1a1a2e"),
            ("L", "#e94560"), ("earn", "#1a1a2e"),
            ("L", "#e94560"), ("ab ", "#1a1a2e"),
            ("A", "#e94560"), ("rena", "#1a1a2e"),
        ]
        cursor_x = brand_x
        for text_part, color in brand_parts:
            c.setFillColor(HexColor(color))
            c.drawString(cursor_x, brand_y, text_part)
            cursor_x += c.stringWidth(text_part, "Helvetica-Bold", 8)
        
        # " - ELLA" in red
        c.setFillColor(HexColor("#e94560"))
        c.drawString(cursor_x, brand_y, " - ELLA")
    else:
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(primary)
        c.drawString(width / 2 + 0.5 * cm, logo_y + 0.3 * cm, "LearnLab Arena")

    # ── Honoris subtitle ──
    c.setFont("Helvetica", 7)
    c.setFillColor(text_light)
    c.drawCentredString(width / 2, logo_y - 0.5 * cm, "HONORIS UNITED UNIVERSITIES")

    # ── Gold decorative line ──
    c.setStrokeColor(gold)
    c.setLineWidth(0.5)
    line_y = logo_y - 0.9 * cm
    line_w = 8 * cm
    c.line(width / 2 - line_w / 2, line_y, width / 2 + line_w / 2, line_y)

    # ── Title ──
    title_y = line_y - 1.5 * cm
    c.setFont("Helvetica-Bold", 32)
    c.setFillColor(primary)
    c.drawCentredString(width / 2, title_y, "CERTIFICAT DE COMPÉTENCES")
    
    c.setFont("Helvetica-Oblique", 9)
    c.setFillColor(HexColor("#aaaaaa"))
    c.drawCentredString(width / 2, title_y - 0.55 * cm, "Certificate of competency")

    # ── Body ──
    body_y = title_y - 1.7 * cm
    c.setFont("Helvetica", 12)
    c.setFillColor(text_mid)
    c.drawCentredString(width / 2, body_y, "Ce certificat atteste que")

    # Student name
    c.setFont("Helvetica-Bold", 30)
    c.setFillColor(primary)
    c.drawCentredString(width / 2, body_y - 1.0 * cm, student_name)

    # Gold line under name
    c.setStrokeColor(gold)
    c.setLineWidth(0.5)
    name_line_y = body_y - 1.4 * cm
    c.line(width / 2 - 3 * cm, name_line_y, width / 2 + 3 * cm, name_line_y)

    # "a validé avec succès..."
    c.setFont("Helvetica", 10)
    c.setFillColor(text_mid)
    c.drawCentredString(width / 2, name_line_y - 0.4 * cm, "a validé avec succès le parcours")

    # Course title
    c.setFont("Helvetica-Bold", 22)
    c.setFillColor(primary)
    c.drawCentredString(width / 2, name_line_y - 1.3 * cm, f"« {course_title} »")

    # Duration + score
    c.setFont("Helvetica", 11)
    c.setFillColor(text_light)
    c.drawCentredString(width / 2, name_line_y - 2.1 * cm, f"Durée : {duration} — Score moyen : {score} / 10")

    # ── Bottom row: Competencies (left) | QR (center) | Signature (right) ──
    bottom_y = 2.8 * cm

    # Competencies (left, small font)
    c.setFont("Helvetica-Bold", 6)
    c.setFillColor(primary)
    c.drawString(3.0 * cm, bottom_y + 2.5 * cm, "COMPÉTENCES ATTESTÉES")
    
    c.setFont("Helvetica", 6)
    c.setFillColor(text_mid)
    comp_y = bottom_y + 2.0 * cm
    for comp in competencies:
        c.drawString(3.0 * cm, comp_y, f"•  {comp}")
        comp_y -= 0.35 * cm

    # QR Code (center)
    qr_url = f"{VERIFY_BASE_URL}/{cert_id}"
    qr = qrcode.make(qr_url, box_size=3, border=1)
    qr_buf = io.BytesIO()
    qr.save(qr_buf, format="PNG")
    qr_buf.seek(0)
    qr_img = ImageReader(qr_buf)
    qr_size = 2.2 * cm
    c.drawImage(qr_img, width / 2 - qr_size / 2, bottom_y + 0.2 * cm, qr_size, qr_size)
    
    c.setFont("Helvetica", 5)
    c.setFillColor(HexColor("#bbbbbb"))
    c.drawCentredString(width / 2, bottom_y - 0.15 * cm, f"ID: {cert_id[:13]}...")
    c.drawCentredString(width / 2, bottom_y - 0.45 * cm, "Scannez pour vérifier")

    # Date + Signature (right)
    sig_x = width - 5.5 * cm
    c.setFont("Helvetica", 7)
    c.setFillColor(text_light)
    c.drawCentredString(sig_x, bottom_y + 2.8 * cm, f"TUNIS, LE {issued_date.upper()}")

    # Line for signature
    c.setStrokeColor(primary)
    c.setLineWidth(0.5)
    c.line(sig_x - 2.5 * cm, bottom_y + 1.5 * cm, sig_x + 2.5 * cm, bottom_y + 1.5 * cm)

    # Prof name
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(primary)
    c.drawCentredString(sig_x, bottom_y + 1.0 * cm, "Prof. Tahar Benlakhdar")
    
    c.setFont("Helvetica", 8)
    c.setFillColor(text_mid)
    c.drawCentredString(sig_x, bottom_y + 0.5 * cm, "CEO, ESPRIT Group")

    c.save()
    buf.seek(0)
    return buf.getvalue()


# ============================================
# API Endpoints
# ============================================

class EligibilityResponse(BaseModel):
    eligible: bool
    course_id: str
    scores: dict
    average: float
    missing: list
    below_threshold: list = []
    existing_certificate_id: Optional[str] = None


@router.get("/eligibility/{course_id}")
async def check_eligibility(course_id: str, authorization: Optional[str] = Header(None)) -> EligibilityResponse:
    """Check if the authenticated user is eligible for a certificate."""
    user = await _get_user_from_token(authorization)
    result = _check_eligibility(user.id, course_id)
    
    # Check if certificate already exists
    supabase = _get_supabase_admin()
    existing = supabase.table("certificates").select("id").eq("user_id", user.id).eq("course_id", course_id).execute()
    
    return EligibilityResponse(
        eligible=result["eligible"],
        course_id=course_id,
        scores=result["scores"],
        average=result["average"],
        missing=result.get("missing", []),
        below_threshold=result.get("below_threshold", []),
        existing_certificate_id=existing.data[0]["id"] if existing.data else None,
    )


@router.post("/generate/{course_id}")
async def generate_certificate(course_id: str, authorization: Optional[str] = Header(None)):
    """Generate a certificate PDF for the authenticated user."""
    user = await _get_user_from_token(authorization)
    config = COURSE_CONFIG.get(course_id)
    if not config:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check eligibility
    result = _check_eligibility(user.id, course_id)
    if not result["eligible"]:
        raise HTTPException(status_code=403, detail="Not eligible for certificate")

    supabase = _get_supabase_admin()

    # Check if certificate already exists
    existing = supabase.table("certificates").select("id").eq("user_id", user.id).eq("course_id", course_id).execute()
    if existing.data:
        cert_id = existing.data[0]["id"]
    else:
        # Create certificate record
        student_name = user.user_metadata.get("full_name", user.email)
        cert_data = supabase.table("certificates").insert({
            "user_id": user.id,
            "course_id": course_id,
            "student_name": student_name,
            "student_email": user.email,
            "score": result["average"],
            "competencies": config["competencies"],
        }).execute()
        cert_id = cert_data.data[0]["id"]

    # Get certificate data for PDF
    cert_record = supabase.table("certificates").select("*").eq("id", cert_id).single().execute()
    cert = cert_record.data

    # Generate PDF
    pdf_bytes = _generate_certificate_pdf(
        cert_id=cert_id,
        student_name=cert["student_name"],
        course_title=config["title_fr"],
        competencies=config["competencies"],
        score=cert["score"],
        issued_date=datetime.fromisoformat(cert["issued_at"]).strftime("%d/%m/%Y"),
        duration=config["duration"],
    )

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ELLA_Certificate_{course_id}_{cert_id[:8]}.pdf"},
    )


@router.get("/verify/{cert_id}")
async def verify_certificate(cert_id: str):
    """Public endpoint — verify a certificate by its ID."""
    supabase = _get_supabase_admin()
    try:
        result = supabase.table("certificates").select("*").eq("id", cert_id).single().execute()
        cert = result.data
        config = COURSE_CONFIG.get(cert["course_id"], {})
        return {
            "valid": True,
            "certificate_id": cert["id"],
            "student_name": cert["student_name"],
            "course_title": config.get("title_fr", cert["course_id"]),
            "score": cert["score"],
            "competencies": cert["competencies"],
            "issued_at": cert["issued_at"],
        }
    except Exception:
        return {"valid": False, "certificate_id": cert_id}


@router.get("/my-certificates")
async def my_certificates(authorization: Optional[str] = Header(None)):
    """Get all certificates for the authenticated user."""
    user = await _get_user_from_token(authorization)
    supabase = _get_supabase_admin()
    result = supabase.table("certificates").select("*").eq("user_id", user.id).order("issued_at", desc=True).execute()
    
    certs = []
    for cert in (result.data or []):
        config = COURSE_CONFIG.get(cert["course_id"], {})
        certs.append({
            "id": cert["id"],
            "course_id": cert["course_id"],
            "course_title": config.get("title_fr", cert["course_id"]),
            "score": cert["score"],
            "issued_at": cert["issued_at"],
        })
    return {"certificates": certs}
