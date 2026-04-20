"""Test the RAG retriever and index loading."""

import os
from app.services.ella.retriever import _get_index_dir, _load_index, retrieve_context


def test_index_dir_resolution():
    index_dir = _get_index_dir("rl")
    assert "data" in index_dir
    assert "rl" in index_dir
    assert "index" in index_dir


def test_load_index_success():
    # This assumes the index has been copied to ella/backend/data/rl/index/
    index = _load_index("rl")
    assert index is not None
    assert "chunks" in index
    assert "embeddings" in index
    assert len(index["chunks"]) > 100  # Should be ~346


def test_retrieve_context_no_results_for_random_query():
    # Testing with a very specific query that won't match anything 
    # unless it's in the actual notes.
    results = retrieve_context("What is the capital of Uzbekistan?", min_score=0.9)
    assert results == []
