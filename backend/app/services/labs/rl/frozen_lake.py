"""
frozen_lake.py
--------------
Wraps the Gymnasium FrozenLake-v1 environment and provides helpers
for grid inspection and state conversion.

FrozenLake tiles
================
  S – Start       (top-left)
  F – Frozen      (safe to walk on)
  H – Hole        (fall in → episode over)
  G – Goal        (reach here → win!)

Actions
=======
  0 → Left   1 → Down   2 → Right   3 → Up
"""

import gymnasium as gym


# ── Constants ────────────────────────────────────────────────────────────────

ACTION_NAMES: dict[int, str] = {
    0: "⬅️ Left",
    1: "⬇️ Down",
    2: "➡️ Right",
    3: "⬆️ Up",
}

ACTION_COUNT = 4


# ── Environment factory ─────────────────────────────────────────────────────

def make_env(
    is_slippery: bool = False,
    map_name: str = "4x4",
) -> gym.Env:
    """
    Create a FrozenLake-v1 environment.

    Parameters
    ----------
    is_slippery : bool
        If True the agent only moves in the intended direction ⅓ of the
        time; the remaining ⅔ it slips sideways.  This makes the problem
        *stochastic* and much harder.
    map_name : str
        ``'4x4'`` (default) or ``'8x8'``.

    Returns
    -------
    gym.Env
    """
    return gym.make(
        "FrozenLake-v1",
        map_name=map_name,
        is_slippery=is_slippery,
        render_mode=None,        # never open a Pygame window
        max_episode_steps=500,   # default 100 is too short for exploration
    )


# ── Grid helpers ─────────────────────────────────────────────────────────────

def get_grid(env: gym.Env) -> list[list[str]]:
    """
    Return the 2-D tile grid as a list of rows of single characters.

    Example for the default 4×4 map::

        [['S','F','F','F'],
         ['F','H','F','H'],
         ['F','F','F','H'],
         ['H','F','F','G']]
    """
    desc = env.unwrapped.desc          # numpy array of bytes, e.g. b'S'
    return [[cell.decode("utf-8") for cell in row] for row in desc]


def grid_size(env: gym.Env) -> tuple[int, int]:
    """Return (nrows, ncols) of the environment grid."""
    desc = env.unwrapped.desc
    return int(desc.shape[0]), int(desc.shape[1])


def state_to_rc(state: int, ncols: int) -> tuple[int, int]:
    """Convert a flat state index to ``(row, col)``."""
    return divmod(state, ncols)


# ── Step / Reset wrappers ────────────────────────────────────────────────────

def step_env(
    env: gym.Env, action: int
) -> tuple[int, float, bool, bool, dict]:
    """
    Take one step.

    Returns ``(obs, reward, terminated, truncated, info)``.
    """
    obs, reward, terminated, truncated, info = env.step(action)
    return int(obs), float(reward), bool(terminated), bool(truncated), info


def reset_env(env: gym.Env) -> int:
    """Reset the environment and return the starting state index."""
    obs, _info = env.reset()
    return int(obs)
