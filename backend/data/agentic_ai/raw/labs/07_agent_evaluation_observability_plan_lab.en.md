---
course_id: ella_tech_agentic_ai_enterprise_workflows
lab_id: "07_agent_evaluation_observability_plan_lab"
lab_title_fr: "Lab 7 — Plan d’évaluation et d’observabilité"
lab_title_en: "Lab 7 — Agent Evaluation and Observability Plan"
language: "en"
encoding: "UTF-8"
target_score: 8
max_score: 10
---

# Lab 7 — Agent Evaluation and Observability Plan

## Mission

You must build an evaluation, observability, and pilot-readiness plan for an enterprise agent.

Choose one agent:

- internal support agent;
- admission agent;
- HR agent;
- finance agent;
- compliance agent;
- customer service agent.

Your objective is to prove that the agent can be tested, monitored, and stopped if necessary.

---

## Proposed situation

An organization wants to pilot an internal support agent.

The agent must:

- read tickets;
- search procedures;
- prepare responses;
- create internal notes;
- escalate sensitive cases;
- never send an external response without validation.

Management asks: “How do we know it is ready?”

---

## Expected deliverable

Complete this model.

```markdown
# Evaluation and Observability Plan

## 1. Agent evaluated
...

## 2. Agent objective
...

## 3. Test scope
...

## 4. Test dataset
| ID | Case type | Input | Expected behavior | Success criterion |
|---|---|---|---|---|

## 5. Standard cases
...

## 6. Ambiguous cases
...

## 7. Sensitive cases
...

## 8. Hostile or prompt injection cases
...

## 9. Tool tests
...

## 10. RAG and source tests
...

## 11. Memory tests
...

## 12. Metrics
...

## 13. Graders
Human:
Deterministic rule:
AI:
...

## 14. Traces to keep
...

## 15. Observability dashboard
...

## 16. User feedback
...

## 17. Regression tests
...

## 18. Pilot release thresholds
...

## 19. Rollback procedure
...

## 20. Final decision
Continue / adjust / block / move to pilot:
...
```

---

## Constraints

Your plan must:

- evaluate final answer and agentic path;
- test tools;
- test permissions;
- test sources;
- include sensitive cases;
- include injection cases;
- plan logs;
- define thresholds;
- plan rollback;
- connect metrics to business risk.

---

## What Ella will evaluate

Ella will check whether you:

- create a varied dataset;
- define expected behaviors;
- evaluate tools, RAG, memory, and permissions;
- plan traces;
- use suitable graders;
- define realistic thresholds;
- include observability and feedback;
- plan rollback.

---

## Hints

- A correct answer is not enough if the wrong tool was called.
- Correct escalation is better than an invented answer.
- Sensitive actions must require human validation.
- The dashboard must show risks, not only volume.
- Regression tests protect against risky updates.
