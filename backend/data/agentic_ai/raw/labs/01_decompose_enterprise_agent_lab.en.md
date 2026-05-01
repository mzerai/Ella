---
course_id: ella_tech_agentic_ai_enterprise_workflows
lab_id: "01_decompose_enterprise_agent_lab"
lab_title_fr: "Lab 1 — Décomposer un agent d’entreprise"
lab_title_en: "Lab 1 — Decompose an Enterprise Agent"
language: "en"
encoding: "UTF-8"
target_score: 8
max_score: 10
---

# Lab 1 — Decompose an Enterprise Agent

## Mission

You must decompose an internal support agent before design.

Management wants an agent that can receive employee requests, search an internal knowledge base, propose a category, prepare a response, and create a note in the ticketing system.

Your role: turn this idea into a clear specification.

---

## Context

The organization has:

- a support knowledge base;
- a ticketing tool;
- HR, IT, and administrative procedures;
- users from several departments;
- possible sensitive requests: HR, security, finance, personal data.

Management says: “We want an autonomous agent.”

You must reframe this request.

---

## Expected deliverable

Complete the following sections.

```markdown
# Internal Support Agent Specification

## 1. Precise objective
...

## 2. Users
...

## 3. Authorized data
...

## 4. Forbidden or sensitive data
...

## 5. Required tools
...

## 6. Authorized actions
...

## 7. Forbidden actions
...

## 8. Required human validations
...

## 9. Logs and traceability
...

## 10. Main risks
...

## 11. Guardrails
...

## 12. Evaluation metrics
...
```

---

## Constraints

Your agent must not:

- read all internal data;
- send an external response without validation;
- modify user rights;
- process sensitive HR files without escalation;
- close a ticket automatically during the pilot;
- hide its sources;
- act without logging.

---

## What Ella will evaluate

Ella will check whether you:

- formulate a precise objective;
- limit the scope;
- distinguish reading and writing;
- define tools;
- limit permissions;
- add human validation;
- plan logs;
- identify risks;
- propose realistic metrics.

---

## Hints

- A read tool does not have the same risk as a write tool.
- A useful agent does not need access to everything.
- A prepared response can remain a draft.
- A first pilot can run in observation mode.
- HR, security, or finance requests must be escalated.
