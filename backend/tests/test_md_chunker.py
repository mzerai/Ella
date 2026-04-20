"""Tests for Markdown chunker."""

import os
from app.services.ella.md_chunker import (
    process_markdown_file,
    _split_bilingual,
    _split_into_sections,
    _chunk_sections,
    _clean_markdown,
    FILE_TOPIC_MAP,
    PE_PAGE_TOPICS,
)


def test_file_topic_map_complete():
    """All 5 PE modules should be in the topic map."""
    expected = [
        "PE_MODULE_01_ZERO_SHOT",
        "PE_MODULE_02_FEW_SHOT",
        "PE_MODULE_03_CHAIN_OF_THOUGHT",
        "PE_MODULE_04_SYSTEM_PROMPTS",
        "PE_MODULE_05_STRUCTURED_OUTPUT",
    ]
    for stem in expected:
        assert stem in FILE_TOPIC_MAP, f"{stem} missing from FILE_TOPIC_MAP"


def test_pe_page_topics_complete():
    """All 5 PE labs should be in the page topics map."""
    expected = ["01_zero_shot", "02_few_shot", "03_chain_of_thought", "04_system_prompts", "05_structured_output"]
    for lab in expected:
        assert lab in PE_PAGE_TOPICS, f"{lab} missing from PE_PAGE_TOPICS"


def test_split_bilingual():
    """Test bilingual splitting."""
    text = "# Module 1 — Zero-Shot\n\nFrench content here.\n\n# Module 1 — Zero-Shot Prompting (English Version)\n\nEnglish content here."
    result = _split_bilingual(text)
    assert "fr" in result
    assert "en" in result
    assert "French content" in result["fr"]
    assert "English content" in result["en"]


def test_split_into_sections():
    """Test section splitting by ## headers."""
    text = """
## Section One
This content is now long enough to pass the 50 characters threshold required by the split into sections function. We need to add more text here.

## Section Two
This is another section with enough content to be considered a real section by the Markdown chunker. It has more than fifty characters.
"""
    sections = _split_into_sections(text)
    assert len(sections) >= 2
    assert any("Section One" in s["title"] for s in sections)


def test_chunk_sections_short():
    """Short sections should not be split."""
    sections = [{"title": "Test", "content": "Short content."}]
    chunks = _chunk_sections(sections, max_tokens=400)
    assert len(chunks) == 1


def test_clean_markdown():
    """Test markdown cleanup."""
    text = "# Module Title\n\n---\n\nContent here.\n\n---\n\nMore content."
    cleaned = _clean_markdown(text)
    assert "# Module Title" not in cleaned
    assert "---" not in cleaned
    assert "Content here" in cleaned


def test_process_markdown_file():
    """Test full processing of a markdown file if available."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    raw_dir = os.path.join(current_dir, '..', 'data', 'pe', 'raw')
    test_file = os.path.join(raw_dir, 'PE_MODULE_01_ZERO_SHOT.md')
    
    if os.path.exists(test_file):
        chunks = process_markdown_file(test_file, "PE_MODULE_01_ZERO_SHOT")
        assert len(chunks) > 0
        # Check metadata
        for chunk in chunks:
            assert chunk.metadata["topic"] == "zero_shot"
            assert chunk.metadata["course"] == "pe"
            assert chunk.metadata["language"] in ("fr", "en")
