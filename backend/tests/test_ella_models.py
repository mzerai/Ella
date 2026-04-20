"""Test the ELLA models and API schemas."""

from app.services.ella.models import ChatRequest, PageContextAPI


def test_chat_request_default_factory():
    req = ChatRequest(message="Hello")
    assert req.message == "Hello"
    assert isinstance(req.context, PageContextAPI)
    assert req.conversation_history == []


def test_page_context_structure():
    ctx = PageContextAPI(
        page_id="test_lab",
        lab_name="Test Lab",
        environment={"name": "test_env", "is_slippery": False}
    )
    assert ctx.page_id == "test_lab"
    assert ctx.environment.is_slippery is False
