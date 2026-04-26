"""Tests for RL lab backend engine."""

import pytest
from app.services.labs.rl.frozen_lake import make_env, get_grid, ACTION_NAMES
from app.services.labs.rl.policies import (
    create_random_stochastic_policy,
    create_manual_deterministic_policy,
    validate_policy,
)
from app.services.labs.rl.algorithms import evaluate_v, compute_q, value_iteration, policy_iteration
from app.services.labs.rl.executor import run_rl_lab
from app.services.labs.rl.models import RLLabRunRequest
import numpy as np


class TestFrozenLake:
    def test_make_env_deterministic(self):
        env = make_env(is_slippery=False)
        assert env.observation_space.n == 16
        assert env.action_space.n == 4

    def test_make_env_slippery(self):
        env = make_env(is_slippery=True)
        assert env.observation_space.n == 16

    def test_get_grid(self):
        env = make_env()
        grid = get_grid(env)
        assert len(grid) == 4
        assert len(grid[0]) == 4
        assert grid[0][0] == "S"
        assert grid[3][3] == "G"

    def test_action_names(self):
        assert len(ACTION_NAMES) == 4
        assert 0 in ACTION_NAMES  # Left
        assert 3 in ACTION_NAMES  # Up


class TestPolicies:
    def test_random_policy(self):
        policy = create_random_stochastic_policy(16, 4)
        assert policy.shape == (16, 4)
        assert validate_policy(policy)

    def test_manual_policy(self):
        action_map = {i: 2 for i in range(16)}  # All Right
        policy = create_manual_deterministic_policy(16, action_map)
        assert policy.shape == (16, 4)
        assert validate_policy(policy)
        assert np.argmax(policy[0]) == 2


class TestAlgorithms:
    def test_policy_evaluation(self):
        env = make_env(is_slippery=False)
        policy = create_random_stochastic_policy(16, 4)
        V, info = evaluate_v(env, policy, gamma=0.95, theta=1e-8)
        assert V.shape == (16,)
        assert info["iterations"] > 0
        assert info["final_delta"] < 1e-8
        assert len(info["v_history"]) > 0
        assert len(info["delta_history"]) > 0

    def test_compute_q(self):
        env = make_env(is_slippery=False)
        policy = create_random_stochastic_policy(16, 4)
        V, _ = evaluate_v(env, policy)
        Q = compute_q(env, V)
        assert Q.shape == (16, 4)

    def test_value_iteration(self):
        env = make_env(is_slippery=False)
        V, Q, policy, info = value_iteration(env, gamma=0.95, theta=1e-8)
        assert V.shape == (16,)
        assert Q.shape == (16, 4)
        assert policy.shape == (16, 4)
        assert V[0] > 0, "Goal should be reachable in deterministic mode"
        assert info["iterations"] > 0
        assert len(info["v_history"]) > 0

    def test_policy_iteration(self):
        env = make_env(is_slippery=False)
        V, Q, policy, info = policy_iteration(env, gamma=0.95, theta=1e-8)
        assert V.shape == (16,)
        assert V[0] > 0, "Goal should be reachable"
        assert info["total_improvements"] > 0
        assert len(info["steps"]) > 0

    def test_vi_and_pi_converge_to_same_values(self):
        """Both methods should find the same optimal V*."""
        env = make_env(is_slippery=False)
        V_vi, _, _, _ = value_iteration(env, gamma=0.95, theta=1e-10)
        V_pi, _, _, _ = policy_iteration(env, gamma=0.95, theta=1e-10)
        np.testing.assert_allclose(V_vi, V_pi, atol=1e-6)


class TestExecutor:
    def test_run_policy_evaluation(self):
        req = RLLabRunRequest(algorithm="policy_evaluation", gamma=0.95)
        resp = run_rl_lab(req)
        assert resp.algorithm == "policy_evaluation"
        assert len(resp.V) == 16
        assert len(resp.Q) == 16
        assert resp.grid_size == 4
        assert resp.iterations > 0

    def test_run_value_iteration(self):
        req = RLLabRunRequest(algorithm="value_iteration", gamma=0.95)
        resp = run_rl_lab(req)
        assert resp.algorithm == "value_iteration"
        assert resp.goal_reachable is True
        assert len(resp.v_history) > 0
        assert len(resp.delta_history) > 0

    def test_run_policy_iteration(self):
        req = RLLabRunRequest(algorithm="policy_iteration", gamma=0.95)
        resp = run_rl_lab(req)
        assert resp.algorithm == "policy_iteration"
        assert resp.goal_reachable is True
        assert resp.pi_steps is not None
        assert len(resp.pi_steps) > 0

    def test_run_invalid_algorithm(self):
        req = RLLabRunRequest(algorithm="sarsa", gamma=0.95)
        with pytest.raises(ValueError):
            run_rl_lab(req)

    def test_run_slippery(self):
        req = RLLabRunRequest(
            algorithm="value_iteration", gamma=0.95, is_slippery=True
        )
        resp = run_rl_lab(req)
        assert resp.algorithm == "value_iteration"
        assert len(resp.V) == 16

    def test_run_manual_policy(self):
        manual = {i: 2 for i in range(16)}  # All Right
        req = RLLabRunRequest(
            algorithm="policy_evaluation",
            policy_mode="manual",
            manual_policy=manual,
        )
        resp = run_rl_lab(req)
        assert resp.algorithm == "policy_evaluation"
