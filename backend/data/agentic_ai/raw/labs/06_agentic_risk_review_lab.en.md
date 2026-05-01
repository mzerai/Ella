---
course_id: ella_tech_agentic_ai_enterprise_workflows
lab_id: "06_agentic_risk_review_lab"
lab_title_fr: "Lab 6 — Revue de risques agentiques"
lab_title_en: "Lab 6 — Agentic Risk Review"
language: "en"
encoding: "UTF-8"
target_score: 8
max_score: 10
---

# Lab 6 — Agentic Risk Review

## Mission

You must perform a risk review for an enterprise AI agent.

Choose one agent:

- HR agent;
- finance agent;
- internal support agent;
- CRM agent;
- admission agent;
- compliance agent.

Your objective is to state what is dangerous, what is acceptable, and which guardrails are required before a pilot.

---

## Proposed situation

A company wants to create an internal HR agent.

The proposed agent will access:

- HR procedures;
- HR emails;
- employee files;
- leave requests;
- contract information;
- exchanges with managers.

The agent will be able to:

- answer employees directly;
- prepare decisions;
- retain useful information;
- create notes in the HR system.

You must correct this approach and propose a governed version.

---

## Expected deliverable

Complete this model.

```markdown
# Agentic Risk Review

## 1. Agent analyzed
...

## 2. Acceptable agent objective
...

## 3. Access to refuse
...

## 4. Authorized sources
...

## 5. Personal or sensitive data
...

## 6. Authorized actions
...

## 7. Forbidden actions
...

## 8. Mandatory human validations
...

## 9. Technical guardrails
...

## 10. Organizational guardrails
...

## 11. Logs to retain
...

## 12. Secret protection
...

## 13. Observation mode
...

## 14. Incident response and rollback
...

## 15. Owner and governance
...

## 16. Pilot readiness criteria
...
```

---

## Constraints

Your answer must:

- limit personal data;
- refuse access to unnecessary files;
- separate general procedure from individual file;
- place human validation on sensitive topics;
- protect secrets;
- plan logs;
- plan observation mode;
- plan disabling the agent or one tool;
- name an owner;
- consider the Tunisian personal data protection framework.

---

## What Ella will evaluate

Ella will check whether you:

- identify real risks;
- refuse excessive access;
- propose concrete guardrails;
- distinguish technical security and governance;
- place human validation;
- protect logs and secrets;
- plan incident response and rollback;
- propose a pilot-ready version.

---

## Hints

- An HR agent should not read all employee files.
- A general procedure is not an individual file.
- Durable memory on sensitive data is dangerous.
- An HR write tool must be validated.
- Logs protect, but they can also expose.
