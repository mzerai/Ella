"""
base_agent.py
-------------
Abstract base class for all model-free RL agents.
"""

from abc import ABC, abstractmethod
import gymnasium as gym


class BaseAgent(ABC):
    """Abstract base for model-free RL agents on discrete environments."""

    def __init__(self, env: gym.Env):
        self.env = env
        self.n_states = env.observation_space.n
        self.n_actions = env.action_space.n

    @abstractmethod
    def select_action(self, state: int) -> int:
        """Choose an action given the current state."""
        ...

    @abstractmethod
    def learn(self, state: int, action: int, reward: float, next_state: int, done: bool) -> None:
        """Update internal values from a single transition."""
        ...

    def reset(self) -> None:
        """Optional per-episode reset hook."""
        pass
