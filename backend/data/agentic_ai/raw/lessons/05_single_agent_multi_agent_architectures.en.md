---
course_id: ella_tech_agentic_ai_enterprise_workflows
course_title_fr: "IA agentique pour les workflows d’entreprise"
course_title_en: "Agentic AI for Enterprise Workflows"
lesson_id: "05_single_agent_multi_agent_architectures"
lesson_number: 5
lesson_title_fr: "Architectures mono-agent et multi-agents"
lesson_title_en: "Single-Agent and Multi-Agent Architectures"
pathway: "Tech"
secondary_pathway: "Leadership"
level: "Intermediate-Advanced"
language: "en"
encoding: "UTF-8"
delivery_modes:
  instructor_led: "3 days / 24h for the full course"
  self_paced: "14 to 20h for the full course"
checkpoint_mode: "dynamic"
lab_next: "05_choose_agent_architecture_lab"
---

# Lesson 5 — Single-Agent and Multi-Agent Architectures

## Lesson objective

You now know how to define an agent, place it inside a workflow, specify its tools, and manage its context.

The next question is:

> Which architecture should you choose?

You can build a deterministic workflow, a single tool-using agent, a supervisor that calls specialist agents, a handoff system, or a more open multi-agent architecture.

This lesson teaches you how to choose the simplest architecture that solves the problem with an acceptable risk level.

---

## 1. The trap: choosing an architecture that is too complex

The market talks a lot about multi-agent systems. This can make it seem that a real agentic project must combine several agents.

That is false.

A complex architecture adds:

- more prompts;
- more tools;
- more possible paths;
- more cost;
- more latency;
- more error risk;
- more logs to interpret;
- more tests;
- more maintenance.

The right question is not:

> How many agents can we create?

The right question is:

> What is the minimal architecture that achieves the objective, with control, traceability, and quality?

Anthropic recommends starting with simple, composable workflows. OpenAI also recommends configuring a single agent cleanly before growing the workflow into more advanced patterns.

---

## 2. The five architectures to know

You should know five patterns.

### 1. Deterministic workflow with LLM steps

The workflow follows fixed steps. The LLM is used for specific tasks: classification, summary, extraction, draft.

Example:

> Ticket received → LLM classification → procedure search → LLM draft → human validation → internal note.

This is often the best starting point.

### 2. Single agent with tools

One agent receives an objective and chooses from a small set of tools.

Example:

> Internal support agent with `read_ticket`, `search_policy`, `draft_response`, `create_note`, `escalate`.

The architecture remains readable if the objective is precise and the tools are limited.

### 3. Router to specialized agents

A first agent or component classifies the request and sends it to a specialist.

Example:

> Router → HR agent, IT agent, finance agent, admission agent.

Useful when domains are distinct and each specialist has its own rules and sources.

### 4. Supervisor with agents as tools

A main agent remains responsible for the result. It calls specialized agents as tools.

Example:

> Support supervisor → document-search agent → compliance agent → drafting agent.

OpenAI describes this pattern with the idea of using agents as tools for manager-style workflows. The supervisor remains responsible for the final answer.

### 5. Handoffs between agents

An agent transfers the task to another agent. The new agent takes over.

Example:

> General support agent → transfer to refund agent → transfer to dispute agent.

OpenAI presents handoffs as a mechanism that lets an agent delegate a task to another specialized agent.

This pattern is useful when responsibility must move from one domain to another. It requires strict boundary design.

---

## 3. Deterministic workflow: the safest place to start

A deterministic workflow is suitable when steps are known.

### Example

An admission agent must handle a simple request:

1. identify the profile;
2. search admission conditions;
3. list required documents;
4. prepare a response;
5. request validation before sending.

The path is stable. The agent does not need to decide freely.

### Advantages

- easy to test;
- easy to audit;
- predictable costs;
- lower risk;
- better enterprise system integration;
- clear logic for business teams.

### Limits

- less flexible;
- less suitable for complex files;
- requires good process modeling.

### When to choose it

Choose this pattern if:

- the process is known;
- rules are stable;
- sensitive actions are limited;
- you are launching a first pilot;
- you need to reassure teams.

In ELLA, this pattern should be presented as a strong option, not as a less advanced solution.

---

## 4. Single agent with tools: simple, but monitor it

A single tool-using agent is relevant when requests vary and the path is not fully fixed.

### Example

An internal support agent receives varied requests. It must choose between:

- read the ticket;
- search a procedure;
- request information;
- prepare a draft;
- create a note;
- escalate.

### Advantages

- more flexible than a fixed workflow;
- still readable;
- less coordination than a multi-agent system;
- good compromise for a pilot.

### Risks

- wrong tool selection;
- useless loop;
- excessive tool use;
- missed escalation;
- hard-to-explain path;
- write action triggered too early.

### Guardrails

- small number of tools;
- explicit tool names;
- system-side permissions;
- iteration limits;
- human validation for sensitive actions;
- detailed logs;
- observation mode at the start.

Choose this pattern if the workflow needs interpretation, but not a full team of agents.

---

## 5. Router to specialists: clarify domains

The router pattern works well when requests belong to distinct domains.

### Example

An organization receives internal requests:

- IT;
- HR;
- finance;
- administration;
- security.

A router classifies the request. Then it sends it to the right specialist agent.

### Advantages

- clear specialization;
- more targeted prompts;
- separated sources;
- different permissions by domain;
- better control of sensitive topics.

### Risks

- wrong routing;
- domain conflict;
- sensitive case sent to the wrong agent;
- fragmented responsibility;
- duplicate context.

### Guardrails

- explicit routing rules;
- “uncertain” category;
- escalation if sensitivity is high;
- routing logs;
- edge-case tests;
- prohibition on out-of-domain handling.

This pattern fits organizations with several clearly separated processes.

---

## 6. Supervisor with agents as tools

In this pattern, a main agent keeps control. It calls specialist agents to help.

OpenAI describes this as a manager-style workflow: the main agent remains responsible and calls specialists as tools.

### Example

A supervisor handles a customer complaint.

It can call:

- document agent to search policy;
- compliance agent to identify risks;
- drafting agent to prepare a response;
- quality agent to check tone.

The supervisor synthesizes and produces the final output.

### Advantages

- centralized control;
- specialization;
- better final coherence;
- less transfer of responsibility than a full handoff.

### Risks

- higher cost;
- latency;
- inconsistency between specialists;
- dependency on the supervisor;
- harder testing of all combinations.

### When to choose it

Choose this pattern if:

- the task requires several areas of expertise;
- the final output must remain coherent;
- the supervisor must keep responsibility;
- specialist agents can be treated as bounded tools.

This pattern is often better than a free multi-agent system.

---

## 7. Handoffs: transferring responsibility

A handoff transfers the task to another agent. The second agent takes over.

### Example

A general support agent receives a reimbursement request. It transfers the task to a finance agent.

The new agent uses its sources, rules, and tools.

### Advantages

- useful when the domain changes;
- fits organizations with specialized teams;
- limits each agent’s tools;
- each agent can have its own instructions.

### Risks

- context loss;
- transfer to the wrong agent;
- missing validation at transfer time;
- logs that are hard to read;
- unclear responsibility;
- different guardrails across agents.

OpenAI states that handoffs allow an agent to delegate to another specialized agent. In practice, you must define exactly when transfer is allowed.

### Questions to ask

- Who can initiate the handoff?
- Which context is transferred?
- Which context must not be transferred?
- Who becomes responsible?
- How is the transfer logged?
- How do you roll back?
- When is human validation required?

Use handoffs when the domain shift is real. Do not use them to make the architecture look elegant.

---

## 8. Orchestrator-workers: decompose a complex task

Anthropic describes an orchestrator-workers pattern: an orchestrator breaks down a task, delegates to workers, and synthesizes the results.

### Example

Prepare a document compliance analysis:

- worker 1 finds the rule;
- worker 2 extracts obligations;
- worker 3 compares the file;
- worker 4 identifies gaps;
- orchestrator synthesizes.

### Advantages

- useful for complex tasks;
- good work separation;
- possible parallel processing;
- specialist subtasks.

### Risks

- coordination difficulty;
- contradictory results;
- synthesis errors;
- high cost;
- over-architecture risk.

This pattern should be reserved for tasks that justify this complexity.

---

## 9. Evaluator-optimizer: improve an output

Another useful pattern produces an output, then has a second component evaluate it.

### Example

An agent drafts a customer response. An evaluator checks:

- accuracy;
- tone;
- compliance;
- cited source;
- sensitive data;
- escalation need.

If evaluation fails, the output is corrected or sent to a human.

### Advantages

- improves quality;
- reduces some errors;
- useful for sensitive responses;
- simple to add to a workflow.

### Risks

- evaluator can be wrong;
- extra cost;
- false sense of safety;
- need for precise criteria.

This pattern is useful, but it does not replace human validation for sensitive actions.

---

## 10. Choose architecture according to risk

Architecture choice depends on risk level.

| Situation | Recommended architecture |
|---|---|
| Stable process, clear rules | Deterministic workflow with LLM steps |
| Varied requests, limited tools | Single agent with tools |
| Separate domains | Router to specialists |
| Multiple expertise areas, single final output | Supervisor with agents as tools |
| Real domain transfer | Handoffs |
| Complex task to decompose | Orchestrator-workers |
| Sensitive output to control | Evaluator-optimizer + human if needed |

Do not choose an architecture for prestige. Choose it for fit with risk and decision.

---

## 11. Decision criteria

Use these criteria.

### Task complexity

Does the task have a stable path or several possible paths?

### Data sensitivity

Do agents access personal, financial, HR, or customer data?

### Action impact

Does the agent read, write, send, or trigger a decision?

### Need for specialization

Can one agent handle the subject, or are several domains required?

### Traceability

Can you explain what happened?

### Cost and latency

Does the system need to answer quickly? Are costs controlled?

### Testability

Can you test main paths and edge cases?

### Maintenance

Can the team maintain prompts, tools, sources, and logs?

An architecture that is hard to test should be treated as risky.

---

## 12. Tunisian case: university group or large enterprise

Imagine a Tunisian group with several departments: admissions, student affairs, finance, HR, IT, and communication.

Management wants one agent that answers everything.

### Analysis

This is risky.

Domains do not share the same data, rules, rights, or responsibilities.

An admission request should not be handled like an HR request. A finance question may contain sensitive data. An IT request may involve access rights.

### Cautious architecture

For a first pilot:

1. deterministic workflow or single agent on one domain;
2. scope: admission or internal support;
3. limited tools;
4. validated RAG;
5. no official action without validation;
6. complete logs;
7. escalation to a human.

For a more mature version:

- domain router;
- specialist agents;
- supervisor;
- controlled handoffs;
- permissions by domain;
- audit dashboard.

The right path is progressive.

---

## 13. Responsibility and supervision

The more agents you add, the more responsibility must be explicit.

You must define:

- who owns the system;
- who owns each agent;
- who validates sources;
- who validates tools;
- who reads logs;
- who handles errors;
- who stops the system;
- who updates prompts;
- who decides to scale.

The NIST AI RMF emphasizes governance as a cross-cutting function for AI risk management. For multi-agent architectures, this governance becomes even more important.

---

## 14. Traces and observability

A multi-agent architecture must be observable.

You must trace:

- agent called;
- reason for call;
- input transferred;
- output produced;
- tools called;
- handoff performed;
- human validation;
- errors;
- cost;
- latency;
- prompt version;
- model version.

Without observability, you cannot understand why the system acted.

An opaque multi-agent system should not go to production.

---

## 15. Frequent anti-patterns

Avoid these errors.

### Universal agent

One agent can do everything, read everything, modify everything.

Risk: very high.

### Multi-agents for show

Several agents are added without real need.

Risk: useless complexity.

### Handoff without responsibility

The task moves from one agent to another without clear trace.

Risk: impossible audit.

### Specialists without boundaries

Each agent can answer outside its domain.

Risk: inconsistency and errors.

### Weak supervisor

The supervisor only concatenates answers.

Risk: false or contradictory synthesis.

### No degraded mode

If an agent or tool fails, the workflow stops with no solution.

Risk: service loss.

---

## 16. Six-step choice method

### 1. Describe the real workflow

Before architecture, describe the process.

### 2. Identify decisions

Which decisions must be made?

### 3. Classify data and actions

Reading, writing, sending, sensitive data, external impact.

### 4. Assess complexity

How many paths? How many domains? How many exceptions?

### 5. Choose the minimal architecture

Start with the simplest one.

### 6. Add controls

Permissions, human validation, logs, guardrails, evaluation.

This method prevents over-architecture.

---

## Key takeaways

A good agentic design is not the one that uses the most agents.

It chooses the right level of autonomy and specialization for a given workflow.

Remember this rule:

> Workflow first. Agent second. Multi-agent only when complexity justifies it.

Start simple, measure, secure, then add specialization if the need is proven.

---

## Ella checkpoint context

### Pedagogical intent

Ella should verify that the learner can choose an agentic architecture suited to an enterprise case, instead of automatically choosing a multi-agent architecture.

The checkpoint should compare several cases and ask for justification.

### Suggested situation for dynamic checkpoint generation

Ella can propose three cases:

1. a stable process that creates a ticket from a form;
2. an internal support agent that receives varied requests but remains inside one domain;
3. an assistance platform that covers HR, finance, IT, and compliance with separate sources and permissions.

Ella asks the learner to choose the right architecture for each case:

- deterministic workflow;
- single agent with tools;
- router to specialists;
- supervisor with agents as tools;
- handoffs;
- orchestrator-workers.

### What a good answer should contain

A good answer should mention:

1. workflow complexity;
2. risk level;
3. sensitive data;
4. required tools;
5. final responsibility;
6. logs;
7. human validation;
8. why a simpler architecture may be preferable.

### Common mistakes to detect

- Choosing multi-agents for all cases.
- Forgetting testability.
- Forgetting responsibility.
- Forgetting handoff logs.
- Giving too many tools to each agent.
- Failing to isolate sensitive domains.
- Not planning a degraded mode.

### Possible Socratic follow-ups

- “Why is a deterministic workflow not enough here?”
- “Which agent keeps final responsibility?”
- “Which data should not pass to the next agent?”
- “How do you trace a handoff?”
- “Which risk increases when you add one agent?”
- “How do you test all branches?”

### Validation criteria

Ella can validate if the learner:

- chooses a suitable architecture;
- justifies it through complexity and risk;
- avoids over-architecture;
- plans responsibility and logs;
- limits tools by agent;
- adds human validation for sensitive actions.

---

## Transition to Lab 5

You are ready for Lab 5.

Your mission will be to choose the right architecture for several enterprise cases and justify your choice through risk, complexity, data, tools, and governance.

---

## References

1. OpenAI. **Agents SDK documentation**.  
   https://developers.openai.com/api/docs/guides/agents

2. OpenAI. **Orchestration and handoffs**.  
   https://developers.openai.com/api/docs/guides/agents/orchestration

3. OpenAI Agents SDK. **Handoffs**.  
   https://openai.github.io/openai-agents-python/handoffs/

4. OpenAI Agents SDK. **Agent definitions**.  
   https://developers.openai.com/api/docs/guides/agents/define-agents

5. Anthropic. **Building effective AI agents**. 2024.  
   https://www.anthropic.com/research/building-effective-agents

6. NIST. **AI Risk Management Framework (AI RMF 1.0)**.  
   https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf
