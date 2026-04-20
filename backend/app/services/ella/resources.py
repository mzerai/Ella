"""
resources.py
------------
Curated, human-verified learning resources for RL topics.
The AI tutor selects from these — it never generates URLs itself.
"""

# Each entry: {"title": str, "url": str, "type": "video"|"book"|"article"|"tutorial", "description": str}
# Organized by sub-topic for fine-grained matching by the LLM.

RESOURCE_CATALOG = {
    # ---- MDP Foundations ----
    "mdp_basics": [
        {
            "title": "David Silver — RL Course, Lecture 2: Markov Decision Processes",
            "url": "https://www.youtube.com/watch?v=lfHX2hHRMVQ",
            "type": "video",
            "description": "Comprehensive lecture on MDPs, states, actions, rewards, and transitions."
        },
        {
            "title": "Sutton & Barto — Chapter 3: Finite Markov Decision Processes (free PDF)",
            "url": "http://incompleteideas.net/book/RLbook2020.pdf#page=67",
            "type": "book",
            "description": "The definitive textbook chapter on MDPs with examples and exercises."
        },
    ],

    # ---- Bellman Equations ----
    "bellman_equations": [
        {
            "title": "David Silver — RL Course, Lecture 2: Bellman Equation derivation",
            "url": "https://www.youtube.com/watch?v=lfHX2hHRMVQ&t=2100",
            "type": "video",
            "description": "Step-by-step Bellman equation derivation from the RL pioneer at DeepMind."
        },
        {
            "title": "Steve Brunton — Bellman Optimality Equations (YouTube)",
            "url": "https://www.youtube.com/watch?v=HWANu65jwis",
            "type": "video",
            "description": "Clear visual explanation of Bellman optimality equations with engineering examples."
        },
        {
            "title": "Sutton & Barto — Section 3.5: The Bellman Equation (free PDF)",
            "url": "http://incompleteideas.net/book/RLbook2020.pdf#page=75",
            "type": "book",
            "description": "Textbook treatment with formal derivation and backup diagrams."
        },
    ],

    # ---- Policy Evaluation ----
    "policy_evaluation": [
        {
            "title": "David Silver — RL Course, Lecture 3: Planning by Dynamic Programming",
            "url": "https://www.youtube.com/watch?v=Nd1-UUMVfz4",
            "type": "video",
            "description": "Covers iterative policy evaluation, policy improvement, and the DP framework."
        },
        {
            "title": "Sutton & Barto — Section 4.1: Policy Evaluation (free PDF)",
            "url": "http://incompleteideas.net/book/RLbook2020.pdf#page=95",
            "type": "book",
            "description": "Formal description of iterative policy evaluation with pseudocode."
        },
        {
            "title": "Mutual Information — Policy Evaluation Explained (YouTube)",
            "url": "https://www.youtube.com/watch?v=ID150Tl-MMw",
            "type": "video",
            "description": "Beginner-friendly animated walkthrough of the policy evaluation algorithm."
        },
    ],

    # ---- Value Iteration ----
    "value_iteration": [
        {
            "title": "David Silver — RL Course, Lecture 3: Value Iteration",
            "url": "https://www.youtube.com/watch?v=Nd1-UUMVfz4&t=3240",
            "type": "video",
            "description": "Value iteration explained as a special case of DP with Bellman optimality."
        },
        {
            "title": "Sutton & Barto — Section 4.4: Value Iteration (free PDF)",
            "url": "http://incompleteideas.net/book/RLbook2020.pdf#page=100",
            "type": "book",
            "description": "Textbook treatment with convergence proof and comparison to policy iteration."
        },
    ],

    # ---- Policy Iteration ----
    "policy_iteration": [
        {
            "title": "David Silver — RL Course, Lecture 3: Policy Iteration",
            "url": "https://www.youtube.com/watch?v=Nd1-UUMVfz4&t=2400",
            "type": "video",
            "description": "Policy iteration as alternating evaluation and improvement steps."
        },
        {
            "title": "Sutton & Barto — Section 4.3: Policy Iteration (free PDF)",
            "url": "http://incompleteideas.net/book/RLbook2020.pdf#page=98",
            "type": "book",
            "description": "Full description with the policy improvement theorem."
        },
    ],

    # ---- Exploration vs Exploitation ----
    "exploration_exploitation": [
        {
            "title": "DeepMind x UCL — Lecture 9: Exploration and Exploitation",
            "url": "https://www.youtube.com/watch?v=aQJP3Z2Ho8U",
            "type": "video",
            "description": "In-depth lecture on exploration strategies including epsilon-greedy, UCB, and Thompson sampling."
        },
        {
            "title": "Lilian Weng — Exploration Strategies in Deep RL (blog)",
            "url": "https://lilianweng.github.io/posts/2020-06-07-exploration-drl/",
            "type": "article",
            "description": "Excellent blog post covering modern exploration methods with clear diagrams."
        },
    ],

    # ---- Q-Learning ----
    "q_learning": [
        {
            "title": "David Silver — RL Course, Lecture 5: Model-Free Control",
            "url": "https://www.youtube.com/watch?v=0g4j2k_Ggc4",
            "type": "video",
            "description": "Covers Q-Learning, SARSA, and the on-policy vs off-policy distinction."
        },
        {
            "title": "Sutton & Barto — Section 6.5: Q-Learning (free PDF)",
            "url": "http://incompleteideas.net/book/RLbook2020.pdf#page=152",
            "type": "book",
            "description": "The original textbook description of Q-Learning with convergence guarantees."
        },
        {
            "title": "sentdex — Q-Learning with OpenAI Gym (YouTube)",
            "url": "https://www.youtube.com/watch?v=yMk_XtIEzH8",
            "type": "video",
            "description": "Hands-on Python implementation of Q-Learning with clear code walkthrough."
        },
    ],

    # ---- Temporal Difference Learning ----
    "td_learning": [
        {
            "title": "David Silver — RL Course, Lecture 4: Model-Free Prediction",
            "url": "https://www.youtube.com/watch?v=PnHCvfgC_ZA",
            "type": "video",
            "description": "TD(0), Monte Carlo, and TD(lambda) prediction methods explained."
        },
        {
            "title": "Sutton & Barto — Chapter 6: Temporal-Difference Learning (free PDF)",
            "url": "http://incompleteideas.net/book/RLbook2020.pdf#page=143",
            "type": "book",
            "description": "Comprehensive textbook chapter on TD methods with examples."
        },
    ],

    # ---- Discount Factor (gamma) ----
    "discount_factor": [
        {
            "title": "David Silver — Lecture 2: Returns and discounting",
            "url": "https://www.youtube.com/watch?v=lfHX2hHRMVQ&t=1500",
            "type": "video",
            "description": "Why we discount, what gamma does, and its effect on agent behavior."
        },
        {
            "title": "Sutton & Barto — Section 3.3: Returns and Episodes (free PDF)",
            "url": "http://incompleteideas.net/book/RLbook2020.pdf#page=70",
            "type": "book",
            "description": "Formal definition of returns, episodic vs continuing tasks, and discount factor."
        },
    ],

    # ---- Convergence ----
    "convergence": [
        {
            "title": "Sutton & Barto — Section 4.1: Convergence of Iterative Policy Evaluation",
            "url": "http://incompleteideas.net/book/RLbook2020.pdf#page=95",
            "type": "book",
            "description": "Formal proof that iterative policy evaluation converges to V_pi."
        },
        {
            "title": "David Silver — Lecture 3: Contraction mapping and convergence",
            "url": "https://www.youtube.com/watch?v=Nd1-UUMVfz4&t=1800",
            "type": "video",
            "description": "Why DP algorithms converge: the contraction mapping argument."
        },
    ],

    # ---- FrozenLake Environment ----
    "frozenlake": [
        {
            "title": "Gymnasium Documentation — FrozenLake-v1",
            "url": "https://gymnasium.farama.org/environments/toy_text/frozen_lake/",
            "type": "tutorial",
            "description": "Official docs for the FrozenLake environment with state/action space details."
        },
        {
            "title": "Nicholas Renotte — FrozenLake Q-Learning Tutorial (YouTube)",
            "url": "https://www.youtube.com/watch?v=ZhoIgo3qqLU",
            "type": "video",
            "description": "Practical walkthrough of solving FrozenLake with Q-Learning in Python."
        },
    ],

    # ---- On-Policy vs Off-Policy ----
    "on_off_policy": [
        {
            "title": "David Silver — Lecture 5: On-policy vs Off-policy Learning",
            "url": "https://www.youtube.com/watch?v=0g4j2k_Ggc4&t=600",
            "type": "video",
            "description": "Clear explanation of the distinction with SARSA vs Q-Learning as examples."
        },
        {
            "title": "Sutton & Barto — Section 5.6-5.7: Off-Policy Methods (free PDF)",
            "url": "http://incompleteideas.net/book/RLbook2020.pdf#page=127",
            "type": "book",
            "description": "Importance sampling and off-policy prediction/control methods."
        },
    ],

    # ---- General RL Overview ----
    "general_rl": [
        {
            "title": "David Silver — RL Course, Lecture 1: Introduction to RL",
            "url": "https://www.youtube.com/watch?v=2pWv7GOvuf0",
            "type": "video",
            "description": "The best introduction to RL concepts: agent, environment, reward hypothesis."
        },
        {
            "title": "OpenAI Spinning Up — Introduction to RL",
            "url": "https://spinningup.openai.com/en/latest/spinningup/rl_intro.html",
            "type": "tutorial",
            "description": "Concise, well-written overview of key RL concepts with code examples."
        },
        {
            "title": "Sutton & Barto — Reinforcement Learning: An Introduction (full book, free PDF)",
            "url": "http://incompleteideas.net/book/RLbook2020.pdf",
            "type": "book",
            "description": "The definitive RL textbook. Free PDF by the authors."
        },
    ],
}

# Mapping: which sub-topics are relevant for each lab page
PAGE_RESOURCE_TOPICS = {
    "policy_evaluation_lab": ["policy_evaluation", "bellman_equations", "mdp_basics", "discount_factor", "convergence", "frozenlake", "general_rl"],
    "value_iteration_lab": ["value_iteration", "bellman_equations", "policy_evaluation", "convergence", "discount_factor", "frozenlake", "general_rl"],
    "policy_iteration_lab": ["policy_iteration", "policy_evaluation", "value_iteration", "bellman_equations", "convergence", "discount_factor", "frozenlake", "general_rl"],
    "q_learning_lab": ["q_learning", "td_learning", "exploration_exploitation", "on_off_policy", "discount_factor", "frozenlake", "general_rl"],
}


def get_resources_for_page(page_id: str) -> str:
    """Return a formatted string of all curated resources relevant to a lab page.
    
    The LLM receives this full list and selects 2-3 resources most relevant
    to the student's specific question. The LLM does NOT generate URLs.
    """
    topics = PAGE_RESOURCE_TOPICS.get(page_id, ["general_rl"])
    
    resources_text = "### Curated Learning Resources (VERIFIED — select from these ONLY)\n"
    resources_text += "Pick 2-3 resources from the list below that are MOST RELEVANT to the student's specific question.\n"
    resources_text += "Do NOT invent URLs. Use ONLY the titles and URLs provided here.\n\n"
    
    seen_urls = set()
    for topic in topics:
        entries = RESOURCE_CATALOG.get(topic, [])
        for entry in entries:
            if entry["url"] not in seen_urls:
                seen_urls.add(entry["url"])
                icon = {"video": "🎬", "book": "📖", "article": "📝", "tutorial": "🔧"}.get(entry["type"], "📎")
                resources_text += f"- {icon} [{entry['title']}]({entry['url']}) — {entry['description']}\n"
    
    return resources_text
