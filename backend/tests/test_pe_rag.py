"""Tests for PE RAG index loading."""

import os
import json
from app.services.ella.retriever import _get_index_dir, _load_index


def test_pe_index_dir_resolution():
    """Test that PE index directory resolves correctly."""
    index_dir = _get_index_dir("pe")
    # In the current structure, retriever is in app/services/ella/
    # _get_index_dir goes up 3 levels to backend/ then data/pe/index
    assert index_dir.endswith(os.path.join("data", "pe", "index"))


def test_pe_index_loads_after_build():
    """Test that PE index loads if it has been built."""
    index_dir = _get_index_dir("pe")
    chunks_path = os.path.join(index_dir, "chunks.json")
    
    if os.path.exists(chunks_path):
        index = _load_index("pe")
        assert index is not None
        assert "chunks" in index
        assert "embeddings" in index
        assert len(index["chunks"]) > 0
        
        # Verify PE metadata
        first_chunk = index["chunks"][0]
        assert first_chunk["metadata"]["course"] == "pe"
        assert first_chunk["metadata"]["language"] in ("fr", "en")
