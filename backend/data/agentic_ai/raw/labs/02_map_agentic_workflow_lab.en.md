---
course_id: ella_tech_agentic_ai_enterprise_workflows
lab_id: "02_map_agentic_workflow_lab"
lab_title_fr: "Lab 2 — Cartographier un workflow agentique"
lab_title_en: "Lab 2 — Map an Agentic Workflow"
language: "en"
encoding: "UTF-8"
target_score: 8
max_score: 10
---

# Lab 2 — Map an Agentic Workflow

## Mission

You must transform a business process into a controlled agentic workflow.

Choose one domain:

- internal support;
- HR;
- finance;
- admission or registration;
- purchasing;
- compliance;
- customer service;
- IT.

Your objective is to produce a clear workflow map.

---

## Proposed situation

An organization receives internal requests by ticket and email. Requests vary: IT, HR, finance, administration. Some are simple. Others contain sensitive data or require an action that must be validated.

Management wants “an agent that automatically handles requests.”

You must propose a cautious workflow.

---

## Expected deliverable

Complete this model.

```markdown
# Proposed Agentic Workflow

## 1. Chosen process
...

## 2. Current problem
...

## 3. Workflow trigger
...

## 4. Workflow steps
| Step | Input | Agent action | Tool | Decision | Human validation | Output |
|---|---|---|---|---|---|---|
| 1 | ... | ... | ... | ... | ... | ... |

## 5. Decision points
...

## 6. Exceptions to handle
...

## 7. Authorized actions
...

## 8. Forbidden actions
...

## 9. Required human validations
...

## 10. Logs and traces to keep
...

## 11. Usable outputs
...

## 12. Evaluation metrics
...
```

---

## Constraints

Your workflow must:

- limit the agent’s autonomy;
- separate read tools and write tools;
- include human escalation;
- block sensitive actions;
- log tool calls;
- produce usable outputs;
- handle missing information.

---

## What Ella will evaluate

Ella will check whether you:

- start from a real process;
- structure the steps;
- identify decisions;
- connect tools to actions;
- place human validation at the right moment;
- plan exceptions;
- produce useful outputs;
- preserve traceability.

---

## Hints

- An agentic workflow is not a sequence of prompts.
- The LLM can handle ambiguity.
- Code should handle strict rules.
- A sensitive action must be validated.
- A good output allows the workflow to continue.
