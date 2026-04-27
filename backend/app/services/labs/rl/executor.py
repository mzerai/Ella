"""
RL Lab Executor — runs planning and model-free algorithms, returns serializable results.
"""

import numpy as np
from app.services.labs.rl.frozen_lake import make_env, get_grid
from app.services.labs.rl.policies import (
    create_random_stochastic_policy,
    create_manual_deterministic_policy,
)
from app.services.labs.rl.algorithms import (
    evaluate_v,
    compute_q,
    value_iteration,
    policy_iteration,
)
from app.services.labs.rl.agents import TDAgent, MCAgent, QAgent, SARSAAgent
from app.services.labs.rl.episode_runner import run_batch
from app.services.labs.rl.models import (
    RLLabRunRequest,
    RLLabRunResponse,
    RLLabTrainRequest,
    RLLabTrainResponse,
)


def _np_to_list(arr) -> list:
    """Convert numpy array to nested Python lists for JSON serialization."""
    if isinstance(arr, np.ndarray):
        return arr.tolist()
    return arr


def run_rl_lab(request: RLLabRunRequest) -> RLLabRunResponse:
    """Execute an RL planning algorithm and return full results."""
    
    env = make_env(is_slippery=request.is_slippery, map_name=request.map_name)
    grid = get_grid(env)
    n_states = env.observation_space.n
    n_actions = env.action_space.n
    grid_size = int(env.unwrapped.desc.shape[0])
    
    if request.algorithm == "policy_evaluation":
        # Build the policy
        if request.policy_mode == "manual" and request.manual_policy:
            policy = create_manual_deterministic_policy(n_states, request.manual_policy)
        else:
            policy = create_random_stochastic_policy(n_states, n_actions)
        
        V, info = evaluate_v(env, policy, request.gamma, request.theta, request.max_iterations)
        Q = compute_q(env, V, request.gamma)
        
        return RLLabRunResponse(
            algorithm="policy_evaluation",
            grid=grid,
            grid_size=grid_size,
            V=_np_to_list(V),
            Q=_np_to_list(Q),
            policy=_np_to_list(policy),
            iterations=info["iterations"],
            final_delta=info["final_delta"],
            goal_reachable=bool(V[0] > 0),
            v_history=[_np_to_list(v) for v in info["v_history"]],
            delta_history=[float(d) for d in info["delta_history"]],
        )
    
    elif request.algorithm == "value_iteration":
        V, Q, policy, info = value_iteration(
            env, request.gamma, request.theta, request.max_iterations
        )
        
        return RLLabRunResponse(
            algorithm="value_iteration",
            grid=grid,
            grid_size=grid_size,
            V=_np_to_list(V),
            Q=_np_to_list(Q),
            policy=_np_to_list(policy),
            iterations=info["iterations"],
            final_delta=float(info["delta_history"][-1]) if info["delta_history"] else 0.0,
            goal_reachable=bool(V[0] > 0),
            v_history=[_np_to_list(v) for v in info["v_history"]],
            delta_history=[float(d) for d in info["delta_history"]],
        )
    
    elif request.algorithm == "policy_iteration":
        V, Q, policy, info = policy_iteration(
            env, request.gamma, request.theta, request.max_iterations
        )
        
        # Serialize per-step snapshots
        pi_steps = []
        for step in info["steps"]:
            pi_steps.append({
                "V": _np_to_list(step["V"]),
                "Q": _np_to_list(step["Q"]),
                "policy": _np_to_list(step["policy"]),
                "eval_iters": step["eval_iters"],
            })
        
        return RLLabRunResponse(
            algorithm="policy_iteration",
            grid=grid,
            grid_size=grid_size,
            V=_np_to_list(V),
            Q=_np_to_list(Q),
            policy=_np_to_list(policy),
            iterations=info["total_improvements"],
            final_delta=0.0,  # PI converges when policy is stable, not via delta
            goal_reachable=bool(V[0] > 0),
            v_history=[_np_to_list(s["V"]) for s in info["steps"]],
            delta_history=[],  # Not applicable for PI outer loop
            pi_steps=pi_steps,
        )
    
    else:
        raise ValueError(
            f"Unknown algorithm: '{request.algorithm}'. "
            f"Supported: 'policy_evaluation', 'value_iteration', 'policy_iteration'"
        )


# ── Model-free training ─────────────────────────────────────────────────────

def _compute_success_rate_history(reward_history: list[float], window: int = 100) -> list[float]:
    """Compute a moving-average success rate over a sliding window."""
    history = []
    for i in range(len(reward_history)):
        start = max(0, i - window + 1)
        chunk = reward_history[start : i + 1]
        history.append(sum(1 for r in chunk if r > 0) / len(chunk))
    return history


def _derive_policy_from_v(env, V: np.ndarray, gamma: float) -> np.ndarray:
    """Derive a greedy deterministic policy from V using the transition model P."""
    n_states = env.observation_space.n
    n_actions = env.action_space.n
    policy = np.zeros((n_states, n_actions))
    P = env.unwrapped.P
    for s in range(n_states):
        q_s = np.zeros(n_actions)
        for a in range(n_actions):
            for prob, next_s, reward, done in P[s][a]:
                q_s[a] += prob * (reward + gamma * V[next_s] * (not done))
        policy[s, np.argmax(q_s)] = 1.0
    return policy


def _derive_policy_from_q(q_table: np.ndarray) -> np.ndarray:
    """Derive a greedy deterministic policy from Q-table."""
    n_states, n_actions = q_table.shape
    policy = np.zeros((n_states, n_actions))
    for s in range(n_states):
        policy[s, np.argmax(q_table[s])] = 1.0
    return policy


def run_rl_training(request: RLLabTrainRequest) -> RLLabTrainResponse:
    """Train a model-free RL agent and return results."""

    env = make_env(is_slippery=request.is_slippery, map_name=request.map_name)
    grid = get_grid(env)
    grid_size = int(env.unwrapped.desc.shape[0])

    # Create agent
    if request.algorithm == "td0":
        agent = TDAgent(env, alpha=request.alpha, gamma=request.gamma)
    elif request.algorithm == "monte_carlo":
        agent = MCAgent(env, gamma=request.gamma)
    elif request.algorithm == "q_learning":
        agent = QAgent(
            env,
            alpha=request.alpha,
            gamma=request.gamma,
            epsilon=request.epsilon,
            epsilon_min=request.epsilon_min,
            epsilon_decay=request.epsilon_decay,
        )
    elif request.algorithm == "sarsa":
        agent = SARSAAgent(
            env,
            alpha=request.alpha,
            gamma=request.gamma,
            epsilon=request.epsilon,
            epsilon_min=request.epsilon_min,
            epsilon_decay=request.epsilon_decay,
        )
    else:
        raise ValueError(
            f"Unknown algorithm: '{request.algorithm}'. "
            f"Supported: 'td0', 'monte_carlo', 'q_learning', 'sarsa'"
        )

    # Run training
    batch = run_batch(agent, request.n_episodes)

    # Derive final V, Q, policy
    if hasattr(agent, "q_table"):
        Q = agent.q_table.copy()
        V = np.max(Q, axis=1)
        policy = _derive_policy_from_q(Q)
    elif hasattr(agent, "V"):
        V = agent.V.copy()
        Q = compute_q(env, V, request.gamma)
        policy = _derive_policy_from_v(env, V, request.gamma)
    else:
        V = np.zeros(env.observation_space.n)
        Q = np.zeros((env.observation_space.n, env.action_space.n))
        policy = np.ones((env.observation_space.n, env.action_space.n)) / env.action_space.n

    success_rate_history = _compute_success_rate_history(batch.reward_history)

    return RLLabTrainResponse(
        algorithm=request.algorithm,
        grid=grid,
        grid_size=grid_size,
        n_episodes=batch.total_episodes,
        success_rate=batch.success_rate,
        avg_reward=batch.avg_reward,
        avg_steps=batch.avg_steps,
        reward_history=batch.reward_history,
        success_rate_history=success_rate_history,
        V=_np_to_list(V),
        Q=_np_to_list(Q),
        policy=_np_to_list(policy),
        q_snapshots=batch.q_snapshots if batch.q_snapshots else None,
        v_snapshots=batch.v_snapshots if batch.v_snapshots else None,
    )
