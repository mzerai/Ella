---
course_id: ella_tech_agentic_ai_enterprise_workflows
course_title_fr: "IA agentique pour les workflows d’entreprise"
course_title_en: "Agentic AI for Enterprise Workflows"
lesson_id: "03_tool_calling_api_enterprise_integration"
lesson_number: 3
lesson_title_fr: "Tool calling, API et intégration SI"
lesson_title_en: "Tool Calling, APIs, and Enterprise Systems Integration"
pathway: "Tech"
secondary_pathway: "Leadership"
level: "Intermediate-Advanced"
language: "en"
encoding: "UTF-8"
delivery_modes:
  instructor_led: "3 days / 24h for the full course"
  self_paced: "14 to 20h for the full course"
checkpoint_mode: "dynamic"
lab_next: "03_specify_agent_tools_lab"
---

# Lesson 3 — Tool Calling, APIs, and Enterprise Systems Integration

## Lesson objective

In the previous lessons, you saw what an agent is and how to place it inside a workflow.

Now you will work on what makes an agent truly useful in an enterprise: its ability to use tools.

An agent without tools answers.  
An agent with tools can search, check, create, notify, classify, update, or prepare an action.

But this ability also creates the main risk of agents: a poorly defined tool can give the agent too much power, too much data, or too much room for error.

Your objective in this lesson:

> Know how to specify the tools an agent can use in an enterprise information system, with permissions, limits, errors, logs, and human validation.

---

## 1. Why tools change everything

An LLM alone produces text.  
A tool-using agent can interact with the enterprise environment.

Examples:

- read a ticket;
- search a procedure;
- consult a CRM record;
- check invoice status;
- generate an email draft;
- create a task;
- notify a manager;
- open an IT request;
- calculate an indicator;
- query a knowledge base;
- update a status if authorized.

OpenAI describes tool calling as a way to connect models to external systems and to data or actions provided by the application. This makes the model more useful, but it also shifts part of the risk to tool design.

Anthropic states the issue clearly: agents are only as effective as the tools we give them.

---

## 2. A tool is a contract, not just a function

In classic development, an API is often designed for another software system.

In an agentic system, the tool is called by a probabilistic agent that may misunderstand, choose the wrong moment, or provide incomplete input.

You must therefore define each tool as a clear contract.

A good tool specifies:

- its objective;
- accepted inputs;
- returned outputs;
- required permissions;
- possible errors;
- forbidden actions;
- logs to produce;
- human validation level;
- data limits;
- stop conditions.

### Poor specification

```text
Tool: access CRM.
```

Too vague. Too dangerous.

### Better specification

```text
Tool: read_customer_case_summary
Role: read a limited summary of a customer case.
Input: case_id.
Output: status, category, last interaction, owner.
Limits: does not return ID number, phone, detailed personal contact data, financial data, or attachments.
Permission: support_level_1 or higher.
Human validation: no, read-only.
Log: case_id, user, timestamp, access reason.
```

This version is usable, limited, and auditable.

---

## 3. Read, write, send: three levels of risk

Not all tools are equivalent.

### Level 1 — Read

The tool consults information.

Examples:

- search a procedure;
- read a status;
- retrieve a summary;
- consult a limited history.

Main risk: excessive access to information.

### Level 2 — Write

The tool modifies a system.

Examples:

- create a ticket;
- add a note;
- change a category;
- update a status.

Main risk: incorrect or unauthorized modification.

### Level 3 — Send or trigger

The tool creates a visible or hard-to-reverse effect.

Examples:

- send a customer email;
- notify a supplier;
- trigger an order;
- modify access rights;
- approve an expense.

Main risk: external, financial, legal, reputational, or operational impact.

Simple rule:

> The more a tool acts on the real world, the stronger the validation must be.

In a first pilot, it is often better to limit the agent to reading and creating drafts or internal notes.

---

## 4. Tool families in the enterprise

An enterprise agent can use several families of tools.

### Knowledge tools

They find information.

Examples:

- `search_knowledge_base`;
- `retrieve_policy`;
- `search_procedure`;
- `get_faq_answer`.

### Ticketing tools

They read or prepare request handling.

Examples:

- `read_ticket`;
- `classify_ticket`;
- `add_internal_note`;
- `escalate_ticket`.

### CRM tools

They provide controlled customer context.

Examples:

- `read_customer_summary`;
- `get_case_status`;
- `draft_customer_response`.

### ERP or finance tools

They manipulate sensitive information.

Examples:

- `check_invoice_status`;
- `get_purchase_order_status`;
- `draft_payment_followup`.

These tools require more permissions and validation.

### Email or communication tools

They prepare or send messages.

Examples:

- `draft_email`;
- `notify_manager`;
- `send_approved_email`.

Direct sending should be limited or validated.

### Workflow tools

They move the process forward.

Examples:

- `create_task`;
- `request_approval`;
- `assign_owner`;
- `create_followup`.

### Audit tools

They record what the agent does.

Examples:

- `log_tool_call`;
- `record_decision`;
- `save_escalation_reason`.

An enterprise agent without an audit tool is hard to govern.

---

## 5. Inputs: ask for little, but ask precisely

A tool should ask for the required information, not more.

### Poor tool

```text
get_customer_data(customer_name, phone, email, national_id, address, contract, history)
```

This tool asks for too much. It encourages personal data exposure.

### Better tool

```text
read_customer_case_summary(case_id)
```

The tool receives a business identifier and returns a limited summary.

Inputs should be:

- precise;
- typed;
- validatable;
- minimal;
- aligned with the user’s role.

For an agent, inputs should also reduce ambiguity.

Example:

```json
{
  "ticket_id": "TCK-2048",
  "reason": "prepare_internal_response",
  "requester_role": "support_agent"
}
```

The `reason` field helps trace why access occurred.

---

## 6. Outputs: give the agent what it can use

A tool output should be short, structured, and useful.

### Poor output

```text
Here is all customer data.
```

Risk: too much information, useless data, possible leakage.

### Better output

```json
{
  "case_id": "C-1022",
  "status": "open",
  "category": "billing_question",
  "last_interaction_summary": "Client requested clarification on invoice deadline.",
  "missing_information": ["invoice_number"],
  "allowed_next_actions": ["draft_response", "request_missing_information", "escalate"]
}
```

This output guides the agent. It limits data. It states possible actions.

A good tool does not only return data. It helps the agent stay inside the workflow.

---

## 7. Schemas and validation

OpenAI notes that function tools can be defined with a JSON schema. This schema helps control expected inputs.

A schema should define:

- tool name;
- description;
- parameters;
- types;
- required fields;
- allowed values;
- constraints.

Conceptual example:

```json
{
  "name": "escalate_ticket",
  "description": "Escalates a ticket to an authorized human owner.",
  "parameters": {
    "type": "object",
    "properties": {
      "ticket_id": {"type": "string"},
      "reason": {
        "type": "string",
        "enum": ["sensitive_data", "missing_policy", "low_confidence", "forbidden_action"]
      },
      "summary": {"type": "string"}
    },
    "required": ["ticket_id", "reason", "summary"]
  }
}
```

The schema is not enough to secure the tool. You must also check permissions on the server side.

Important rule:

> Never trust the agent alone to enforce permissions. Permissions must be checked by the system.

---

## 8. Permissions and access control

An agent must not bypass the user’s rights.

If an employee cannot see data in the business application, the agent should not reveal it.

You must decide:

- does the agent act with its own rights?
- does it act with the user’s rights?
- does it act with a limited service account?
- which actions require validation?
- which data is masked?
- which calls are refused?

### Good practice

For a first pilot, use minimum permissions:

- limited reading;
- controlled internal writing;
- no external sending without validation;
- no access-right modification;
- no sensitive data access outside scope.

This follows the principle of least privilege.

---

## 9. Secrets, API keys, and sensitive data

An agent must never see technical secrets.

Examples to protect:

- API keys;
- tokens;
- passwords;
- connection strings;
- OAuth secrets;
- service keys;
- certificates;
- sensitive environment variables.

The agent can request a tool call, but execution must happen through your backend or orchestrator.

### Poor approach

> Give an API key to the agent in the prompt.

### Better approach

> The agent calls `check_invoice_status(invoice_id)`. The server executes the call with secrets stored in the infrastructure.

The agent should not manipulate secrets. It should manipulate controlled intentions.

---

## 10. Tool errors: do not let the agent improvise

Tools fail.

Examples:

- API unavailable;
- timeout;
- permission denied;
- data not found;
- invalid format;
- duplicate;
- system under maintenance;
- rate limit reached;
- contradictory response.

You must define what the agent does in each case.

### Example

If `search_policy` finds nothing:

- do not invent;
- state that the source is missing;
- request human validation;
- create an escalation note.

If `create_ticket` fails:

- do not claim that the ticket was created;
- inform the user;
- record the failure;
- propose a manual action.

A reliable agent recognizes tool failures.

---

## 11. Idempotency: avoid duplicate actions

An agent may call a tool again if the answer is delayed or if the workflow resumes after interruption.

If the tool creates an action, this can create duplicates.

Examples:

- two tickets created;
- two emails sent;
- two notifications;
- two orders;
- two internal notes.

To avoid this, plan:

- unique request identifier;
- idempotency key;
- verification before creation;
- clear response if the object already exists;
- usable logs.

Example:

```json
{
  "idempotency_key": "ticket-TCK-2048-draft-response-v1"
}
```

Practical rule:

> Every tool that writes must be designed against duplicates.

---

## 12. Tools and RAG: do not confuse them

RAG is a kind of knowledge tool. But not every tool is RAG.

### RAG

Search documents to answer with sources.

Example:

- HR procedure;
- reimbursement policy;
- internal regulation;
- product catalogue.

### Business tool

Interact with a system.

Example:

- read a ticket;
- check invoice status;
- create a task;
- send a notification.

An enterprise agent often combines both:

1. RAG to find the rule;
2. business tool to read the case;
3. LLM to prepare a response;
4. workflow tool to create a note;
5. human validation before sensitive action.

---

## 13. Tunisian case: admission agent connected to the information system

Imagine a Tunisian school that wants an admission agent.

The agent should help candidates or internal teams track an application.

### Possible tools

| Tool | Type | Risk | Validation |
|---|---|---|---|
| `search_admission_rules` | Document reading | Low | No |
| `check_application_status` | SI reading | Medium | Depends on profile |
| `list_missing_documents` | Controlled reading | Medium | No if data is limited |
| `draft_candidate_email` | Draft | Medium | Yes before sending |
| `escalate_special_case` | Workflow | Medium | Yes |
| `update_application_status` | SI writing | High | Yes, authorized role |

### Forbidden actions for a first pilot

- accept a candidate automatically;
- reject an application automatically;
- grant an exception;
- modify financial status;
- expose personal data to a third party;
- send an official email without validation.

This case shows that the agent can be useful without making the institutional decision.

---

## 14. How to name tools

A tool name must be explicit.

### Poor names

- `do_action`
- `access_system`
- `handle_case`
- `process_data`

These names are too vague.

### Good names

- `search_hr_policy`
- `read_ticket_summary`
- `draft_customer_reply`
- `create_internal_note`
- `request_manager_approval`
- `escalate_sensitive_case`

The name helps the agent choose correctly.

The description must be even clearer:

> “Use this tool only to create an internal note in an existing ticket. Do not use it to send a response to the requester.”

---

## 15. Fewer tools, better designed

Adding too many tools makes agent choice harder.

An agent with 40 poorly named tools can be less reliable than an agent with 6 well-designed tools.

Anthropic recommends designing tools carefully, evaluating them, and improving them. A good starting rule:

> Give the agent the smallest set of tools that allows it to complete the mission.

You can expand later.

---

## 16. Minimal tool specification

For each tool, document at least this:

```markdown
## Tool name

### Objective
...

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

### Logs
...

### Human validation
...
```

This sheet serves the business team, the technical team, and the coding assistant that will integrate the agent.

---

## Key takeaways

A tool gives power to the agent.

That power must be limited, documented, validated, and traced.

Remember this chain:

> agent intent → authorized tool → permission checked → action executed → structured result → log → validation if needed.

A good tool is not the one that does many things. It is the one that performs one clear action, inside a precise frame, with controlled inputs and usable outputs.

---

## Ella checkpoint context

### Pedagogical intent

Ella should verify that the learner understands how to specify tools for an enterprise agent and how to limit their risks.

The checkpoint should ask the learner to design or critique tools, not only define tool calling.

### Suggested situation for dynamic checkpoint generation

Ella can propose this scenario:

> A support agent must read a ticket, search a procedure, prepare a response, create an internal note, and escalate sensitive cases. Management proposes a single tool called `access_all_systems`.

Ella asks the learner to:

- explain why this tool is dangerous;
- replace it with several limited tools;
- distinguish read and write tools;
- specify permissions;
- define errors to handle;
- state which actions require human validation;
- propose logs to keep.

### What a good answer should contain

A good answer should mention:

1. a vague tool is dangerous;
2. tools should be specialized;
3. permissions must be checked by the system;
4. write tools require more control;
5. errors must be planned;
6. sensitive actions need human validation;
7. tool calls must be logged.

### Common mistakes to detect

- Giving the agent a tool that is too broad.
- Forgetting permissions.
- Letting the agent see API keys.
- Allowing sending without validation.
- Not handling API failure.
- Forgetting idempotency.
- Returning too much personal data.
- Confusing RAG and business tools.

### Possible Socratic follow-ups

- “What exactly can this tool do?”
- “Does this tool read, write, or trigger an external action?”
- “Which data is not necessary in the output?”
- “Who checks permission?”
- “What does the agent do if the tool fails?”
- “Which action must wait for human validation?”
- “What should you log?”

### Validation criteria

Ella can validate if the learner:

- splits overly broad tools;
- defines inputs and outputs;
- distinguishes reading, writing, and sending;
- limits permissions;
- plans errors;
- adds human validation;
- plans logs and audit.

---

## Transition to Lab 3

You are ready for Lab 3.

Your mission will be to specify five tools for an enterprise agent, with objectives, inputs, outputs, permissions, errors, logs, and human validation.

---

## References

1. OpenAI. **Function calling**.  
   https://developers.openai.com/api/docs/guides/function-calling

2. OpenAI. **Using tools**.  
   https://developers.openai.com/api/docs/guides/tools

3. OpenAI Agents SDK. **Tools**.  
   https://openai.github.io/openai-agents-python/tools/

4. Anthropic. **Writing effective tools for AI agents**. 2025.  
   https://www.anthropic.com/engineering/writing-tools-for-agents

5. Anthropic. **Building effective AI agents**. 2024.  
   https://www.anthropic.com/research/building-effective-agents

6. NIST. **AI Risk Management Framework (AI RMF 1.0)**.  
   https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf

7. Republic of Tunisia. **Organic Law No. 2004-63 of July 27, 2004, on the protection of personal data**.  
   https://www.ins.tn/sites/default/files/2020-04/Loi%2063-2004%20Fr.pdf
