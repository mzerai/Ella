---
course_id: ella_tech_agentic_ai_enterprise_workflows
course_title_fr: "IA agentique pour les workflows d’entreprise"
course_title_en: "Agentic AI for Enterprise Workflows"
lesson_id: "00_course_positioning"
lesson_number: 0
lesson_title_fr: "Comprendre l’IA agentique en entreprise"
lesson_title_en: "Understanding Agentic AI in the Enterprise"
pathway: "Tech"
secondary_pathway: "Leadership"
level: "Intermediate-Advanced"
language: "en"
encoding: "UTF-8"
delivery_modes:
  instructor_led: "3 days / 24h for the full course"
  self_paced: "14 to 20h for the full course"
checkpoint_mode: "dynamic"
lab_next: "00_diagnose_fake_agent_lab"
---

# Lesson 0 — Understanding Agentic AI in the Enterprise

## Lesson objective

Welcome to this learning path on agentic AI in the enterprise.

You may already have used ChatGPT, Claude, Copilot, or an internal assistant. You may also have seen demos of agents that can read documents, call tools, write an email, create a ticket, retrieve information, or coordinate several steps.

This course will help you move beyond hype.

You will learn to distinguish a chatbot, an assistant, an automated workflow, an AI agent, and a multi-agent system. Most of all, you will learn how to design an agent that is useful, governed, traceable, and secure inside a real enterprise process.

---

## 1. Why agentic AI is arriving now

Generative AI started with simple uses: ask a question, draft a text, summarize a document, rewrite a message, or produce a first analysis.

These uses remain useful. But they are not enough when work requires several steps.

Example:

- understand a customer request;
- find the right procedure;
- check access rights;
- consult a history;
- create a ticket;
- draft a response;
- request human validation;
- record the action in a system.

An AI agent appears when the system does more than answer. It can pursue a goal, use tools, keep work state, delegate to another component, and produce a controlled action.

OpenAI describes agents as applications that can plan, call tools, collaborate across specialists, and keep enough state to complete multi-step work. Anthropic recommends building agentic systems progressively, from simple workflows toward more autonomous agents, rather than starting with complex architectures.

---

## 2. The word “agent” is often used too quickly

In the current market, many solutions are called “agents” even though they are only chatbots with a more modern name.

You must therefore learn to diagnose the real level of agency.

### Chatbot

A chatbot answers a question.

Example:

> “What is the expense reimbursement procedure?”

It can be useful, but it does not act.

### AI assistant

An assistant helps produce a deliverable.

Example:

> “Prepare a customer response email from these elements.”

It helps the user, but the user still drives everything.

### Automated workflow

A workflow executes defined steps.

Example:

> When a form is received, create a ticket, notify the team, and archive the file.

The workflow is useful, but it follows fixed logic.

### AI agent

An agent pursues a goal inside a defined frame. It can choose some steps, call tools, handle exceptions, request validation, and produce a traceable action.

Example:

> Analyze a customer request, find the applicable policy, check missing information, prepare a response, create a ticket if needed, and request validation before sending.

### Multi-agent system

Several specialized agents collaborate or hand off work.

Example:

- triage agent;
- legal agent;
- support agent;
- quality agent;
- supervisor agent.

A multi-agent system is relevant only when complexity justifies it. Otherwise, it adds risk and maintenance.

---

## 3. In the enterprise, an agent is not autonomous by default

The word “agent” can suggest full autonomy. That is not the right goal in a professional context.

An enterprise agent must be controlled by design.

It must have:

- a clear objective;
- limited scope;
- authorized tools;
- authorized data;
- forbidden actions;
- human validations;
- logs;
- escalation rules;
- stop criteria;
- supervision.

An agent that can read everything, decide everything, and execute everything is not powerful. It is an operational risk.

The right question is not:

> How do we make the agent autonomous?

The right question is:

> What level of autonomy is acceptable for this workflow, this data, and this decision?

---

## 4. Why this course matters for Tunisian organizations

In many Tunisian organizations, processes are partly digitalized.

You may find:

- procedures in Word or PDF documents;
- approvals by email;
- data in Excel;
- information in an ERP;
- exchanges in Teams or WhatsApp;
- requests in a ticketing tool;
- business rules known by a few people;
- scattered customer, HR, student, or supplier files.

This is exactly where AI agents can create value. They can help connect steps, reduce repetitive tasks, prepare responses, check files, route requests, or assist employees.

But this context also creates risks.

As soon as an agent accesses emails, HR files, CRM, ERP, financial documents, customer data, or student files, it may touch personal or confidential data. In Tunisia, Organic Law No. 2004-63 recognizes personal data protection as a fundamental right. This reality must guide agent design from the start.

---

## 5. Good use cases for enterprise agents

A good agentic use case is not only a long task. It is a structured, repetitive, tool-based, and controllable task.

### Good candidates

- support ticket triage;
- HR procedure assistant;
- customer response preparation;
- administrative file checking;
- admission or registration assistant;
- supplier request analysis;
- meeting minutes preparation;
- regulatory monitoring with validation;
- document compliance support;
- IT assistant for recurring incidents.

### Poor first candidates

- automatic HR decision;
- financial approval without control;
- customer response sent without review;
- free access to all internal data;
- agent modifying an ERP without guardrails;
- agent acting on sensitive files without logging.

The right first agent must be useful, limited, observable, and reversible.

---

## 6. Components of an enterprise agent

In this course, you will learn to design an agent from simple components.

### Objective

What the agent must achieve.

Example:

> Help the support team qualify incoming requests and propose a first response.

### Instructions

Behavior rules.

Examples:

- do not invent;
- cite sources;
- request human validation before sending;
- refuse out-of-scope requests;
- escalate sensitive cases.

### Tools

Actions the agent can call.

Examples:

- search a knowledge base;
- read a ticket;
- create a draft;
- check a status;
- generate a summary;
- notify a human.

### Context and memory

Information useful for the task.

Examples:

- ticket history;
- user profile;
- internal policy;
- procedure document;
- latest exchanges.

### Guardrails

Protections.

Examples:

- permissions;
- human validation;
- data limits;
- logs;
- confidence thresholds;
- blocking dangerous actions.

### Evaluation

How you verify that the agent works.

Examples:

- accuracy;
- escalation rate;
- time saved;
- tool errors;
- user satisfaction;
- rule compliance.

---

## 7. Course thread

Your course thread is simple:

> Design an enterprise AI agent that acts in a real workflow, with authorized tools, controlled data, guardrails, and human supervision.

You will progress through eight steps:

1. understand what an agent is;
2. break down its components;
3. map a business workflow;
4. define tools and permissions;
5. design RAG and memory;
6. choose an architecture;
7. secure and govern;
8. evaluate and prepare a pilot.

---

## 8. What you will be able to do by the end

By the end of the course, you should be able to:

1. distinguish chatbot, assistant, automated workflow, agent, and multi-agent system;
2. assess whether a use case really needs an agentic approach;
3. describe the components of an enterprise agent;
4. map a business workflow;
5. define tools, data, permissions, and authorized actions;
6. choose a simple architecture before a complex one;
7. identify risks linked to data, tools, decisions, and permissions;
8. define guardrails: human validation, logs, limits, escalation, and rollback;
9. build an evaluation plan;
10. prepare an agentic pilot roadmap.

The goal is not to create a spectacular agent. The goal is to design an agent that truly helps the organization without putting its data, processes, or users at risk.

---

## 9. Course labs

Each lesson will include a lab.

### Lab 0 — Diagnose a fake agent

You will receive several cases: FAQ chatbot, RAG assistant, automated workflow, tool-using agent, multi-agent system. You will classify them and justify your answer.

### Lab 1 — Break down an agent

You will identify the objective, tools, context, actions, validations, and limits of an internal support agent.

### Lab 2 — Map an agentic workflow

You will transform a business process into a controlled workflow: steps, exceptions, human validation, outputs.

### Lab 3 — Specify agent tools

You will define the tools an agent can call, with inputs, outputs, permissions, errors, and limits.

### Lab 4 — Design RAG and memory

You will choose knowledge sources, access rules, allowed memory, forbidden data, and citation rules.

### Lab 5 — Choose the architecture

You will compare a deterministic workflow, a single tool-using agent, and a multi-agent system.

### Lab 6 — Agentic risk review

You will analyze the risks of an agent that accesses emails, tickets, HR documents, or CRM data.

### Lab 7 — Evaluation plan

You will build test scenarios: standard cases, edge cases, unavailable tool, forbidden request, prompt injection, insufficient permission.

### Final lab — Agentic roadmap

You will design a governed enterprise agent: objective, workflow, tools, data, architecture, risks, guardrails, KPIs, and pilot.

---

## 10. What this course is not

This course is not a course about AI gadgets.

It is not a list of trendy tools.

It is not a promise that autonomous agents will replace enterprise processes.

This course teaches you how to design useful, cautious, and integrable agents.

In a professional context, the right architecture is often the simplest one that meets the need with an acceptable level of risk.

---

## Key takeaways

An enterprise AI agent is not a smarter chatbot.

It is a controlled software actor that can act in a workflow, use tools, follow rules, request validation, and leave traces.

Value does not come from maximum autonomy. It comes from the right autonomy, in the right place, with the right guardrails.

---

## Ella checkpoint context

### Pedagogical intent

Ella should verify that the learner understands the difference between chatbot, assistant, automated workflow, AI agent, and multi-agent system.

The checkpoint should avoid pure definition. It should push the learner to reason through enterprise examples and justify the real level of agency.

### Suggested situation for dynamic checkpoint generation

Ella can present four mini-cases:

1. a chatbot answering HR questions;
2. a workflow that automatically creates a ticket when a form is submitted;
3. an assistant that searches a knowledge base and drafts a response;
4. an agent that analyzes a request, consults tools, prepares an action, requests validation, and logs the result.

Ella asks the learner to classify each case and explain the criteria used.

### What a good answer should contain

A good answer should mention:

1. the difference between response and action;
2. the role of tools;
3. the role of workflow;
4. the level of autonomy;
5. the need for human validation for sensitive actions;
6. traceability.

### Common mistakes to detect

- Calling every LLM-based system an “agent.”
- Confusing automated workflow with AI agent.
- Thinking that more autonomy is always better.
- Forgetting permissions and data.
- Forgetting human validation.
- Forgetting logs and audit.

### Possible Socratic follow-ups

- “Does the system only answer, or does it act in a workflow?”
- “Which tools can it call?”
- “Who validates the sensitive action?”
- “Which data can the agent read?”
- “How do you know what the agent did?”
- “Why might a simple workflow be enough here?”

### Validation criteria

Ella can validate if the learner:

- correctly classifies the cases;
- explains the difference between assistant, workflow, and agent;
- identifies the role of tools;
- mentions the level of autonomy;
- introduces at least one guardrail;
- avoids generic claims about “agents that do everything.”

---

## Transition to Lab 0

You are ready for the first lab.

Your mission will be to diagnose several “fake agents” and explain what is missing to make them true enterprise agents.

---

## References

1. OpenAI. **Agents SDK documentation**.  
   https://developers.openai.com/api/docs/guides/agents

2. OpenAI. **A practical guide to building AI agents**.  
   https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/

3. Anthropic. **Building effective AI agents**. 2024.  
   https://www.anthropic.com/research/building-effective-agents

4. Anthropic. **Writing effective tools for AI agents**. 2025.  
   https://www.anthropic.com/engineering/writing-tools-for-agents

5. NIST. **AI Risk Management Framework (AI RMF 1.0)**.  
   https://www.nist.gov/itl/ai-risk-management-framework

6. Republic of Tunisia. **Organic Law No. 2004-63 of July 27, 2004, on the protection of personal data**.  
   https://www.ins.tn/sites/default/files/2020-04/Loi%2063-2004%20Fr.pdf
