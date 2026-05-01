---
course_id: ella_tech_agentic_ai_enterprise_workflows
lab_id: "03_specify_agent_tools_lab"
lab_title_fr: "Lab 3 — Spécifier les outils d’un agent"
lab_title_en: "Lab 3 — Specify Agent Tools"
language: "en"
encoding: "UTF-8"
target_score: 8
max_score: 10
---

# Lab 3 — Specify Agent Tools

## Mission

You must specify five tools for an enterprise agent.

The chosen agent can be:

- internal support agent;
- admission agent;
- HR agent;
- finance agent;
- purchasing agent;
- compliance agent;
- customer service agent.

Your objective is to produce tool sheets that are clear, limited, and securable.

---

## Proposed situation

An organization wants to create an internal support agent. The agent must:

- read a ticket;
- search a procedure;
- prepare a response;
- create an internal note;
- escalate sensitive cases.

Management proposes a single tool called:

```text
access_all_systems
```

You must reject this approach and propose specialized tools.

---

## Expected deliverable

Specify at least five tools with this model:

```markdown
# Agent Tool Specification

## Tool 1 — Name

### Objective
...

### Type
Read / Write / Send or trigger

### When to use it
...

### When not to use it
...

### Inputs
...

### Outputs
...

### Permissions
...

### Risks
...

### Guardrails
...

### Possible errors
...

### Logs to keep
...

### Human validation
...
```

---

## Possible expected tools

You may use or adapt these examples:

- `read_ticket_summary`
- `search_internal_policy`
- `draft_internal_response`
- `create_internal_note`
- `escalate_sensitive_case`
- `request_manager_approval`
- `log_agent_action`

---

## Constraints

Your tools must:

- be clearly named;
- have limited scope;
- separate reading and writing;
- avoid unnecessary personal data;
- check permissions on the system side;
- plan errors;
- log calls;
- request human validation for sensitive actions.

---

## What Ella will evaluate

Ella will check whether you:

- reject the overly broad tool;
- split tools correctly;
- define minimal inputs;
- define useful outputs;
- limit permissions;
- plan errors;
- add logs;
- place human validation at the right level.

---

## Hints

- A tool that “accesses everything” is dangerous.
- A read tool should return a limited summary.
- A write tool should be idempotent.
- An external action must be validated.
- The agent must never see API keys.
- A tool error must be visible, not hidden.
