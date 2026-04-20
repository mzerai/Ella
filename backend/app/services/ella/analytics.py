"""
analytics.py
------------
Log student interactions for pedagogical analytics.
Writes to a local JSONL file (one JSON object per line).
"""

import os
import json
import logging
from datetime import datetime, timezone
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)

# Default log path — can be overridden via environment variable
_LOG_DIR = settings.assistant_log_dir
_LOG_FILE = "queries.jsonl"


def log_interaction(
    query: str,
    page_id: str,
    lab_name: str,
    algorithm: str,
    mode: str,
    response_preview: str,
    chunks_used: int,
    response_time_ms: Optional[float] = None,
) -> None:
    """Append a student interaction record to the JSONL log file.

    Args:
        query: The student's question text.
        page_id: Current page identifier (e.g., "policy_evaluation_lab").
        lab_name: Human-readable lab name (e.g., "Policy Evaluation Lab").
        algorithm: Algorithm being studied (e.g., "Policy Evaluation").
        mode: Interaction mode — "free", "explain_page", "explain_results", or "coach_me".
        response_preview: First 200 chars of the assistant's response.
        chunks_used: Number of RAG chunks retrieved for this query.
        response_time_ms: Time taken to generate the response (optional).
    """
    try:
        os.makedirs(_LOG_DIR, exist_ok=True)
        log_path = os.path.join(_LOG_DIR, _LOG_FILE)

        record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "page_id": page_id,
            "lab_name": lab_name,
            "algorithm": algorithm,
            "mode": mode,
            "query": query,
            "response_preview": response_preview[:200],
            "chunks_used": chunks_used,
        }
        if response_time_ms is not None:
            record["response_time_ms"] = round(response_time_ms, 1)

        with open(log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    except Exception as e:
        # Logging should never crash the app
        logger.warning("Failed to log interaction: %s", e)
