"""Pydantic models for RL lab API requests and responses."""

from pydantic import BaseModel, Field
from typing import Optional


class RLLabRunRequest(BaseModel):
    """Request to run an RL planning algorithm."""
    algorithm: str = Field(
        ...,
        description="Algorithm to run: 'policy_evaluation', 'value_iteration', 'policy_iteration'",
    )
    gamma: float = Field(0.95, ge=0.0, le=1.0, description="Discount factor")
    theta: float = Field(1e-8, gt=0, description="Convergence threshold")
    max_iterations: int = Field(1000, ge=1, le=10000, description="Max iterations")
    is_slippery: bool = Field(False, description="Stochastic transitions")
    map_name: str = Field("4x4", description="Grid size: '4x4' or '8x8'")
    # For policy_evaluation: which policy to evaluate
    policy_mode: str = Field(
        "random",
        description="'random' for equiprobable, 'manual' for custom action map",
    )
    manual_policy: Optional[dict[int, int]] = Field(
        None,
        description="For manual mode: {state_index: action_index} mapping",
    )


class RLLabRunResponse(BaseModel):
    """Response from running an RL planning algorithm."""
    algorithm: str
    # Grid info
    grid: list[list[str]]
    grid_size: int
    # Final results (lists of floats, serializable)
    V: list[float]
    Q: list[list[float]]
    policy: list[list[float]]
    # Convergence info
    iterations: int
    final_delta: float
    goal_reachable: bool
    # History for animation (V at each step)
    v_history: list[list[float]]
    delta_history: list[float]
    # Policy Iteration specific: per-improvement-step snapshots
    pi_steps: Optional[list[dict]] = None
