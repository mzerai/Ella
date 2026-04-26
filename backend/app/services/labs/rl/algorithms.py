"""
algorithms.py
-------------
Model-based RL algorithms migrated from rl-demo-lab.
Contains: Policy Evaluation, Value Iteration, Policy Iteration.
"""

import numpy as np


# ── Policy Evaluation ────────────────────────────────────────────────────────

def evaluate_v(env, policy, gamma=0.95, theta=1e-8, max_iters=1000):
    """Iterative policy evaluation for V(s).
    
    Returns:
        V: State-value array.
        history: Dict with 'iterations', 'final_delta', 'v_history', 'delta_history'.
    """
    n_states = env.unwrapped.observation_space.n
    V = np.zeros(n_states)
    P = env.unwrapped.P
    
    v_history = []
    delta_history = []
    
    iters = 0
    while iters < max_iters:
        delta = 0
        v_history.append(V.copy())
        V_new = np.copy(V)
        for s in range(n_states):
            v_new = 0
            for a, action_prob in enumerate(policy[s]):
                if action_prob == 0:
                    continue
                for prob, next_s, reward, done in P[s][a]:
                    v_new += action_prob * prob * (reward + gamma * V[next_s] * (not done))
            V_new[s] = v_new
            delta = max(delta, abs(V[s] - v_new))
        V = V_new
        delta_history.append(delta)
        iters += 1
        if delta < theta:
            break
            
    return V, {
        "iterations": iters,
        "final_delta": delta,
        "v_history": v_history,
        "delta_history": delta_history,
    }


def compute_q(env, V, gamma=0.95):
    """Compute Q(s,a) from V(s)."""
    n_states = env.unwrapped.observation_space.n
    n_actions = env.unwrapped.action_space.n
    Q = np.zeros((n_states, n_actions))
    P = env.unwrapped.P
    for s in range(n_states):
        for a in range(n_actions):
            q_val = 0
            for prob, next_s, reward, done in P[s][a]:
                q_val += prob * (reward + gamma * V[next_s] * (not done))
            Q[s, a] = q_val
    return Q


# ── Value Iteration ──────────────────────────────────────────────────────────

def value_iteration(env, gamma=0.95, theta=1e-8, max_iter=1000):
    """
    Find the optimal value function V* and policy pi* iteratively.
    
    Returns:
        V: Optimal state-values array.
        Q: Optimal action-values array.
        policy: Optimal deterministic policy (prob matrix).
        history: Dict with 'delta_history', 'v_history', 'iterations'.
    """
    n_s = env.observation_space.n
    n_a = env.action_space.n
    V = np.zeros(n_s)
    delta_history = []
    v_history = []
    
    for i in range(max_iter):
        delta = 0
        V_prev = V.copy()
        v_history.append(V_prev)
        
        for s in range(n_s):
            q_s = np.zeros(n_a)
            for a in range(n_a):
                for prob, next_s, reward, terminated in env.unwrapped.P[s][a]:
                    q_s[a] += prob * (reward + gamma * V_prev[next_s])
            
            best_v = np.max(q_s)
            delta = max(delta, abs(best_v - V[s]))
            V[s] = best_v
            
        delta_history.append(delta)
        if delta < theta:
            break
            
    # Final Q values and policy
    Q = np.zeros((n_s, n_a))
    policy = np.zeros((n_s, n_a))
    
    for s in range(n_s):
        for a in range(n_a):
            for prob, next_s, reward, terminated in env.unwrapped.P[s][a]:
                Q[s][a] += prob * (reward + gamma * V[next_s])
        
        best_a = np.argmax(Q[s])
        policy[s, best_a] = 1.0
        
    return V, Q, policy, {
        "delta_history": delta_history,
        "v_history": v_history,
        "iterations": i + 1,
    }


# ── Policy Iteration ─────────────────────────────────────────────────────────

def policy_iteration(env, gamma=0.95, theta=1e-8, max_policy_steps=50):
    """
    Solve for the optimal policy using Policy Iteration.
    
    Returns:
        V: Optimal state-value array.
        Q: Optimal action-value array.
        policy: Optimal deterministic policy (as a prob matrix).
        history: Dict with 'steps' list and 'total_improvements'.
    """
    n_s = env.observation_space.n
    n_a = env.action_space.n
    
    # Initialize policy: all Left
    policy = np.zeros((n_s, n_a))
    policy[:, 0] = 1.0
    
    steps = []
    
    for i in range(max_policy_steps):
        # Policy Evaluation
        V, eval_info = evaluate_v(env, policy, gamma, theta)
        Q = compute_q(env, V, gamma)
        
        # Save current snapshot
        steps.append({
            "V": V.copy(),
            "Q": Q.copy(),
            "policy": policy.copy(),
            "eval_iters": eval_info["iterations"],
        })
        
        # Policy Improvement
        policy_stable = True
        new_policy = np.zeros((n_s, n_a))
        
        for s in range(n_s):
            old_action = np.argmax(policy[s])
            new_action = np.argmax(Q[s])
            new_policy[s, new_action] = 1.0
            
            if old_action != new_action:
                policy_stable = False
                
        policy = new_policy
        
        if policy_stable:
            break
            
    return V, Q, policy, {
        "steps": steps,
        "total_improvements": i + 1,
    }
