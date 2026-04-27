"""
episode_runner.py
-----------------
Runs episodes and batches for model-free RL agents on FrozenLake.
"""

import numpy as np
from dataclasses import dataclass, field
from app.services.labs.rl.base_agent import BaseAgent


@dataclass
class EpisodeResult:
    total_reward: float
    steps: int
    won: bool


@dataclass
class BatchResult:
    total_episodes: int
    successes: int
    failures: int
    total_reward: float
    total_steps: int
    avg_reward: float
    avg_steps: float
    success_rate: float
    reward_history: list[float] = field(default_factory=list)
    v_snapshots: list[dict] = field(default_factory=list)
    q_snapshots: list[dict] = field(default_factory=list)


def run_episode(agent: BaseAgent, max_steps: int = 200) -> EpisodeResult:
    """Run a single episode and return summary."""
    env = agent.env
    state, _ = env.reset()
    agent.reset()

    total_reward = 0.0
    steps = 0

    for _ in range(max_steps):
        action = agent.select_action(state)
        next_state, reward, terminated, truncated, _ = env.step(action)
        next_state = int(next_state)
        done = terminated or truncated

        # Pass terminated (not done) to learn: truncation should NOT zero out
        # the bootstrap target — only true termination (hole/goal) should.
        agent.learn(state, action, float(reward), next_state, terminated)

        total_reward += reward
        steps += 1
        state = next_state

        if done:
            break

    # For MC agents, finalize the episode
    if hasattr(agent, "end_episode"):
        agent.end_episode()

    return EpisodeResult(
        total_reward=total_reward,
        steps=steps,
        won=total_reward > 0,
    )


def run_batch(agent: BaseAgent, n_episodes: int, snapshot_interval: int = 100) -> BatchResult:
    """Run n_episodes and collect statistics + snapshots."""
    reward_history: list[float] = []
    v_snapshots: list[dict] = []
    q_snapshots: list[dict] = []

    successes = 0
    total_reward = 0.0
    total_steps = 0

    for ep in range(n_episodes):
        result = run_episode(agent)
        reward_history.append(result.total_reward)
        total_reward += result.total_reward
        total_steps += result.steps
        if result.won:
            successes += 1

        # Periodic snapshots
        if (ep + 1) % snapshot_interval == 0:
            if hasattr(agent, "V"):
                v_snapshots.append({
                    "episode": ep + 1,
                    "V": agent.V.copy().tolist(),
                })
            if hasattr(agent, "q_table"):
                q_snapshots.append({
                    "episode": ep + 1,
                    "q_table": agent.q_table.copy().tolist(),
                })

    failures = n_episodes - successes
    avg_reward = total_reward / n_episodes if n_episodes > 0 else 0.0
    avg_steps = total_steps / n_episodes if n_episodes > 0 else 0.0
    success_rate = successes / n_episodes if n_episodes > 0 else 0.0

    return BatchResult(
        total_episodes=n_episodes,
        successes=successes,
        failures=failures,
        total_reward=total_reward,
        total_steps=total_steps,
        avg_reward=avg_reward,
        avg_steps=avg_steps,
        success_rate=success_rate,
        reward_history=reward_history,
        v_snapshots=v_snapshots,
        q_snapshots=q_snapshots,
    )
