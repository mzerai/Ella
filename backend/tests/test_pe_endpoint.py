"""Tests for PE labs API endpoints."""


def test_list_labs(client):
    response = client.get("/api/labs/pe/labs")
    assert response.status_code == 200
    data = response.json()
    assert "labs" in data
    assert len(data["labs"]) == 5


def test_get_lab_detail(client):
    response = client.get("/api/labs/pe/labs/01_zero_shot")
    assert response.status_code == 200
    data = response.json()
    assert data["lab_id"] == "01_zero_shot"
    assert len(data["missions"]) == 2


def test_get_nonexistent_lab(client):
    response = client.get("/api/labs/pe/labs/99_nonexistent")
    assert response.status_code == 404


def test_run_empty_prompt(client):
    response = client.post("/api/labs/pe/run", json={
        "lab_id": "01_zero_shot",
        "mission_id": "summarize_article",
        "student_prompt": "   ",
    })
    assert response.status_code == 422


def test_run_nonexistent_mission(client):
    response = client.post("/api/labs/pe/run", json={
        "lab_id": "01_zero_shot",
        "mission_id": "nonexistent_xyz",
        "student_prompt": "test",
    })
    assert response.status_code == 404


def test_run_missing_fields(client):
    response = client.post("/api/labs/pe/run", json={})
    assert response.status_code == 422
