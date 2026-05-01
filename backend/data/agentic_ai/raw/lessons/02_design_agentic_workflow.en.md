---
course_id: ella_tech_agentic_ai_enterprise_workflows
course_title_fr: "IA agentique pour les workflows d’entreprise"
course_title_en: "Agentic AI for Enterprise Workflows"
lesson_id: "02_design_agentic_workflow"
lesson_number: 2
lesson_title_fr: "Concevoir un workflow agentique"
lesson_title_en: "Designing an Agentic Workflow"
pathway: "Tech"
secondary_pathway: "Leadership"
level: "Intermediate-Advanced"
language: "en"
encoding: "UTF-8"
delivery_modes:
  instructor_led: "3 days / 24h for the full course"
  self_paced: "14 to 20h for the full course"
checkpoint_mode: "dynamic"
lab_next: "02_map_agentic_workflow_lab"
---

# Lesson 2 — Designing an Agentic Workflow

## Lesson objective

In the previous lesson, you decomposed an agent into components: objective, instructions, tools, context, permissions, logs, and guardrails.

Now you need to place that agent inside a workflow.

An enterprise agent should not float above the organization. It must act in a real work sequence: request, analysis, search, decision, validation, action, traceability, and follow-up.

Your objective in this lesson:

> Transform a business process into a controlled agentic workflow.

You will learn how to model steps, decisions, exceptions, human validations, and expected outputs.

---

## 1. An agentic workflow starts from real work

Do not start with the agent. Start with the real work.

Ask these questions first:

- Who makes the request?
- Where does the request arrive?
- Who handles it today?
- Which information is needed?
- Which business rules apply?
- Which decisions are made?
- Which tools are used?
- Which validations are needed?
- Which errors occur often?
- Which trace must remain?

An agent should not create a parallel process. It should improve an existing process or help build a better-controlled process.

In Tunisian organizations, many workflows still combine email, Excel files, forms, calls, messages, and informal approvals. The agent can help, but it must first reveal the real workflow.

---

## 2. Automated workflow or agentic workflow?

An automated workflow follows fixed steps.

Example:

> If a form is submitted, create a ticket, send a notification, archive the file.

This is useful when cases are predictable and rules are stable.

An agentic workflow adds controlled reasoning.

Example:

> Read the request, identify the problem type, find the applicable procedure, check missing information, propose a response, request human validation if the case is sensitive, then record the action.

An agentic workflow is useful when the task includes:

- varied cases;
- incomplete information;
- triage decisions;
- exceptions;
- document retrieval;
- multiple tools;
- human validations;
- rules that depend on context.

Anthropic recommends starting with simple, composable workflows before moving toward more autonomous agents. OpenAI also notes that agents can plan, call tools, collaborate across specialists, and keep work state to complete multi-step tasks.

---

## 3. Golden rule: keep the critical path under control

An agentic workflow must be readable.

If you cannot explain the path followed by the agent, you cannot audit it.

The critical path should follow this logic:

> input → qualification → context retrieval → action choice → validation → execution → trace → follow-up.

### Simple example

Employee request:

> “I cannot access the payroll application.”

Possible workflow:

1. receive the request;
2. identify the category: application access;
3. check whether the user belongs to the right department;
4. search the support procedure;
5. request missing information;
6. prepare a response;
7. create a note in the ticket;
8. escalate if the issue touches user rights;
9. log tools used.

The agent does not do “everything.” It follows a controlled sequence.

---

## 4. Steps of an agentic workflow

You can model an agentic workflow in eight blocks.

### 1. Trigger

What starts the workflow?

Examples:

- ticket received;
- email received;
- form submitted;
- document uploaded;
- system alert;
- user request in a chatbot;
- event in an ERP or CRM.

### 2. Qualification

The system understands the nature of the request.

Examples:

- category;
- urgency;
- department concerned;
- sensitivity level;
- possible action;
- validation need.

### 3. Context collection

The agent gathers required information.

Examples:

- ticket;
- history;
- procedure;
- user profile;
- order status;
- internal policy;
- supporting document.

### 4. Action choice

The agent chooses the next step inside the authorized frame.

Examples:

- answer;
- request information;
- create a draft;
- escalate;
- call a tool;
- stop the workflow.

### 5. Validation

Some actions require a human.

Examples:

- external sending;
- financial decision;
- HR processing;
- status modification;
- access to sensitive data;
- regulatory response.

### 6. Execution

The action is executed by the agent or by a human.

Examples:

- create a note;
- generate a draft;
- open a task;
- notify a manager;
- classify a ticket;
- update a status if authorized.

### 7. Trace

The system keeps evidence.

Examples:

- tool called;
- data consulted;
- result produced;
- validation received;
- error encountered;
- prompt or model version.

### 8. Follow-up

The workflow is not complete if nobody follows the result.

Examples:

- ticket solved;
- request escalated;
- deadline exceeded;
- response validated;
- user satisfied;
- error corrected.

---

## 5. Decision points

An agentic workflow is not a straight line.

It contains decision points.

Examples:

- Is the request complete?
- Is the topic sensitive?
- Does the requester have access rights?
- Does the procedure exist?
- Are the sources sufficient?
- Can the agent answer, or should it escalate?
- Is the action reversible?
- Is human validation mandatory?

Each decision point must have a rule.

### Poor rule

> The agent decides based on context.

Too vague.

### Good rule

> If the request involves salaries, sanctions, personal data, security, or user rights, the agent does not answer directly. It prepares a summary and escalates to an authorized human.

A good rule limits autonomy in the right place.

---

## 6. Exceptions: where agents must be cautious

Real workflows include exceptions.

An agent must know what to do when:

- the procedure is missing;
- two sources contradict each other;
- the user requests a forbidden action;
- the external tool fails;
- data is missing;
- confidence is low;
- the request contains sensitive data;
- the request is out of scope;
- the user insists on bypassing a rule.

The right answer is not to invent.

The right answer is to:

- request information;
- state uncertainty;
- refuse;
- escalate;
- stop;
- create a note for human review.

A reliable agent is not the one that always answers. It is the one that knows when not to act.

---

## 7. Human-in-the-loop: define the right moment

Human validation should not be placed everywhere. Otherwise the workflow becomes heavy.

It should be placed at the right points.

### Validation before external action

Example: send a customer email.

### Validation before modification

Example: change a CRM status.

### Validation before sensitive decision

Example: reject a request, classify a severe complaint, process HR data.

### Validation in case of uncertainty

Example: contradictory sources or missing procedure.

### Validation by sampling

Example: review 10% of low-risk answers during the pilot.

A good workflow balances productivity and control.

---

## 8. Example: internal support agentic workflow

### Problem

Employees send support requests by email or ticket. Requests are poorly categorized. Responses are sometimes slow. Procedures are scattered.

### Workflow objective

Qualify the request, find the applicable procedure, prepare a response, and escalate sensitive cases.

### Proposed workflow

1. The ticket arrives.
2. The agent reads the ticket.
3. It classifies the request: IT, HR, finance, administration, security, or other.
4. It evaluates sensitivity: low, medium, high.
5. It searches the applicable procedure in the knowledge base.
6. It identifies missing information.
7. It prepares a response or a request for clarification.
8. It creates an internal note in the ticket.
9. It requests validation if the response touches a sensitive topic.
10. It logs sources and tools used.

### Authorized actions

- classify the ticket;
- search a procedure;
- write a draft;
- create an internal note;
- propose escalation.

### Forbidden actions during the pilot

- close the ticket;
- send an external response without validation;
- modify access rights;
- process a sensitive HR file;
- delete data.

This workflow is controlled. It creates value without giving too much power to the agent.

---

## 9. Tunisian example: admission or registration assistant

In a Tunisian school or university, admission or registration requests may arrive through forms, phone calls, email, social networks, or on-site visits.

They may concern:

- admission conditions;
- required documents;
- deadlines;
- fees;
- equivalence;
- scholarships;
- housing;
- international status;
- program change;
- missing documents.

An agent can help qualify requests and prepare responses. But it should not make admission, exception, or financial decisions alone.

### Cautious agentic workflow

1. Receive the request.
2. Identify the profile: baccalaureate student, bachelor student, international student, parent, other.
3. Identify the topic: admission, documents, payment, housing, orientation.
4. Search published or validated rules.
5. Prepare a sourced response.
6. Request missing information.
7. Escalate sensitive cases: equivalence, financial situation, special case, exception.
8. Log the proposed response and sources.

This case shows an important principle: the agent can speed up guidance, but the institutional decision remains human.

---

## 10. Map with a simple table

You do not need a complex tool to start.

Use a table.

| Step | Input | Agent action | Tool | Decision | Validation | Output |
|---|---|---|---|---|---|---|
| 1 | Ticket received | Read request | read_ticket | Category? | No | Ticket summary |
| 2 | Ticket summary | Search procedure | search_kb | Source found? | No | Sources |
| 3 | Sources | Draft response | draft_response | Sensitive? | Yes if sensitive | Draft |
| 4 | Draft | Create note | create_note | Action authorized? | No | Internal note |
| 5 | Sensitive case | Escalate | escalate | Responsible? | Yes | Escalated ticket |

This table becomes the base for technical integration.

It helps Codex, Claude Code, or Antigravity understand the expected workflow.

---

## 11. Where to place the LLM?

Not every step should be handled by the LLM.

The LLM is useful for:

- understanding a request;
- summarizing;
- extracting information;
- classifying;
- rewriting;
- preparing a draft;
- comparing sources;
- proposing the next action.

Classic code is better for:

- checking permission;
- applying a strict rule;
- calculating an amount;
- checking a date;
- blocking a forbidden action;
- writing into a database;
- logging;
- calling an API.

Practical rule:

> Let the LLM handle ambiguity. Let code handle strict rules.

A solid agentic workflow combines both.

---

## 12. Deterministic or agentic?

You must choose the right level of flexibility.

### Deterministic workflow

Suitable when steps are known and rules are stable.

Example: form → ticket → notification → archive.

### Controlled agentic workflow

Suitable when the request varies and requires interpretation.

Example: multi-topic support request with procedure search and sensitivity assessment.

### More autonomous agent

Suitable when the objective is open and the agent must decide among several possible steps.

Example: analyze a complex file, coordinate several tools, and produce a decision summary for validation.

Always start with the simplest level that solves the problem.

---

## 13. Workflow outputs

An output must be usable.

Poor outputs:

- “Here is a response.”
- “The ticket seems urgent.”
- “This should be checked.”

Good outputs:

- category;
- priority level;
- source used;
- missing information;
- response draft;
- recommended action;
- reason for escalation;
- suggested owner;
- trace of tools called.

A good output allows the workflow to continue.

---

## 14. Evaluate the workflow, not only the answer

An agent can write a good sentence and still run a poor workflow.

You must evaluate:

- correct classification;
- right source retrieved;
- missing information detected;
- appropriate escalation;
- forbidden action blocked;
- human validation requested at the right moment;
- complete logs;
- tool errors handled well;
- time saved;
- user satisfaction.

Evaluation must cover normal cases and difficult cases.

---

## Key takeaways

An agentic workflow is not an improvising agent.

It is a controlled sequence that combines:

> trigger → qualification → context → choice → validation → action → trace → follow-up.

Your role is to decide which steps go to the LLM, which steps remain deterministic, which actions require a human, and which traces must remain.

A good agentic workflow gives flexibility without losing control.

---

## Ella checkpoint context

### Pedagogical intent

Ella should verify that the learner can transform a business process into a controlled agentic workflow.

The checkpoint should ask the learner to structure steps, decisions, tools, validations, and outputs.

### Suggested situation for dynamic checkpoint generation

Ella can propose this scenario:

> An organization receives internal requests by ticket. Requests may concern IT, HR, finance, or administration. Some requests are simple. Others contain sensitive data. Management wants an agent that automatically handles tickets.

Ella asks the learner to design a cautious agentic workflow:

- trigger;
- qualification;
- context;
- tools;
- decisions;
- human validations;
- authorized actions;
- outputs;
- logs;
- escalation cases.

### What a good answer should contain

A good answer should mention:

1. workflow steps;
2. decision points;
3. required tools;
4. separation between reading and writing;
5. human validation for sensitive cases;
6. usable outputs;
7. traceability.

### Common mistakes to detect

- Saying only “the agent handles the ticket.”
- Forgetting exceptions.
- Forgetting human validations.
- Giving the LLM strict rules that should be coded.
- Allowing sending or modification without control.
- Forgetting logs.
- Forgetting sensitive data.

### Possible Socratic follow-ups

- “What is the exact workflow trigger?”
- “Which step should remain deterministic?”
- “When must a human validate?”
- “Which action can the agent take alone?”
- “What happens if the procedure does not exist?”
- “Which output allows the workflow to continue?”

### Validation criteria

Ella can validate if the learner:

- produces a structured workflow;
- identifies decisions and exceptions;
- connects tools to steps;
- limits autonomy;
- adds human validation;
- plans logs;
- defines useful outputs.

---

## Transition to Lab 2

You are ready for Lab 2.

Your mission will be to map an agentic workflow for a business process: support, HR, finance, admission, purchasing, or compliance.

---

## References

1. OpenAI. **Agents SDK documentation**.  
   https://developers.openai.com/api/docs/guides/agents

2. OpenAI. **A practical guide to building AI agents**.  
   https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/

3. OpenAI Agents SDK. **Handoffs**.  
   https://openai.github.io/openai-agents-python/handoffs/

4. Anthropic. **Building effective AI agents**. 2024.  
   https://www.anthropic.com/research/building-effective-agents

5. Anthropic. **Writing effective tools for AI agents**. 2025.  
   https://www.anthropic.com/engineering/writing-tools-for-agents

6. NIST. **AI Risk Management Framework (AI RMF 1.0)**.  
   https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf

7. Republic of Tunisia. **Organic Law No. 2004-63 of July 27, 2004, on the protection of personal data**.  
   https://www.ins.tn/sites/default/files/2020-04/Loi%2063-2004%20Fr.pdf
