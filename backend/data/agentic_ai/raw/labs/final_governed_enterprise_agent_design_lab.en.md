---
course_id: ella_tech_agentic_ai_enterprise_workflows
course_title_fr: "IA agentique pour les workflows d’entreprise"
course_title_en: "Agentic AI for Enterprise Workflows"
lab_id: "final_governed_enterprise_agent_design_lab"
lab_title_fr: "Lab final — Concevoir un agent d’entreprise gouverné"
lab_title_en: "Final Lab — Design a Governed Enterprise Agent"
pathway: "Tech"
secondary_pathway: "Leadership"
level: "Intermediate-Advanced"
language: "en"
encoding: "UTF-8"
target_score: 16
max_score: 20
checkpoint_mode: "dynamic"
---

# Final Lab — Design a Governed Enterprise Agent

## Mission

You will design a complete, governed, and pilot-ready enterprise AI agent.

Your goal is not to produce a general idea. Your goal is to produce a specification that a business team, a technical team, and an AI coding assistant can use.

Your agent must act in a real workflow, with tools, data, permissions, guardrails, tests, traces, and a pilot plan.

---

## Starting situation

Choose a real case from your organization or one of the simulated cases below.

### Case A — Internal support agent

The agent helps the support team read tickets, classify requests, search procedures, prepare drafts, create internal notes, and escalate sensitive cases.

### Case B — Admission agent

The agent helps a school or university respond to admission requests, identify profiles, search access conditions, list required documents, prepare a response, and escalate special cases.

### Case C — HR agent

The agent answers general questions about validated HR procedures, guides employees, prepares clarification requests, and escalates sensitive topics.

### Case D — Finance agent

The agent helps track payment requests, check documents, prepare an internal response, and escalate cases that require financial validation.

### Case E — Compliance agent

The agent helps analyze a file, retrieve applicable rules, identify gaps, produce a summary, and request human validation.

### Case F — Customer service agent

The agent analyzes a customer request, consults authorized rules, prepares a response, proposes escalation, and never communicates officially without validation.

You may adapt these cases to your context: banking, insurance, university, industry, retail, public administration, healthcare, telecom, or services.

---

## Your deliverable

Produce a specification structured into 18 sections.

```markdown
# Governed Enterprise AI Agent Specification

## 1. Chosen use case
...

## 2. Business problem
...

## 3. Precise agent objective
...

## 4. Users and stakeholders
...

## 5. Agentic workflow
| Step | Input | Agent action | Tool | Decision | Human validation | Output |
|---|---|---|---|---|---|---|
| 1 | ... | ... | ... | ... | ... | ... |

## 6. Agent tools
| Tool | Type | Inputs | Outputs | Permissions | Risks | Validation |
|---|---|---|---|---|---|---|

## 7. Data, RAG, and sources
Authorized sources:
Forbidden sources:
Metadata:
Citation rules:
Contradiction handling:
...

## 8. Memory and work state
Workflow state:
Session memory:
Durable memory:
Data never to memorize:
...

## 9. Chosen architecture
Deterministic workflow / single agent / router / supervisor / handoffs / orchestrator-workers / evaluator-optimizer:
Justification:
Why a more complex architecture would be risky:
...

## 10. Permissions and access control
...

## 11. Technical guardrails
...

## 12. Organizational guardrails
...

## 13. Main risks
| Risk | Impact | Probability | Mitigation |
|---|---|---|---|

## 14. Evaluation and tests
Dataset:
Standard cases:
Ambiguous cases:
Sensitive cases:
Hostile cases:
Tool tests:
RAG tests:
Memory tests:
Regression tests:
...

## 15. Observability and logs
Traces:
Dashboard:
User feedback:
Alerts:
...

## 16. 60-day or 90-day pilot plan
| Phase | Duration | Activities | Deliverables |
|---|---:|---|---|

## 17. KPIs and decision thresholds
Quality:
Security:
Adoption:
Business:
Operations:
Go / no-go thresholds:
...

## 18. Final decision and scaling
Continue:
Adjust:
Stop:
Scale:
Conditions:
...
```

---

## Mandatory constraints

Your agent must:

- have a precise objective;
- act inside a limited workflow;
- use specialized tools;
- separate reading, writing, and external action;
- apply permissions on the system side;
- limit personal data;
- cite sources when the answer depends on a document;
- distinguish RAG, memory, and workflow state;
- include human validation for sensitive actions;
- plan logs and traces;
- include an evaluation plan;
- include a pilot plan;
- plan rollback or deactivation;
- define a final decision.

Your agent must not:

- access all internal data;
- send an official response without validation;
- make HR, financial, regulatory, or institutional decisions without a human;
- memorize sensitive data without a framework;
- hide its sources;
- ignore tool errors;
- operate without an owner.

---

## What Ella will evaluate

Ella will evaluate the overall credibility of the design.

She will check whether you can:

- start from a real business problem;
- limit the scope;
- build a clear workflow;
- specify safe tools;
- manage RAG, context, and memory;
- choose a suitable architecture;
- integrate security, governance, and compliance;
- plan evaluation and observability;
- organize a realistic pilot;
- decide according to value and risk.

---

## Advice before answering

Do not aim for the most impressive agent.

Aim for the most useful, controllable, and testable agent.

A good agentic design does not promise full autonomy. It shows how the agent helps the organization while respecting data, rules, people, and responsibilities.

---

## Ella evaluation context

### Pedagogical intent

Ella must verify the learner’s ability to synthesize the full course into a complete enterprise-agent specification.

The final lab must assess mastery of: agency, workflow, tools, RAG, memory, architecture, governance, security, evaluation, observability, and pilot planning.

### Validation criteria

Ella can validate if the answer:

1. formulates a precise use case and business problem;
2. defines a limited agentic objective;
3. describes a usable workflow;
4. specifies limited and auditable tools;
5. manages sources, RAG, and citations;
6. distinguishes memory, state, and context;
7. chooses a justified architecture;
8. applies permissions and guardrails;
9. identifies risks;
10. proposes an evaluation plan;
11. plans observability, logs, and feedback;
12. structures a 60/90-day pilot;
13. defines KPIs and thresholds;
14. keeps human validation for sensitive actions.

### Possible follow-ups

- “Which decision does the agent improve exactly?”
- “Why is this scope limited?”
- “Which tool is the riskiest?”
- “Which data is not necessary?”
- “Which action requires human validation?”
- “How do you test a contradictory source?”
- “What does the execution trace show?”
- “Which KPI blocks scaling?”
- “How do you disable the agent or one tool?”

---

## References

1. OpenAI. **Agents SDK documentation**.  
   https://developers.openai.com/api/docs/guides/agents

2. OpenAI. **Function calling**.  
   https://developers.openai.com/api/docs/guides/function-calling

3. OpenAI. **Evaluate agent workflows**.  
   https://developers.openai.com/api/docs/guides/agent-evals

4. OpenAI Agents SDK. **Tracing**.  
   https://openai.github.io/openai-agents-python/tracing/

5. Anthropic. **Building effective AI agents**.  
   https://www.anthropic.com/research/building-effective-agents

6. Anthropic. **Writing effective tools for AI agents**.  
   https://www.anthropic.com/engineering/writing-tools-for-agents

7. Anthropic. **Effective context engineering for AI agents**.  
   https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

8. NIST. **AI Risk Management Framework (AI RMF 1.0)**.  
   https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf

9. NIST. **The NIST Cybersecurity Framework (CSF) 2.0**.  
   https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf

10. Republic of Tunisia. **Organic Law No. 2004-63 of July 27, 2004, on the protection of personal data**.  
   https://www.ins.tn/sites/default/files/2020-04/Loi%2063-2004%20Fr.pdf
