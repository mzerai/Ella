"""Test the /api/ella/chat endpoint."""

import pytest
from unittest.mock import patch


def test_chat_endpoint_unconfigured(client):
    """If API keys are missing, should return an error in the answer."""
    payload = {
        "message": "What is Q-Learning?",
        "context": {
            "page_id": "q_learning_lab",
            "lab_name": "Q-Learning Lab"
        }
    }
    response = client.post("/api/ella/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Assistant is not configured" in data["answer"]


@patch("app.services.ella.client.is_configured", return_value=True)
@patch("app.services.ella.client.request_chat_completion")
def test_chat_endpoint_success(mock_chat, mock_config, client):
    """If configured, should return the LLM answer."""
    mock_chat.return_value = '{"answer": "Q-Learning is model-free.", "latex_blocks": []}'
    
    payload = {
        "message": "What is Q-Learning?",
        "context": {
            "page_id": "q_learning_lab",
            "lab_name": "Q-Learning Lab",
            "algorithm": "Q-Learning"
        }
    }
    response = client.post("/api/ella/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "model-free" in data["answer"]
    assert data["mode"] == "free"
    assert data["response_time_ms"] > 0
