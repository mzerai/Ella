"""Application configuration loaded from environment variables."""

import json
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    app_debug: bool = True
    app_version: str = "0.1.0"
    tokenfactory_base_url: str = "https://tokenfactory.esprit.tn/api"
    tokenfactory_api_key: str = ""
    tokenfactory_model: str = "hosted_vllm/Llama-3.1-70B-Instruct"
    tokenfactory_timeout: float = 90.0
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_service_key: str = ""
    cors_origins: str = '["http://localhost:3000","http://localhost:8000"]'
    assistant_log_dir: str = "data/rl/logs"

    @property
    def cors_origins_list(self) -> List[str]:
        try:
            return json.loads(self.cors_origins)
        except (json.JSONDecodeError, TypeError):
            return ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
