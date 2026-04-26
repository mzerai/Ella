"""
RL Lab Executor — runs planning algorithms and returns serializable results.
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
from app.services.labs.rl.models import RLLabRunRequest, RLLabRunResponse


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
