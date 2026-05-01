---
course_id: ella_tech_agentic_ai_enterprise_workflows
lab_id: "05_choose_agent_architecture_lab"
lab_title_fr: "Lab 5 — Choisir l’architecture agentique"
lab_title_en: "Lab 5 — Choose the Agentic Architecture"
language: "en"
encoding: "UTF-8"
target_score: 8
max_score: 10
---

# Lab 5 — Choose the Agentic Architecture

## Mission

You must choose the right architecture for several enterprise cases.

Your objective is not to choose the most advanced architecture. Your objective is to choose the simplest, safest, and most testable architecture for each situation.

---

## Cases to analyze

### Case 1 — Form to ticket

An employee submits an IT form. The system must create a ticket, notify the team, and archive the attachment. Rules are fixed.

### Case 2 — Internal support

An agent receives varied internal tickets. Requests remain within the support domain. The agent must read the ticket, search the procedure, prepare a response, create a note, and escalate sensitive cases.

### Case 3 — Multi-domain assistance

A company wants a platform that handles HR, IT, finance, and compliance requests. Each domain has its own sources, permissions, rules, and owners.

### Case 4 — Compliance file analysis

An agent must analyze a complex file, extract obligations, compare them with available documents, identify gaps, and produce a summary for validation.

### Case 5 — Sensitive customer complaint

A system must prepare a response to a customer complaint. The response must be accurate, sourced, compliant, and validated before sending.

---

## Possible architectures

Choose from:

- deterministic workflow with LLM steps;
- single agent with tools;
- router to specialized agents;
- supervisor with agents as tools;
- handoffs;
- orchestrator-workers;
- evaluator-optimizer;
- reinforced human validation.

---

## Expected deliverable

For each case, complete:

```markdown
## Case X

### Chosen architecture
...

### Why this architecture
...

### Why a more complex architecture is unnecessary or risky
...

### Sensitive data or risks
...

### Required tools
...

### Human validation
...

### Logs to keep
...

### Degraded mode if an agent or tool fails
...
```

---

## What Ella will evaluate

Ella will check whether you:

- choose a suitable architecture;
- avoid over-architecture;
- justify through complexity and risk;
- limit tools;
- define responsibility;
- plan logs;
- place human validation;
- plan a degraded mode.

---

## Hints

- A fixed workflow does not always need an agent.
- A single domain can often start with one agent.
- Several sensitive domains may justify a router or specialists.
- A complex task may justify orchestrator-workers.
- A sensitive response benefits from evaluation before human validation.
