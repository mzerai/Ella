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
    # ---- Prompt Engineering: General ----
    "pe_general": [
        {
            "title": "Anthropic — Prompt Engineering Guide",
            "url": "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
            "type": "article",
            "description": "Official Anthropic guide to prompt engineering with Claude — the most comprehensive and up-to-date resource."
        },
        {
            "title": "OpenAI — Prompt Engineering Best Practices",
            "url": "https://platform.openai.com/docs/guides/prompt-engineering",
            "type": "article",
            "description": "OpenAI's official guide covering tactics for getting better results from LLMs."
        },
        {
            "title": "Lilian Weng — Prompt Engineering (survey)",
            "url": "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/",
            "type": "article",
            "description": "Comprehensive academic survey of prompt engineering techniques with research citations."
        },
        {
            "title": "Prompt Engineering Guide (version française)",
            "url": "https://www.promptingguide.ai/fr",
            "type": "article",
            "description": "Le guide de référence en prompt engineering, traduit en français. Couvre toutes les techniques."
        },
        {
            "title": "🇫🇷 Formation Prompt Engineering complète (YouTube, FR)",
            "url": "https://www.youtube.com/watch?v=hdkvjwGoBks",
            "type": "video",
            "description": "Formation complète en français sur le prompt engineering — de zéro à avancé."
        },
        {
            "title": "🇫🇷 Les bases du prompt engineering (YouTube, FR)",
            "url": "https://www.youtube.com/watch?v=SOIQCTjk5Dk",
            "type": "video",
            "description": "Cours vidéo en français expliquant les fondamentaux du prompt engineering."
        },
        {
            "title": "Prompt Engineering Full Tutorial (freeCodeCamp, EN)",
            "url": "https://www.youtube.com/watch?v=_ZvnD73m40o",
            "type": "video",
            "description": "Full free course on prompt engineering by freeCodeCamp — covers all major techniques with examples."
        },
    ],

    # ---- Prompt Engineering: Zero-Shot & Few-Shot ----
    "pe_zero_few_shot": [
        {
            "title": "Learn Prompting — Zero-Shot & Few-Shot",
            "url": "https://learnprompting.org/docs/basics/few_shot",
            "type": "tutorial",
            "description": "Interactive tutorial explaining zero-shot and few-shot prompting with examples."
        },
        {
            "title": "Google — Prompt Design Strategies (zero/few-shot)",
            "url": "https://ai.google.dev/gemini-api/docs/prompting-strategies",
            "type": "article",
            "description": "Google's guide to prompt design including zero-shot and few-shot strategies."
        },
        {
            "title": "🇫🇷 Prompt Engineering Guide FR — Conseils de conception",
            "url": "https://www.promptingguide.ai/fr/introduction/tips",
            "type": "article",
            "description": "Conseils pratiques en français pour concevoir des prompts efficaces (zero-shot et few-shot)."
        },
        {
            "title": "🇫🇷 Formation au Prompt Engineering en français (YouTube)",
            "url": "https://www.youtube.com/watch?v=H89bSRvuY14",
            "type": "video",
            "description": "Guide complet du prompt engineering en français — ChatGPT, Claude, Gemini."
        },
    ],

    # ---- Prompt Engineering: Chain of Thought ----
    "pe_chain_of_thought": [
        {
            "title": "Wei et al. — Chain-of-Thought Prompting (original paper)",
            "url": "https://arxiv.org/abs/2201.11903",
            "type": "article",
            "description": "The original research paper that introduced chain-of-thought prompting by Google Research."
        },
        {
            "title": "Learn Prompting — Chain of Thought",
            "url": "https://learnprompting.org/docs/intermediate/chain_of_thought",
            "type": "tutorial",
            "description": "Practical tutorial on chain-of-thought with examples and variations (zero-shot CoT, self-consistency)."
        },
        {
            "title": "Chain of Thought Prompting Explained (YouTube, EN)",
            "url": "https://www.youtube.com/watch?v=S9OJC76qZ8A",
            "type": "video",
            "description": "Clear explanation of chain-of-thought prompting with practical examples."
        },
        {
            "title": "Everything about Chain of Thought prompting (PromptHub, EN)",
            "url": "https://www.youtube.com/watch?v=C_gf9KNScIo",
            "type": "video",
            "description": "Complete guide to CoT prompting — templates and real-world examples."
        },
    ],

    # ---- Prompt Engineering: System Prompts ----
    "pe_system_prompts": [
        {
            "title": "Anthropic — System Prompts Guide",
            "url": "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/system-prompts",
            "type": "article",
            "description": "Official guide on designing effective system prompts for Claude."
        },
        {
            "title": "OpenAI Cookbook — System Message Examples",
            "url": "https://cookbook.openai.com/articles/related_resources",
            "type": "tutorial",
            "description": "Collection of system prompt patterns and examples from OpenAI."
        },
        {
            "title": "Google's Prompt Engineering Guide (includes system prompts)",
            "url": "https://ai.google.dev/gemini-api/docs/prompting-strategies",
            "type": "article",
            "description": "Google's official guide covering prompt design strategies including system-level instructions."
        },
    ],

    # ---- Prompt Engineering: Structured Output ----
    "pe_structured_output": [
        {
            "title": "Anthropic — Structured Output (JSON mode)",
            "url": "https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency",
            "type": "article",
            "description": "Guide on getting consistent JSON and structured data from Claude."
        },
        {
            "title": "OpenAI — Structured Outputs Guide",
            "url": "https://platform.openai.com/docs/guides/structured-outputs",
            "type": "article",
            "description": "OpenAI's official guide to getting reliable JSON output from GPT models."
        },
        {
            "title": "🇫🇷 FindSkill.ai — Cours PE gratuit en français avec certificat",
            "url": "https://findskill.ai/fr/blog/apprendre-prompt-engineering-guide-francais/",
            "type": "tutorial",
            "description": "6 cours gratuits en français couvrant le prompt engineering de A à Z, avec certificat."
        },
    ],
}

# Mapping: which sub-topics are relevant for each lab page
PAGE_RESOURCE_TOPICS = {
    "policy_evaluation_lab": ["policy_evaluation", "bellman_equations", "mdp_basics", "discount_factor", "convergence", "frozenlake", "general_rl"],
    "value_iteration_lab": ["value_iteration", "bellman_equations", "policy_evaluation", "convergence", "discount_factor", "frozenlake", "general_rl"],
    "policy_iteration_lab": ["policy_iteration", "policy_evaluation", "value_iteration", "bellman_equations", "convergence", "discount_factor", "frozenlake", "general_rl"],
    "q_learning_lab": ["q_learning", "td_learning", "exploration_exploitation", "on_off_policy", "discount_factor", "frozenlake", "general_rl"],
    # Prompt Engineering labs
    "01_zero_shot": ["pe_general", "pe_zero_few_shot"],
    "02_few_shot": ["pe_general", "pe_zero_few_shot"],
    "03_chain_of_thought": ["pe_general", "pe_chain_of_thought"],
    "04_system_prompts": ["pe_general", "pe_system_prompts"],
    "05_structured_output": ["pe_general", "pe_structured_output"],
    # PE modules (lessons)
    "module_01": ["pe_general", "pe_zero_few_shot"],
    "module_02": ["pe_general", "pe_zero_few_shot"],
    "module_03": ["pe_general", "pe_chain_of_thought"],
    "module_04": ["pe_general", "pe_system_prompts"],
    "module_05": ["pe_general", "pe_structured_output"],
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
