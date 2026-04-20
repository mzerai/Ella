"""Test the pedagogical analytics logging."""

import os
import json
from app.services.ella.analytics import log_interaction, _LOG_DIR, _LOG_FILE
from app.config import settings


def test_log_interaction_creates_file(tmp_path):
    # Override log directory for testing
    test_log_dir = tmp_path / "logs"
    import app.services.ella.analytics as analytics
    # Patch the module variable
    original_log_dir = analytics._LOG_DIR
    analytics._LOG_DIR = str(test_log_dir)
    
    try:
        log_interaction(
            query="Test query",
            page_id="test_page",
            lab_name="Test Lab",
            algorithm="Test Algorithm",
            mode="free",
            response_preview="Test response",
            chunks_used=1,
            response_time_ms=100.0
        )
        
        log_path = test_log_dir / _LOG_FILE
        assert log_path.exists()
        
        with open(log_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            assert len(lines) == 1
            record = json.loads(lines[0])
            assert record["query"] == "Test query"
            assert record["chunks_used"] == 1
            
    finally:
        # Restore original log dir
        analytics._LOG_DIR = original_log_dir
