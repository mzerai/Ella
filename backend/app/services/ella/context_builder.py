from app.services.ella.models import PageContextSchema, EnvironmentContext, HyperparametersContext, MetricsContext

def build_policy_evaluation_context(
    page_id: str,
    page_title: str,
    algorithm: str,
    env_name: str,
    is_slippery: bool,
    gamma: float,
    theta: float,
    policy_mode: str,
    evaluation_status: str,
    iterations_to_converge: int,
    final_delta: float,
    is_mathematically_valid: bool
) -> PageContextSchema:
    """Builds a contextual snapshot of the Policy Evaluation lab explicitly from page variables."""
    return PageContextSchema(
        page_id=page_id,
        page_title=page_title,
        algorithm=algorithm,
        lab_name="Policy Evaluation Lab",
        environment=EnvironmentContext(
            name=env_name,
            is_slippery=is_slippery
        ),
        hyperparameters=HyperparametersContext(
            gamma=gamma,
            theta=theta
        ),
        policy_mode=policy_mode,
        evaluation_status=evaluation_status,
        metrics=MetricsContext(
            iterations_to_converge=iterations_to_converge,
            final_delta=final_delta,
            is_mathematically_valid=is_mathematically_valid
        )
    )

def build_value_iteration_context(
    page_id: str,
    page_title: str,
    env_name: str,
    is_slippery: bool,
    gamma: float,
    theta: float,
    max_iters: int,
    evaluation_status: str,
    iterations_to_converge: int,
    final_delta: float,
    goal_reachable: bool
) -> PageContextSchema:
    """Builds a contextual snapshot of the Value Iteration lab."""
    return PageContextSchema(
        page_id=page_id,
        page_title=page_title,
        algorithm="Value Iteration",
        lab_name="Value Iteration Lab",
        environment=EnvironmentContext(
            name=env_name,
            is_slippery=is_slippery
        ),
        hyperparameters=HyperparametersContext(
            gamma=gamma,
            theta=theta
        ),
        policy_mode=f"Optimal (derived from V*), max_iters={max_iters}",
        evaluation_status=evaluation_status,
        metrics=MetricsContext(
            iterations_to_converge=iterations_to_converge,
            final_delta=final_delta,
            is_mathematically_valid=goal_reachable
        )
    )


def build_policy_iteration_context(
    page_id: str,
    page_title: str,
    env_name: str,
    is_slippery: bool,
    gamma: float,
    theta: float,
    max_policy_steps: int,
    evaluation_status: str,
    total_improvements: int,
    current_step: int,
    eval_iters_at_step: int,
    goal_reachable: bool
) -> PageContextSchema:
    """Builds a contextual snapshot of the Policy Iteration lab."""
    return PageContextSchema(
        page_id=page_id,
        page_title=page_title,
        algorithm="Policy Iteration",
        lab_name="Policy Iteration Lab",
        environment=EnvironmentContext(
            name=env_name,
            is_slippery=is_slippery
        ),
        hyperparameters=HyperparametersContext(
            gamma=gamma,
            theta=theta
        ),
        policy_mode=f"Iterative improvement, step {current_step}/{total_improvements}, max_steps={max_policy_steps}",
        evaluation_status=evaluation_status,
        metrics=MetricsContext(
            iterations_to_converge=eval_iters_at_step,
            final_delta=0.0,
            is_mathematically_valid=goal_reachable
        )
    )


def build_q_learning_context(
    page_id: str,
    page_title: str,
    env_name: str,
    map_size: str,
    is_slippery: bool,
    gamma: float,
    alpha: float,
    epsilon: float,
    epsilon_strategy: str,
    n_episodes: int,
    evaluation_status: str,
    win_rate: float,
    avg_reward: float,
    avg_steps: float,
) -> PageContextSchema:
    """Builds a contextual snapshot of the Q-Learning lab."""
    return PageContextSchema(
        page_id=page_id,
        page_title=page_title,
        algorithm="Q-Learning",
        lab_name="Q-Learning Lab",
        environment=EnvironmentContext(
            name=env_name,
            is_slippery=is_slippery
        ),
        hyperparameters=HyperparametersContext(
            gamma=gamma,
            theta=0.0  # Not used in Q-Learning, placeholder
        ),
        policy_mode=f"Epsilon-greedy ({epsilon_strategy}), epsilon={epsilon:.3f}",
        evaluation_status=evaluation_status,
        metrics=MetricsContext(
            iterations_to_converge=n_episodes,
            final_delta=0.0,
            is_mathematically_valid=win_rate > 0
        ),
        extra={
            "alpha": alpha,
            "epsilon": epsilon,
            "epsilon_strategy": epsilon_strategy,
            "n_episodes": n_episodes,
            "map_size": map_size,
            "win_rate": round(win_rate, 2),
            "avg_reward": round(avg_reward, 4),
            "avg_steps": round(avg_steps, 1),
        }
    )
