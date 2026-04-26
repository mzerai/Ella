"""
frozenlake_policies.py
----------------------
Utilities for defining and validating policies on FrozenLake.
Supports deterministic (single-action) and stochastic (distribution) policies.
"""

import numpy as np

def create_manual_deterministic_policy(n_states: int, action_map: dict[int, int]) -> np.ndarray:
    """
    Create a stochastic policy representation from a set of deterministic choices.
    """
    policy = np.zeros((n_states, 4))
    for s in range(n_states):
        action = action_map.get(s, 0)
        policy[s, action] = 1.0
    return policy

def create_random_stochastic_policy(n_states: int, n_actions: int = 4, seed: int = None) -> np.ndarray:
    """
    Generate a valid stochastic policy where action probabilities are randomized.
    """
    if seed is not None:
        np.random.seed(seed)
        
    policy = np.random.rand(n_states, n_actions)
    # Normalize each row
    row_sums = policy.sum(axis=1)
    # Handle zero sums just in case, though rand() > 0 usually
    row_sums[row_sums == 0] = 1
    policy = policy / row_sums[:, np.newaxis]
    return policy

def validate_policy(policy: np.ndarray) -> bool:
    """
    Ensures the policy is a valid probability distribution over actions for each state.
    """
    if len(policy.shape) != 2 or policy.shape[1] != 4:
        return False
        
    row_sums = policy.sum(axis=1)
    if not np.allclose(row_sums, 1.0):
        return False
        
    if np.any(policy < 0):
        return False
        
    return True
