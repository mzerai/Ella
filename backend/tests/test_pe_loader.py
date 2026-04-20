"""Tests for PE lab loader."""

from app.services.labs.pe.loader import load_lab, load_rubric, get_mission


def test_load_zero_shot_lab():
    lab = load_lab("01_zero_shot")
    assert lab is not None
    assert lab["lab_id"] == "01_zero_shot"
    assert len(lab["missions"]) == 2


def test_load_all_labs():
    lab_ids = ["01_zero_shot", "02_few_shot", "03_chain_of_thought",
               "04_system_prompts", "05_structured_output"]
    for lab_id in lab_ids:
        lab = load_lab(lab_id)
        assert lab is not None, f"Lab {lab_id} failed to load"
        assert len(lab["missions"]) == 2, f"Lab {lab_id} should have 2 missions"


def test_load_base_rubric():
    rubric = load_rubric("base")
    assert rubric is not None
    assert len(rubric["criteria"]) == 5
    assert rubric["max_score"] == 10


def test_load_zero_shot_rubric():
    rubric = load_rubric("zero_shot")
    assert rubric is not None
    assert len(rubric["criteria"]) == 6  # 5 base + 1 extra
    assert rubric["max_score"] == 12


def test_load_few_shot_rubric():
    rubric = load_rubric("few_shot")
    assert rubric is not None
    assert len(rubric["criteria"]) == 7  # 5 base + 2 extra
    assert rubric["max_score"] == 14


def test_get_mission():
    mission = get_mission("01_zero_shot", "summarize_article")
    assert mission is not None
    assert mission["mission_id"] == "summarize_article"
    assert "fr" in mission["instructions"]
    assert "en" in mission["instructions"]


def test_get_nonexistent_mission():
    mission = get_mission("01_zero_shot", "nonexistent_mission")
    assert mission is None


def test_load_nonexistent_lab():
    lab = load_lab("99_nonexistent")
    assert lab is None
