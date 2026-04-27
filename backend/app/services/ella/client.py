import os
import json
import time
import logging
from typing import List, Dict

from app.config import settings

try:
    import openai
except ImportError:
    openai = None

logger = logging.getLogger(__name__)

_client = None

def _get_client():
    global _client
    if _client is None:
        base_url = settings.tokenfactory_base_url
        api_key = settings.tokenfactory_api_key
        _client = openai.OpenAI(api_key=api_key, base_url=base_url)
    return _client

def is_configured() -> bool:
    """Check if TokenFactory API keys are set in environment variables."""
    base_url = settings.tokenfactory_base_url
    api_key = settings.tokenfactory_api_key
    return bool(base_url and api_key)

def request_chat_completion(messages: List[Dict[str, str]], force_json: bool = True) -> str:
    """Synchronously requests a completion from the LLM based on environment variables."""
    if not openai:
        return json.dumps({"error": "openai library missing"})

    if not is_configured():
        return json.dumps({"error": "Assistant is not configured via environment variables."})

    model = settings.tokenfactory_model
    timeout_val = settings.tokenfactory_timeout

    client = _get_client()

    kwargs = {
        "model": model,
        "messages": messages,
        "timeout": timeout_val,
    }
    if force_json:
        kwargs["response_format"] = {"type": "json_object"}

    max_retries = 2
    for attempt in range(max_retries + 1):
        try:
            response = client.chat.completions.create(**kwargs)
            return response.choices[0].message.content or "{}"
        except (openai.APITimeoutError, openai.RateLimitError, openai.APIConnectionError) as e:
            if attempt < max_retries:
                sleep_time = attempt + 1
                logger.warning(f"Retrying API call (attempt {attempt + 1}/{max_retries}) after transient error: {type(e).__name__}")
                time.sleep(sleep_time)
            else:
                logger.error(f"Final failure after exhausted retries: {type(e).__name__}")
                return json.dumps({"error": f"API Error: {str(e)}"})
        except Exception as e:
            logger.error(f"Non-retryable API failure: {type(e).__name__}")
            return json.dumps({"error": f"API Error: {str(e)}"})
