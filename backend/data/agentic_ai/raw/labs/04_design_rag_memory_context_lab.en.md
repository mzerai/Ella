---
course_id: ella_tech_agentic_ai_enterprise_workflows
lab_id: "04_design_rag_memory_context_lab"
lab_title_fr: "Lab 4 — Concevoir RAG, mémoire et contexte"
lab_title_en: "Lab 4 — Design RAG, Memory, and Context"
language: "en"
encoding: "UTF-8"
target_score: 8
max_score: 10
---

# Lab 4 — Design RAG, Memory, and Context

## Mission

You must design the RAG, memory, and context strategy of an enterprise agent.

Choose an agent:

- HR agent;
- admission agent;
- internal support agent;
- compliance agent;
- customer service agent;
- finance agent;
- purchasing agent.

Your objective is to decide which sources the agent can consult, what it can remember, what it must cite, and what it must refuse or escalate.

---

## Proposed situation

An organization wants to create an HR agent. It proposes indexing:

- the entire shared drive;
- HR procedures;
- HR emails;
- old Excel files;
- meeting notes;
- employee files.

The agent must answer employees and remember useful information for future conversations.

You must correct this approach.

---

## Expected deliverable

Complete this model.

```markdown
# RAG, Memory, and Context Strategy

## 1. Chosen agent
...

## 2. Agent objective
...

## 3. Authorized RAG sources
| Source | Owner | Status | Confidentiality | Access | Validity date |
|---|---|---|---|---|---|

## 4. Forbidden or excluded sources
...

## 5. Metadata to use
...

## 6. Chunking rules
...

## 7. Citation rules
...

## 8. Authorized session memory
...

## 9. Authorized durable memory
...

## 10. Data never to memorize
...

## 11. Access rights
...

## 12. Contradiction handling
...

## 13. Obsolete documents
...

## 14. Document prompt injection risks
...

## 15. Guardrails
...

## 16. Tests to run
...
```

---

## Constraints

Your strategy must:

- reject unfiltered indexing of the entire drive;
- favor validated sources;
- limit personal data;
- distinguish RAG, workflow state, and memory;
- plan citations;
- handle obsolete documents and contradictions;
- treat retrieved documents as data, not instructions;
- define what must be escalated.

---

## What Ella will evaluate

Ella will check whether you:

- select relevant sources;
- exclude risky sources;
- propose useful metadata;
- distinguish session memory and durable memory;
- limit sensitive data;
- plan citations and priority rules;
- add guardrails against injection;
- propose realistic tests.

---

## Hints

- RAG retrieves a source. Memory keeps information.
- A retrieved document is never a system instruction.
- A validated source is better than a full drive.
- A contradiction must be flagged or escalated.
- Durable memory should remain rare.
