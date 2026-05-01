---
course_id: ella_tech_agentic_ai_enterprise_workflows
course_title_fr: "IA agentique pour les workflows d’entreprise"
course_title_en: "Agentic AI for Enterprise Workflows"
lesson_id: "01_anatomy_of_enterprise_ai_agent"
lesson_number: 1
lesson_title_fr: "Anatomie d’un agent IA d’entreprise"
lesson_title_en: "Anatomy of an Enterprise AI Agent"
pathway: "Tech"
secondary_pathway: "Leadership"
level: "Intermediate-Advanced"
language: "en"
encoding: "UTF-8"
delivery_modes:
  instructor_led: "3 days / 24h for the full course"
  self_paced: "14 to 20h for the full course"
checkpoint_mode: "dynamic"
lab_next: "01_decompose_enterprise_agent_lab"
---

# Lesson 1 — Anatomy of an Enterprise AI Agent

## Lesson objective

In Lesson 0, you distinguished chatbot, assistant, automated workflow, AI agent, and multi-agent system.

In this lesson, you will open the black box.

An enterprise AI agent is not “an LLM with tools.” It is a system composed of several elements: objective, instructions, context, tools, work state, memory, permissions, guardrails, traces, and evaluation.

Your objective is simple:

> Be able to decompose an agent before building it.

If you cannot describe an agent’s components, you cannot secure it, test it, or integrate it into a real workflow.

---

## 1. An agent starts with an objective

An agent must pursue a clear objective.

Poor objective:

> Help customer service.

Too vague. Impossible to test.

Better objective:

> Qualify incoming customer service requests, propose a category, prepare a first response, and escalate sensitive cases to a human.

A good objective states:

- the task;
- the user;
- the scope;
- the expected output;
- the responsibility limit.

The agent should not “do anything useful.” It should accomplish a precise mission.

In an enterprise, the vaguer the objective, the higher the risk.

---

## 2. Instructions: the behavior contract

Instructions define what the agent must and must not do.

They act as a behavior contract.

Useful instructions:

- answer only from authorized sources;
- do not invent an internal policy;
- flag missing information;
- request human validation before external sending;
- refuse out-of-scope requests;
- mask unnecessary personal data;
- escalate sensitive topics;
- record important actions.

A vague instruction like “be helpful” is not enough.

A usable instruction should say how the agent behaves in normal, ambiguous, sensitive, and forbidden cases.

---

## 3. Context: what the agent needs to know

Context includes the information required for the task.

Examples:

- ticket content;
- customer history;
- internal procedure;
- order status;
- HR policy;
- user authorization level;
- latest email exchange;
- documents retrieved through RAG.

Context must be useful, authorized, and proportionate.

An agent should not receive all data “just in case.”  
It should receive what it needs for the task.

In the Tunisian context, this discipline matters. As soon as an agent processes personal data, the organization must consider Organic Law No. 2004-63 on the protection of personal data. The practical principle is clear: do not give the agent personal data if it is not necessary for the task.

---

## 4. Tools: what the agent can do

An agent becomes truly agentic when it can use tools.

A tool can allow the agent to:

- search a knowledge base;
- read a ticket;
- create a draft;
- open a CRM record;
- check an order status;
- create a task;
- send a notification;
- call an API;
- calculate an indicator;
- generate a report.

But a tool is not only a technical function. It is a responsibility.

For each tool, you must specify:

- what it does;
- what it does not do;
- which inputs it accepts;
- which outputs it returns;
- who can use it;
- which errors it can produce;
- whether it requires human validation;
- whether it writes into a system or only reads.

Anthropic stresses the importance of designing tools carefully, testing them with agents, and documenting them clearly. OpenAI also places tools at the heart of agentic applications that complete multi-step work.

---

## 5. Read and write: the critical difference

Not all tools have the same risk level.

### Read tool

It reads information.

Example:

> Search the reimbursement procedure.

Risk: the agent may access data it should not read.

### Write tool

It modifies a system.

Example:

> Create a ticket, update a CRM, send an email, change a status.

Risk: the agent may produce an incorrect action.

### External tool

It acts outside the immediate system.

Example:

> Send a customer message or notify a supplier.

Risk: the error becomes visible outside the organization.

Simple rule:

> The more a tool can write, modify, or communicate, the more control it requires.

An agent may sometimes read autonomously. It should rarely write without validation in a first pilot.

---

## 6. Work state: what the agent tracks during the task

An agent often works over several steps. It therefore needs to keep work state.

State can include:

- current step;
- information already collected;
- tools already called;
- errors encountered;
- hypotheses;
- validations received;
- next planned action;
- elements to escalate.

Without state, the agent may repeat an action, forget a constraint, or lose the thread.

OpenAI describes agents as able to keep enough state to complete multi-step work. This is an important difference from a simple chatbot.

---

## 7. Memory: be careful what you retain

Memory is different from work state.

State manages the current task.  
Memory keeps information beyond the task.

Possible memory examples:

- user preferences;
- project context;
- interaction history;
- reusable business rules;
- validated decisions.

But memory is risky if it keeps sensitive data without a framework.

You must decide:

- which memory is allowed;
- how long it is retained;
- who can view it;
- how it can be corrected;
- which data is forbidden;
- how the user is informed.

In an enterprise context, memory must be designed as a governed feature, not as a black box.

---

## 8. Permissions: the agent needs the minimum required

An agent should not have all rights.

It should have the minimum permissions needed for its mission.

Example: internal support agent.

Reasonable rights:

- read support procedures;
- read tickets in its scope;
- propose a category;
- prepare a draft;
- request validation.

Dangerous rights for a first pilot:

- read all tickets in the organization;
- modify a ticket without trace;
- send a customer response without validation;
- access HR files;
- delete data;
- modify user rights.

This is close to the security principle of least privilege: grant only the rights required, not more.

---

## 9. Guardrails: keep the agent inside the frame

Guardrails reduce risk.

They can be placed at several levels.

### Before action

- check permissions;
- filter sensitive data;
- block out-of-scope requests;
- request validation.

### During action

- limit available tools;
- impose an output format;
- verify sources;
- control API calls.

### After action

- log;
- review;
- measure;
- escalate;
- allow rollback.

OpenAI distinguishes guardrail mechanisms in agentic systems. But you should keep a broader rule: a guardrail is not only a technical filter. It is also an organizational decision.

---

## 10. Logs and traceability

An enterprise agent must leave traces.

You must be able to answer these questions:

- what request was received?
- which data was consulted?
- which tools were called?
- which response was produced?
- which action was proposed?
- who validated?
- which error appeared?
- which system version was used?

Without logs, you cannot audit, correct, or improve the agent.

Traceability becomes critical as soon as the agent touches decisions, customers, personal data, financial workflows, HR, or production systems.

---

## 11. Evaluation: test before trusting

An agent must be evaluated before deployment.

Testing two or three easy examples is not enough.

You must test:

- standard cases;
- ambiguous cases;
- missing data;
- forbidden request;
- unavailable tool;
- API error;
- unauthorized user;
- prompt injection attempt;
- request that requires human validation;
- incorrect but plausible output.

The NIST AI Risk Management Framework proposes AI risk management through Govern, Map, Measure, and Manage. For agents, this logic is useful: govern responsibilities, map risks, measure behavior, and manage failures.

---

## 12. Complete example: internal support agent

Take an agent for internal support.

### Objective

Qualify support requests, propose a category, search for a procedure, prepare a response, and escalate sensitive cases.

### Instructions

- do not invent a procedure;
- cite the source used;
- request validation before sending;
- escalate legal, HR, or security requests;
- do not process out-of-scope data.

### Context

- ticket content;
- requester identity;
- department;
- ticket history;
- support knowledge base;
- applicable SLA.

### Tools

- `search_knowledge_base`;
- `read_ticket`;
- `classify_ticket`;
- `draft_response`;
- `create_internal_note`;
- `escalate_to_human`.

### Permissions

- read only tickets in scope;
- do not close a ticket;
- do not send external responses;
- do not modify user rights.

### Guardrails

- human validation before external action;
- logs for every tool;
- blocking sensitive HR data;
- escalation if confidence is low;
- observation mode during the pilot.

### Evaluation

- correct classification rate;
- appropriate escalation rate;
- tool errors;
- time saved;
- support satisfaction;
- permission incidents.

This is a simple, useful, and controllable agent. It is often better than an agent that is too autonomous.

---

## 13. Agent anatomy checklist

Before designing an agent, complete this checklist.

| Element | Key question |
|---|---|
| Objective | What must the agent accomplish? |
| Scope | Where does its mission start and end? |
| Users | Who uses it? |
| Data | What data can it read? |
| Tools | Which tools can it call? |
| Actions | Can it write, modify, or send? |
| Permissions | Which rights are required? |
| Validation | What requires a human? |
| Logs | What must be traced? |
| Risks | What can go wrong? |
| Evaluation | How will you know it works? |
| Rollback | How do you return to the previous state? |

If you cannot fill in this checklist, your agent is not ready.

---

## Key takeaways

An enterprise AI agent is a system.

It is not just a model. It combines objective, instructions, context, tools, state, memory, permissions, guardrails, logs, and evaluation.

Your reflex should be:

> Before asking “which agent should we build?”, ask “which decision, which action, which data, which tools, and which risks?”

A good agent is not the one that does the most. It is the one that does what it should, inside the expected frame, with traces and controls.

---

## Ella checkpoint context

### Pedagogical intent

Ella should verify that the learner can decompose an enterprise agent into concrete components.

The checkpoint should avoid a theoretical question. It should ask the learner to analyze a use case and identify objective, tools, context, permissions, guardrails, and evaluation.

### Suggested situation for dynamic checkpoint generation

Ella can propose this scenario:

> An organization wants to create an internal support agent that receives employee requests, searches the knowledge base, proposes a response, and creates a note in the ticketing system. Management asks for the agent to be “autonomous.”

Ella asks the learner to specify:

- the real objective;
- required tools;
- authorized data;
- forbidden actions;
- human validations;
- required logs;
- evaluation criteria.

### What a good answer should contain

A good answer should mention:

1. a precise objective;
2. limited tools;
3. authorized data;
4. minimum permissions;
5. at least one human validation;
6. logs;
7. evaluation metrics.

### Common mistakes to detect

- Saying only “the agent should answer requests.”
- Giving access to all internal data.
- Allowing sending or modification without validation.
- Forgetting logs.
- Forgetting tool errors.
- Forgetting out-of-scope cases.
- Confusing memory and work state.

### Possible Socratic follow-ups

- “Which action can the agent take without a human?”
- “Which data is not necessary for this task?”
- “Which tool is the riskiest?”
- “What should be traced to audit the agent?”
- “When should the agent escalate to a human?”
- “How will you know it works better than a simple chatbot?”

### Validation criteria

Ella can validate if the learner:

- correctly decomposes the components;
- limits permissions;
- connects tools and decisions;
- adds guardrails;
- plans traceability;
- proposes realistic evaluation criteria.

---

## Transition to Lab 1

You are ready for Lab 1.

Your mission will be to decompose an internal support agent into usable components: objective, context, tools, permissions, guardrails, logs, and metrics.

---

## References

1. OpenAI. **Agents SDK documentation**.  
   https://developers.openai.com/api/docs/guides/agents

2. OpenAI. **A practical guide to building AI agents**.  
   https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/

3. OpenAI Agents SDK. **Guardrails**.  
   https://openai.github.io/openai-agents-python/guardrails/

4. Anthropic. **Building effective AI agents**. 2024.  
   https://www.anthropic.com/research/building-effective-agents

5. Anthropic. **Writing effective tools for AI agents**. 2025.  
   https://www.anthropic.com/engineering/writing-tools-for-agents

6. NIST. **AI Risk Management Framework (AI RMF 1.0)**.  
   https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf

7. Republic of Tunisia. **Organic Law No. 2004-63 of July 27, 2004, on the protection of personal data**.  
   https://www.ins.tn/sites/default/files/2020-04/Loi%2063-2004%20Fr.pdf
