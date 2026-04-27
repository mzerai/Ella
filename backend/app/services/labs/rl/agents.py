"""
agents.py
---------
Model-free RL agents: Random, TD(0), Monte Carlo, Q-Learning, SARSA.
"""

import numpy as np
from collections import defaultdict
from app.services.labs.rl.base_agent import BaseAgent


class RandomAgent(BaseAgent):
    """Uniformly random agent — baseline."""

    def select_action(self, state: int) -> int:
        return self.env.action_space.sample()

    def learn(self, state, action, reward, next_state, done):
        pass


class TDAgent(BaseAgent):
    """TD(0) policy evaluation with a random policy."""

    def __init__(self, env, alpha: float = 0.1, gamma: float = 0.95):
        super().__init__(env)
        self.alpha = alpha
        self.gamma = gamma
        self.V = np.zeros(self.n_states)

    def select_action(self, state: int) -> int:
        return self.env.action_space.sample()

    def learn(self, state, action, reward, next_state, done):
        target = reward + self.gamma * self.V[next_state] * (not done)
        self.V[state] += self.alpha * (target - self.V[state])


class MCAgent(BaseAgent):
    """First-Visit Monte Carlo policy evaluation with a random policy."""

    def __init__(self, env, gamma: float = 0.95):
        super().__init__(env)
        self.gamma = gamma
        self.V = np.zeros(self.n_states)
        self.returns: dict[int, list[float]] = defaultdict(list)
        self.episode_buffer: list[tuple[int, int, float]] = []

    def select_action(self, state: int) -> int:
        return self.env.action_space.sample()

    def learn(self, state, action, reward, next_state, done):
        self.episode_buffer.append((state, action, reward))

    def end_episode(self):
        """Calculate returns and update V for each first-visited state."""
        G = 0.0
        visited = set()
        for state, _action, reward in reversed(self.episode_buffer):
            G = reward + self.gamma * G
            if state not in visited:
                visited.add(state)
                self.returns[state].append(G)
                self.V[state] = float(np.mean(self.returns[state]))
        self.episode_buffer = []

    def reset(self):
        self.episode_buffer = []


def _argmax_random_tie(arr: np.ndarray) -> int:
    """argmax with random tie-breaking (critical when Q-table is all zeros)."""
    max_val = np.max(arr)
    candidates = np.flatnonzero(arr == max_val)
    return int(np.random.choice(candidates))


class QAgent(BaseAgent):
    """Q-Learning (off-policy TD control) with epsilon-greedy exploration."""

    def __init__(
        self,
        env,
        alpha: float = 0.1,
        gamma: float = 0.95,
        epsilon: float = 0.1,
        epsilon_min: float = 0.01,
        epsilon_decay: float = 0.99,
    ):
        super().__init__(env)
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_min = epsilon_min
        self.epsilon_decay = epsilon_decay
        self.q_table = np.zeros((self.n_states, self.n_actions))

    def select_action(self, state: int) -> int:
        if np.random.random() < self.epsilon:
            return self.env.action_space.sample()
        return _argmax_random_tie(self.q_table[state])

    def learn(self, state, action, reward, next_state, done):
        target = reward + self.gamma * np.max(self.q_table[next_state]) * (not done)
        self.q_table[state, action] += self.alpha * (target - self.q_table[state, action])

    def end_episode(self):
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)


class SARSAAgent(BaseAgent):
    """SARSA (on-policy TD control) with epsilon-greedy exploration."""

    def __init__(
        self,
        env,
        alpha: float = 0.1,
        gamma: float = 0.95,
        epsilon: float = 0.1,
        epsilon_min: float = 0.01,
        epsilon_decay: float = 0.99,
    ):
        super().__init__(env)
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_min = epsilon_min
        self.epsilon_decay = epsilon_decay
        self.q_table = np.zeros((self.n_states, self.n_actions))

    def select_action(self, state: int) -> int:
        if np.random.random() < self.epsilon:
            action = self.env.action_space.sample()
        else:
            action = _argmax_random_tie(self.q_table[state])
        self._last_action = action
        return action

    def learn(self, state, action, reward, next_state, done):
        if not done:
            next_action = self.select_action(next_state)
            target = reward + self.gamma * self.q_table[next_state, next_action]
        else:
            target = reward
        self.q_table[state, action] += self.alpha * (target - self.q_table[state, action])

    def end_episode(self):
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)
