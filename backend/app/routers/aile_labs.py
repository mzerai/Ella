"""AI Leadership (AILE) Labs API endpoints."""

import io
import json
import json as json_mod
import logging
import os
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services.ella.orchestrator import generate_response
from app.services.ella.models import ConversationRequest, PageContextSchema

logger = logging.getLogger(__name__)

router = APIRouter()

# ============================================
# AILE Modules (Notebooks)
# ============================================

_AILE_MODULE_FILES = {
    "aile_00_wakeup": "module_00_cells.json",
    "aile_01_demystify": "module_01_cells.json",
    "aile_02_strategy": "module_02_cells.json",
    "aile_03_governance": "module_03_cells.json",
    "aile_04_roi": "module_04_cells.json",
    "aile_05_roadmap": "module_05_cells.json",
}


def _get_aile_modules_dir() -> str:
    """Resolve path to backend/data/aile/modules/ relative to this file."""
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "aile", "modules")
    )


def _get_aile_labs_dir() -> str:
    """Resolve path to backend/data/aile/labs/ relative to this file."""
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "aile", "labs")
    )


@router.get("/modules")
async def list_aile_modules():
    """List all available AILE modules with metadata."""
    modules_dir = _get_aile_modules_dir()
    modules = []

    for module_id, filename in _AILE_MODULE_FILES.items():
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
            logger.warning("Failed to load AILE module %s: %s", filename, e)

    return {"modules": modules}


@router.get("/modules/{module_id}")
async def get_aile_module_cells(module_id: str):
    """Return the notebook cells for an AILE module."""
    filename = _AILE_MODULE_FILES.get(module_id)
    if not filename:
        raise HTTPException(
            status_code=404,
            detail=f"Module '{module_id}' not found. Available: {list(_AILE_MODULE_FILES.keys())}",
        )

    filepath = os.path.join(_get_aile_modules_dir(), filename)
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
# AILE Labs (Case Studies)
# ============================================

_AILE_LAB_FILES = {
    "01_self_assessment": "lab_01_self_assessment.json",
    "02_genai_demo": "lab_02_genai_demo.json",
    "03_competitive_analysis": "lab_03_competitive_analysis.json",
    "04_risk_audit": "lab_04_risk_audit.json",
    "05_business_case": "lab_05_business_case.json",
    "06_maturity_diagnostic": "lab_06_maturity_diagnostic.json",
}


@router.get("/labs")
async def list_aile_labs():
    """List all available AILE labs (case studies)."""
    labs_dir = _get_aile_labs_dir()
    labs = []

    for lab_id, filename in _AILE_LAB_FILES.items():
        filepath = os.path.join(labs_dir, filename)
        if not os.path.exists(filepath):
            continue
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            labs.append({
                "lab_id": data.get("lab_id", lab_id),
                "title": data.get("title", {}),
                "description": data.get("description", {}),
                "mission_count": len(data.get("missions", [])),
            })
        except Exception as e:
            logger.warning("Failed to load AILE lab %s: %s", filename, e)

    return {"labs": labs}


@router.get("/labs/{lab_id}")
async def get_aile_lab_detail(lab_id: str):
    """Get detailed info about a specific AILE lab."""
    filename = _AILE_LAB_FILES.get(lab_id)
    if not filename:
        raise HTTPException(
            status_code=404,
            detail=f"Lab '{lab_id}' not found. Available: {list(_AILE_LAB_FILES.keys())}",
        )

    labs_dir = _get_aile_labs_dir()
    filepath = os.path.join(labs_dir, filename)
    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=404,
            detail=f"Lab file '{filename}' not found on disk.",
        )

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.error("Invalid JSON in %s: %s", filename, e)
        raise HTTPException(status_code=500, detail="Lab file contains invalid JSON.")
    except Exception as e:
        logger.error("Error reading lab file %s: %s", filename, e)
        raise HTTPException(status_code=500, detail="Failed to load lab content.")


# ============================================
# AILE Lab Evaluation (Written / Rédactionnel)
# ============================================


def _load_lab(lab_id: str) -> Optional[dict]:
    """Load a lab JSON file by lab_id."""
    filename = _AILE_LAB_FILES.get(lab_id)
    if not filename:
        return None
    filepath = os.path.join(_get_aile_labs_dir(), filename)
    if not os.path.exists(filepath):
        return None
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


class AILEEvalRequest(BaseModel):
    lab_id: str
    mission_id: str
    student_response: str
    language: str = "fr"


class AILEEvalResponse(BaseModel):
    feedback: str
    score_qualitative: str  # "excellent", "good", "needs_improvement"


@router.post("/evaluate", response_model=AILEEvalResponse)
async def evaluate_response(request: AILEEvalRequest):
    """Evaluate a student's written response using ELLA."""
    lab = _load_lab(request.lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail=f"Lab '{request.lab_id}' not found.")

    mission = None
    for m in lab.get("missions", []):
        if m["mission_id"] == request.mission_id:
            mission = m
            break
    if not mission:
        raise HTTPException(status_code=404, detail=f"Mission '{request.mission_id}' not found.")

    lang = request.language
    mission_instructions = mission["instructions"].get(lang, mission["instructions"].get("fr", ""))
    expected = mission.get("expected_behavior", "")

    eval_prompt = f"""[AILE_LAB_EVALUATION]

You are evaluating an executive's written response in the AILE (Executive AI Leadership) course.

MISSION INSTRUCTIONS (what the executive was asked to do):
{mission_instructions}

EXPECTED BEHAVIOR:
{expected}

EXECUTIVE'S RESPONSE:
{request.student_response}

Evaluate this response. Be direct and professional — this is a senior executive, not a student.

Respond in {"French" if lang == "fr" else "English"} with this exact JSON structure:
{{
    "feedback": "Your detailed, constructive feedback (3-5 paragraphs). Start with what's strong, then what's missing or could be improved. End with one specific, actionable recommendation.",
    "score_qualitative": "excellent|good|needs_improvement"
}}

Scoring guide:
- "excellent": The response is comprehensive, specific to their sector, demonstrates genuine strategic thinking, and includes concrete actionable elements.
- "good": The response covers the main points but lacks specificity, concrete examples, or actionable detail.
- "needs_improvement": The response is generic, superficial, or misses key elements of the mission.

Respond ONLY with the JSON, no other text."""

    conv_request = ConversationRequest(
        query=eval_prompt,
        history=[],
        context=PageContextSchema(
            page_id=request.lab_id,
            lab_name=request.lab_id,
            extra={"course_id": "aile", "lab_evaluation": True}
        )
    )

    raw_response = generate_response(conv_request)

    # Try to parse JSON from the response
    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()

        parsed = json_mod.loads(cleaned)
        return AILEEvalResponse(
            feedback=parsed.get("feedback", raw_response),
            score_qualitative=parsed.get("score_qualitative", "good")
        )
    except (json_mod.JSONDecodeError, KeyError):
        return AILEEvalResponse(
            feedback=raw_response,
            score_qualitative="good"
        )


# ============================================
# AILE Lab 06: Maturity Diagnostic
# ============================================


class MaturityDiagnosticRequest(BaseModel):
    """Request body for the maturity diagnostic."""
    company_profile: Dict[str, str]  # sector, company_size, revenue, ai_budget, role
    answers: Dict[str, int]  # question_id -> score (1-5)
    language: str = "fr"


class DimensionScore(BaseModel):
    dimension_id: str
    dimension_name: str
    score: float
    level: int
    level_name: str


class MaturityDiagnosticResponse(BaseModel):
    """Full diagnostic response."""
    company_profile: Dict[str, str]
    dimension_scores: List[DimensionScore]
    global_score: float
    global_level: int
    global_level_name: str
    prudence_applied: bool
    prudence_details: str
    ella_analysis: str  # LLM-generated qualitative analysis
    transition_plan_key: str  # e.g. "1_to_2", "2_to_3"


@router.post("/maturity-diagnostic", response_model=MaturityDiagnosticResponse)
async def run_maturity_diagnostic(request: MaturityDiagnosticRequest):
    """Run the AI maturity diagnostic: calculate scores, apply prudence rule, generate ELLA analysis."""

    # Load the lab JSON to get dimension definitions and maturity levels
    lab = _load_lab("06_maturity_diagnostic")
    if not lab:
        raise HTTPException(status_code=500, detail="Lab 06 data not found.")

    dimensions = lab["dimensions"]
    maturity_levels = lab["maturity_levels"]
    prudence_rule = lab["prudence_rule"]

    # --- Step 1: Calculate dimension scores ---
    dimension_scores = []
    for dim in dimensions:
        dim_id = dim["id"]
        question_ids = [q["id"] for q in dim["questions"]]
        scores = [request.answers.get(qid, 1) for qid in question_ids]
        avg_score = round(sum(scores) / len(scores), 2)

        # Map score to maturity level
        dim_level = 1
        dim_level_name = "Awareness"
        for ml in maturity_levels:
            low, high = ml["score_range"]
            if low <= avg_score <= high:
                dim_level = ml["level"]
                dim_level_name = ml["name"]
                break
        # Handle edge case: score exactly 5.0
        if avg_score >= 4.7:
            dim_level = 5
            dim_level_name = "Transformational"
        elif avg_score >= 4.0:
            dim_level = 4
            dim_level_name = "Systemic"

        lang = request.language
        dim_name = dim["name"].get(lang, dim["name"].get("fr", dim_id))

        dimension_scores.append(DimensionScore(
            dimension_id=dim_id,
            dimension_name=dim_name,
            score=avg_score,
            level=dim_level,
            level_name=dim_level_name,
        ))

    # --- Step 2: Calculate global score ---
    global_score = round(sum(d.score for d in dimension_scores) / len(dimension_scores), 2)

    # Map global score to level
    global_level = 1
    global_level_name = "Awareness"
    for ml in maturity_levels:
        low, high = ml["score_range"]
        if low <= global_score <= high:
            global_level = ml["level"]
            global_level_name = ml["name"]
            break
    if global_score >= 4.7:
        global_level = 5
        global_level_name = "Transformational"
    elif global_score >= 4.0:
        global_level = 4
        global_level_name = "Systemic"

    # --- Step 3: Apply prudence rule ---
    prudence_applied = False
    prudence_details = ""
    blocking_dims = prudence_rule["blocking_dimensions"]

    if global_level >= 4:
        for ds in dimension_scores:
            if ds.dimension_id in blocking_dims and ds.score < 3.0:
                prudence_applied = True
                prudence_details += f"{ds.dimension_name}: {ds.score}/5 (< 3.0). "

        if prudence_applied:
            original_level = global_level
            global_level = 3
            global_level_name = "Operational"
            if request.language == "fr":
                prudence_details = f"Règle de prudence appliquée. Niveau rétrogradé de {original_level} à 3. Dimensions bloquantes : {prudence_details}"
            else:
                prudence_details = f"Prudence rule applied. Level downgraded from {original_level} to 3. Blocking dimensions: {prudence_details}"

    # --- Step 4: Determine transition plan ---
    if global_level >= 5:
        transition_key = "4_to_5"  # Show aspirational plan
    else:
        transition_key = f"{global_level}_to_{global_level + 1}"

    # --- Step 5: Generate ELLA analysis via LLM ---
    lang = request.language
    lang_instruction = "French" if lang == "fr" else "English"

    dim_summary = "\n".join([
        f"- {ds.dimension_name}: {ds.score}/5 (Level {ds.level} — {ds.level_name})"
        for ds in dimension_scores
    ])

    profile_summary = ", ".join([f"{k}: {v}" for k, v in request.company_profile.items()])

    ella_prompt = f"""[AILE_MATURITY_DIAGNOSTIC]

You are ELLA, strategic AI coach. Analyze this AI maturity diagnostic for a senior executive.

COMPANY PROFILE: {profile_summary}

DIMENSION SCORES:
{dim_summary}

GLOBAL SCORE: {global_score}/5 — Level {global_level} ({global_level_name})
{"PRUDENCE RULE APPLIED: " + prudence_details if prudence_applied else ""}

Generate a strategic diagnostic in {lang_instruction}. Structure your response with these exact sections:

## Synthèse exécutive
2-3 sentences positioning the company on the maturity scale. Be direct and honest.

## Points forts
Identify the 2-3 strongest dimensions and explain why they matter strategically.

## Lacunes critiques
Identify the 2-3 weakest dimensions and explain the business risk of each gap.

## Recommandations prioritaires
For each of the 3 weakest dimensions, provide ONE specific, actionable recommendation with:
- The action (what to do)
- The owner (who should lead it)
- The timeline (how long)
- The expected impact

## Prochaine étape
One sentence: the single most important thing this executive should do Monday morning.

Be specific to their sector ({request.company_profile.get('sector', 'unknown')}).
Use concrete examples. No generic advice.
Do NOT repeat the scores — the executive already has them.
Keep the total response under 800 words."""

    conv_request = ConversationRequest(
        query=ella_prompt,
        history=[],
        context=PageContextSchema(
            page_id="06_maturity_diagnostic",
            lab_name="06_maturity_diagnostic",
            extra={"course_id": "aile", "maturity_diagnostic": True}
        )
    )

    ella_analysis = generate_response(conv_request)

    return MaturityDiagnosticResponse(
        company_profile=request.company_profile,
        dimension_scores=dimension_scores,
        global_score=global_score,
        global_level=global_level,
        global_level_name=global_level_name,
        prudence_applied=prudence_applied,
        prudence_details=prudence_details,
        ella_analysis=ella_analysis,
        transition_plan_key=transition_key,
    )


@router.post("/maturity-diagnostic/pdf")
async def generate_maturity_pdf(request: MaturityDiagnosticRequest):
    """Generate a PDF report of the maturity diagnostic."""

    # First, run the diagnostic to get the full results
    diagnostic = await run_maturity_diagnostic(request)

    # Load lab data for transition plans
    lab = _load_lab("06_maturity_diagnostic")

    # Generate PDF using reportlab
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import cm
    from reportlab.lib.colors import HexColor
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.enums import TA_CENTER

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm, leftMargin=2.5*cm, rightMargin=2.5*cm)

    styles = getSampleStyleSheet()
    lang = request.language

    # Custom styles
    title_style = ParagraphStyle('CustomTitle', parent=styles['Title'], fontSize=22, textColor=HexColor('#92400E'), spaceAfter=20, alignment=TA_CENTER)
    subtitle_style = ParagraphStyle('CustomSubtitle', parent=styles['Normal'], fontSize=12, textColor=HexColor('#78350F'), spaceAfter=10, alignment=TA_CENTER)
    heading_style = ParagraphStyle('CustomHeading', parent=styles['Heading2'], fontSize=14, textColor=HexColor('#92400E'), spaceBefore=15, spaceAfter=8)
    body_style = ParagraphStyle('CustomBody', parent=styles['Normal'], fontSize=10, leading=14, spaceAfter=6)

    elements = []

    # Title
    elements.append(Paragraph("Diagnostic de Maturité IA" if lang == "fr" else "AI Maturity Diagnostic", title_style))
    elements.append(Paragraph("ESPRIT LearnLab Arena — ELLA", subtitle_style))
    elements.append(Spacer(1, 0.5*cm))

    # Company Profile
    elements.append(Paragraph("Profil de l'organisation" if lang == "fr" else "Organization Profile", heading_style))
    profile_data = [[k.replace("_", " ").title(), v] for k, v in diagnostic.company_profile.items()]
    profile_table = Table(profile_data, colWidths=[6*cm, 10*cm])
    profile_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), HexColor('#FEF3C7')),
        ('TEXTCOLOR', (0, 0), (-1, -1), HexColor('#1E293B')),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E5E7EB')),
    ]))
    elements.append(profile_table)
    elements.append(Spacer(1, 0.5*cm))

    # Global Score
    elements.append(Paragraph(
        f"{'Score Global' if lang == 'fr' else 'Global Score'}: {diagnostic.global_score}/5 — "
        f"Level {diagnostic.global_level} ({diagnostic.global_level_name})",
        ParagraphStyle('Score', parent=styles['Heading1'], fontSize=16, textColor=HexColor('#92400E'), alignment=TA_CENTER)
    ))
    if diagnostic.prudence_applied:
        elements.append(Paragraph(diagnostic.prudence_details, ParagraphStyle('Prudence', parent=body_style, textColor=HexColor('#DC2626'))))
    elements.append(Spacer(1, 0.3*cm))

    # Dimension Scores Table (Heat Map style)
    elements.append(Paragraph("Scores par dimension" if lang == "fr" else "Scores by Dimension", heading_style))
    dim_header = [
        "Dimension",
        "Score",
        "Niveau" if lang == "fr" else "Level"
    ]
    dim_data = [dim_header]
    for ds in diagnostic.dimension_scores:
        dim_data.append([ds.dimension_name, f"{ds.score}/5", f"L{ds.level} — {ds.level_name}"])

    dim_table = Table(dim_data, colWidths=[6*cm, 3*cm, 7*cm])
    dim_table_style = [
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#92400E')),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E5E7EB')),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
    ]
    # Color code dimension rows by score
    for i, ds in enumerate(diagnostic.dimension_scores, start=1):
        if ds.score >= 4.0:
            dim_table_style.append(('BACKGROUND', (1, i), (1, i), HexColor('#ECFDF5')))
        elif ds.score >= 3.0:
            dim_table_style.append(('BACKGROUND', (1, i), (1, i), HexColor('#FEF9C3')))
        elif ds.score >= 2.0:
            dim_table_style.append(('BACKGROUND', (1, i), (1, i), HexColor('#FEF3C7')))
        else:
            dim_table_style.append(('BACKGROUND', (1, i), (1, i), HexColor('#FEE2E2')))

    dim_table.setStyle(TableStyle(dim_table_style))
    elements.append(dim_table)
    elements.append(Spacer(1, 0.5*cm))

    # ELLA Analysis
    elements.append(Paragraph("Analyse ELLA" if lang == "fr" else "ELLA Analysis", heading_style))
    # Convert markdown-like text to paragraphs (simple approach)
    for paragraph in diagnostic.ella_analysis.split("\n\n"):
        paragraph = paragraph.strip()
        if not paragraph:
            continue
        if paragraph.startswith("## "):
            elements.append(Paragraph(paragraph[3:], heading_style))
        elif paragraph.startswith("- "):
            for line in paragraph.split("\n"):
                if line.strip().startswith("- "):
                    elements.append(Paragraph("• " + line.strip()[2:], body_style))
        else:
            elements.append(Paragraph(paragraph, body_style))

    elements.append(Spacer(1, 0.5*cm))

    # Transition Plan
    transition_plans = lab.get("transition_plans", {}) if lab else {}
    transition = transition_plans.get(diagnostic.transition_plan_key)
    if transition:
        obj_text = transition["objective"].get(lang, transition["objective"].get("fr", ""))
        plan_label = "Plan d'action" if lang == "fr" else "Action Plan"
        elements.append(Paragraph(f"{plan_label}: {obj_text}", heading_style))

        action_header = [
            "Action",
            "Responsable" if lang == "fr" else "Owner",
            "Livrable" if lang == "fr" else "Deliverable"
        ]
        action_data = [action_header]
        for a in transition["actions"]:
            action_text = a["action"].get(lang, a["action"]) if isinstance(a["action"], dict) else a["action"]
            owner_text = a["owner"].get(lang, a["owner"]) if isinstance(a["owner"], dict) else a["owner"]
            deliverable_text = a["deliverable"].get(lang, a["deliverable"]) if isinstance(a["deliverable"], dict) else a["deliverable"]
            action_data.append([action_text, owner_text, deliverable_text])

        action_table = Table(action_data, colWidths=[7*cm, 3.5*cm, 5.5*cm])
        action_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#78350F')),
            ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E5E7EB')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(action_table)

    # Footer
    elements.append(Spacer(1, 1*cm))
    elements.append(Paragraph(
        "Ce rapport a été généré par ELLA — ESPRIT LearnLab Arena. Les résultats sont basés sur l'auto-évaluation du participant et ne constituent pas un audit formel." if lang == "fr" else
        "This report was generated by ELLA — ESPRIT LearnLab Arena. Results are based on the participant's self-assessment and do not constitute a formal audit.",
        ParagraphStyle('Footer', parent=body_style, fontSize=8, textColor=HexColor('#94A3B8'), alignment=TA_CENTER)
    ))

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=ELLA_AI_Maturity_Diagnostic.pdf"},
    )
