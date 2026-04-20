from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

@dataclass
class EnvironmentContext:
    name: str
    is_slippery: bool

@dataclass
class HyperparametersContext:
    gamma: float
    theta: float

@dataclass
class MetricsContext:
    iterations_to_converge: int
    final_delta: float
    is_mathematically_valid: bool

@dataclass
class PageContextSchema:
    page_id: str
    page_title: str
    algorithm: str
    lab_name: str
    environment: EnvironmentContext
    hyperparameters: HyperparametersContext
    policy_mode: str
    evaluation_status: str
    metrics: MetricsContext
    extra: Dict[str, Any] = field(default_factory=dict)

@dataclass
class RetrievedChunk:
    source: str
    content: str
    relevance_score: float

@dataclass
class AssistantResponse:
    answer: str
    connection_to_page: str
    intuition: str
    misconception: str
    latex_blocks: List[str]
    suggested_resources: str = ""

@dataclass
class ConversationRequest:
    query: str
    context: PageContextSchema
    history: List[Dict[str, str]] = field(default_factory=list)

# ============================================================
# API models (Pydantic — for FastAPI request/response)
# ============================================================

class EllaMode(str, Enum):
    FREE = "free"
    EXPLAIN_PAGE = "explain_page"
    EXPLAIN_RESULTS = "explain_results"
    COACH = "coach_me"
    QUIZ = "quiz"


class EnvironmentContextAPI(BaseModel):
    name: str = "FrozenLake-v1"
    is_slippery: bool = True


class HyperparametersContextAPI(BaseModel):
    gamma: float = 0.99
    theta: float = 1e-6


class MetricsContextAPI(BaseModel):
    iterations_to_converge: int = 0
    final_delta: float = 0.0
    is_mathematically_valid: bool = True


class PageContextAPI(BaseModel):
    page_id: str = ""
    page_title: str = ""
    algorithm: str = ""
    lab_name: str = ""
    environment: EnvironmentContextAPI = Field(default_factory=EnvironmentContextAPI)
    hyperparameters: HyperparametersContextAPI = Field(default_factory=HyperparametersContextAPI)
    policy_mode: str = ""
    evaluation_status: str = ""
    metrics: MetricsContextAPI = Field(default_factory=MetricsContextAPI)
    extra: dict = Field(default_factory=dict)


class ChatRequest(BaseModel):
    message: str
    context: PageContextAPI = Field(default_factory=PageContextAPI)
    conversation_history: list = Field(default_factory=list)


class ChatResponse(BaseModel):
    answer: str
    connection_to_page: str = ""
    intuition: str = ""
    misconception: str = ""
    latex_blocks: list = Field(default_factory=list)
    suggested_resources: str = ""
    mode: str = "free"
    chunks_used: int = 0
    response_time_ms: float = 0.0
