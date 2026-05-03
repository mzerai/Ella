"""
orchestrator.py
---------------
Main orchestration logic coordinating context, prompts, retrieval, and the LLM client.
"""

import time
from app.services.ella.models import ConversationRequest
from app.services.ella.prompts import build_system_prompt
from app.services.ella.pe_prompts import build_pe_system_prompt
from app.services.ella.aile_prompts import build_aile_system_prompt
from app.services.ella.agentic_prompts import build_agentic_system_prompt
from app.services.ella.finance_prompts import build_finance_system_prompt
from app.services.ella.healthcare_prompts import build_healthcare_system_prompt
from app.services.ella.manufacturing_prompts import build_manufacturing_system_prompt
from app.services.ella.literacy_prompts import build_literacy_system_prompt
from app.services.ella.client import request_chat_completion
from app.services.ella.formatter import parse_llm_response, format_for_ui
from app.services.ella.analytics import log_interaction
from app.services.ella.platform_knowledge import is_platform_question, PLATFORM_KNOWLEDGE


def _detect_mode(query: str) -> str:
    """Detect the interaction mode from the query text."""
    if query.startswith("[COACH_MODE]"):
        return "coach_me"
    if query.startswith("[QUIZ_MODE]"):
        return "quiz"
    if "explain the main concepts of this page" in query.lower():
        return "explain_page"
    if "explain my current evaluation results" in query.lower():
        return "explain_results"
    return "free"


def generate_response(request: ConversationRequest) -> str:
    """Stateless orchestrator that returns a formatted markdown string response."""
    start_time = time.time()

    course_id = request.context.extra.get("course_id", "rl")
    retrieved_chunks = retrieve_context(request.query, page_id=request.context.page_id, course_id=course_id)

    if course_id == "pe":
        system_prompt = build_pe_system_prompt(request.context, retrieved_chunks)
    elif course_id == "aile":
        system_prompt = build_aile_system_prompt(request.context, retrieved_chunks)
    elif course_id == "agentic":
        system_prompt = build_agentic_system_prompt(request.context, retrieved_chunks)
    elif course_id == "finance":
        system_prompt = build_finance_system_prompt(request.context, retrieved_chunks)
    elif course_id == "healthcare":
        system_prompt = build_healthcare_system_prompt(request.context, retrieved_chunks)
    elif course_id == "manufacturing":
        system_prompt = build_manufacturing_system_prompt(request.context, retrieved_chunks)
    elif course_id == "literacy":
        system_prompt = build_literacy_system_prompt(request.context, retrieved_chunks)
    else:
        system_prompt = build_system_prompt(request.context, retrieved_chunks)

    # Inject platform knowledge ONLY when the student asks about the platform
    if is_platform_question(request.query):
        system_prompt += "\n\n" + PLATFORM_KNOWLEDGE

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(request.history)
    messages.append({"role": "user", "content": request.query})

    raw_response_json = request_chat_completion(messages)
    structured_response = parse_llm_response(raw_response_json)
    formatted = format_for_ui(structured_response)

    elapsed_ms = (time.time() - start_time) * 1000

    # Log the interaction for pedagogical analytics
    log_interaction(
        query=request.query,
        page_id=request.context.page_id,
        lab_name=request.context.lab_name,
        algorithm=request.context.algorithm,
        mode=_detect_mode(request.query),
        response_preview=formatted,
        chunks_used=len(retrieved_chunks),
        response_time_ms=elapsed_ms,
    )

    return formatted
