---
course_id: ella_industry_ai_manufacturing_industry_4_0
course_title_fr: "IA industrielle pour la performance, la qualité et la maintenance prédictive"
course_title_en: "AI for Manufacturing & Industry 4.0"
lesson_id: "06_deployment_ot_cybersecurity_industrial_ai_roadmap"
lesson_number: 6
lesson_title_fr: "Déploiement, cybersécurité OT et feuille de route IA industrielle"
lesson_title_en: "Deployment, OT Cybersecurity, and Industrial AI Roadmap"
pathway: "Industry"
secondary_pathway: "Tech"
level: "Advanced"
language: "en"
encoding: "UTF-8"
delivery_modes:
  instructor_led: "4 days / 32h for the full course"
  self_paced: "20 to 26h for the full course"
checkpoint_mode: "dynamic"
lab_next: "final_industrial_ai_roadmap_lab"
---

# Lesson 6 — Deployment, OT Cybersecurity, and Industrial AI Roadmap

## Lesson objective

You have now covered the main industrial AI uses: data, predictive maintenance, quality vision, flow optimization, and digital twins.

This final lesson answers the most important question:

> How do you move from an idea or a POC to a realistic, safe, and measurable industrial pilot?

In industry, a model that works in a notebook is not enough. It must account for the real line, operators, maintenance, quality, the OT network, cybersecurity, responsibilities, and performance indicators.

This lesson prepares you for the final lab: building an industrial AI roadmap.

---

## 1. Scaling is the real test

A POC proves that an idea can work on limited data.

A pilot proves that a use can work in a real situation.

A deployment proves that the organization can maintain, secure, measure, and improve that use over time.

These three levels must not be confused.

### POC

Objective: test technical feasibility.

Example: train a model on vibration and downtime history.

### Pilot

Objective: test the use in a limited scope.

Example: deploy a drift alert on one critical machine for eight weeks, with an identified maintenance team.

### Deployment

Objective: integrate the use into the industrial process.

Example: connect the alert to maintenance planning, MES, intervention procedures, dashboards, and OT governance.

Scaling therefore requires more than code. It requires organization.

---

## 2. Why many industrial AI projects get stuck

Industrial AI projects rarely fail for one reason only.

They often get stuck because one link is missing.

Examples:

- the business problem is too vague;
- data is scattered or unreliable;
- failure history is incomplete;
- the model triggers no action;
- operators do not trust alerts;
- the system is not integrated into the quality or maintenance process;
- the OT network is not ready;
- responsibilities are unclear;
- KPIs do not measure real value;
- the pilot has no success, stop, or scaling rule.

NIST reminds manufacturers that AI value comes from alignment with specific business goals and clear, actionable benefits. This idea is central: industrial AI is not a model contest; it is a performance lever.

---

## 3. The industrial AI roadmap model

Your roadmap must allow industrial leadership to say:

> Yes, this use case is clear, useful, feasible, controlled, and testable.

It should contain ten blocks.

### 1. Industrial problem

Which problem do you want to reduce?

Examples:

- unplanned downtime;
- high scrap rate;
- customer delays;
- excessive intermediate stock;
- unstable quality control;
- high energy consumption;
- bottleneck.

### 2. Scope

Where do you start?

Examples:

- one machine;
- one line;
- one workshop;
- one product family;
- one quality station;
- one export flow;
- one critical asset.

### 3. AI use case

What will AI do concretely?

Examples:

- detect an anomaly;
- classify a risk;
- alert on drift;
- recommend a priority;
- simulate a scenario;
- detect a visual defect.

### 4. Required data

What data will be used?

State:

- sources;
- frequency;
- quality;
- owner;
- sensitivity;
- access;
- available history.

### 5. Target architecture

Where will data be collected, processed, and visualized?

Examples:

- sensors;
- PLC;
- SCADA;
- MES;
- ERP;
- edge gateway;
- local server;
- cloud;
- dashboard;
- API.

### 6. Field decision

What happens after the model result?

Examples:

- inspection;
- planned stop;
- human review;
- quality rejection;
- rescheduling;
- supply chain alert;
- simulation before action.

### 7. KPIs

How will you measure value?

Examples:

- availability;
- OEE;
- MTBF;
- MTTR;
- scrap rate;
- false reject rate;
- lead time;
- WIP;
- service level;
- downtime cost;
- consumed energy.

### 8. Risks

Which risks may appear?

Examples:

- model error;
- incomplete data;
- false positives;
- false negatives;
- unnecessary stop;
- OT cybersecurity;
- team rejection;
- supplier dependency;
- traceability loss.

### 9. Guardrails

How will you reduce risk?

Examples:

- human validation;
- progressive threshold;
- observation mode before action;
- logging;
- network segmentation;
- security review;
- quality review;
- rollback procedure;
- named business owner.

### 10. 90-day pilot

What will you do in the next three months?

Examples:

- weeks 1-2: framing and data;
- weeks 3-5: preparation and historical test;
- weeks 6-8: observation deployment;
- weeks 9-11: controlled alert;
- week 12: review, scale, adjust, or stop.

---

## 4. OT cybersecurity: non-negotiable

Industrial AI often touches OT systems: machines, sensors, PLCs, SCADA, and industrial networks.

These systems do not work like classical IT. Their priorities are continuity, safety, availability, and sometimes real-time operation.

Connecting a machine to collect data can create a new risk. A poorly protected data flow can expose production. Poorly controlled remote access can become an entry point.

The ISA/IEC 62443 series provides requirements and processes for securing industrial automation and control systems. It connects cybersecurity, operations, IT/OT, and process safety.

Your rule should be simple:

> No AI gain justifies weakening production or human safety.

---

## 5. Apply a simple cybersecurity reading

You do not need to be a cybersecurity expert to ask the right questions.

Use a grid inspired by the functions of the NIST Cybersecurity Framework 2.0: govern, identify, protect, detect, respond, and recover.

### Govern

Who owns the use case?  
Who validates the risks?  
Who decides to scale?

### Identify

Which assets are concerned?  
Which machines, data, user accounts, networks, servers, and suppliers?

### Protect

Which accesses are authorized?  
Are networks segmented?  
Is data protected?  
Are updates controlled?

### Detect

How do you detect abnormal behavior?  
Who monitors logs, errors, alerts, and drifts?

### Respond

What do you do if the AI system gives a dangerous recommendation, fails, or triggers too many alerts?

### Recover

How do you return to manual mode or a stable configuration?

This grid is simple. It prevents many careless decisions.

---

## 6. Observation mode before action mode

In an industrial system, do not immediately give the model power to act.

Start with observation mode.

### Observation mode

The model produces alerts or recommendations, but no automatic action is triggered.

The team compares:

- what the model signals;
- what technicians observe;
- what actually happens;
- false alerts;
- useful signals;
- uncovered situations.

### Assistance mode

The model supports a decision, but a person validates it.

Example: the system recommends an inspection. The maintenance manager decides.

### Controlled automation mode

Some actions can be automated, but only within validated scope, thresholds, and procedures.

Example: automatically sort visually non-conforming parts, with human review for ambiguous cases.

Moving from one mode to another must be decided, documented, and reversible.

---

## 7. Industrial AI governance

Governance is not administrative burden. It clarifies who decides, who acts, and who controls.

For an industrial AI use case, define at least:

- business sponsor;
- process owner;
- data owner;
- maintenance, quality, or production referent;
- IT/OT owner;
- cybersecurity owner;
- field user;
- KPI owner;
- validation rules;
- change procedure.

This governance can remain light. But it must exist.

Without governance, nobody knows who corrects the model, who validates an alert, who stops the system, or who owns a decision.

---

## 8. Change management: the field decides project lifetime

An industrial AI project can be technically correct and socially fail.

Why?

Because field teams may see it as:

- a surveillance tool;
- a threat to their expertise;
- an extra constraint;
- one more alert;
- a project decided without them;
- a solution that ignores line reality.

You must involve teams early.

### Good practices

- listen to technicians before choosing signals;
- ask quality controllers to validate defect definitions;
- ask operators to explain ambiguous cases;
- show model errors;
- allow field feedback;
- name a user referent;
- train teams to read alerts;
- value human expertise.

NIST summarizes successful AI in manufacturing around the problem, the people, and the process. This trio should guide deployment.

---

## 9. Model monitoring

An industrial AI model must be monitored over time.

Why?

Because the factory changes:

- new material;
- new supplier;
- new speed;
- new machine;
- new format;
- sensor drift;
- shift change;
- procedure change;
- seasonality;
- major maintenance.

These changes can degrade the model.

Monitor at least:

- data quality;
- alert rate;
- false alert rate;
- uncovered cases;
- signal drift;
- performance by product, shift, or format;
- user feedback;
- impact on industrial KPIs.

The NIST AI Risk Management Framework proposes AI risk management through four functions: govern, map, measure, and manage. This logic fits industrial model monitoring well.

---

## 10. Minimal documentation

To deploy an industrial AI use case, document the essential elements.

### Use-case sheet

- problem;
- scope;
- users;
- decision;
- data;
- model;
- KPIs;
- risks;
- guardrails.

### Data sheet

- source;
- owner;
- frequency;
- quality;
- transformations;
- access;
- retention.

### Model sheet

- objective;
- version;
- training data;
- metrics;
- limits;
- thresholds;
- conditions of use;
- conditions of non-use.

### Operational sheet

- who receives the alert;
- what to do;
- within what delay;
- how to record feedback;
- how to escalate;
- how to return to manual mode.

This documentation can be short. Above all, it must be used.

---

## 11. 90-day pilot: recommended structure

A 90-day pilot gives enough time to test without losing control.

### Phase 1 — Framing, 2 weeks

- choose the scope;
- formulate the problem;
- name owners;
- audit data;
- validate OT risks;
- define KPIs.

### Phase 2 — Preparation, 3 weeks

- extract data;
- clean it;
- synchronize it;
- build a first model or rule;
- test on history;
- define the initial threshold.

### Phase 3 — Observation, 3 weeks

- run the model without automatic action;
- compare with the field;
- collect feedback;
- adjust thresholds;
- measure false alerts.

### Phase 4 — Controlled assistance, 3 weeks

- use alerts in a real decision;
- keep human validation;
- track KPIs;
- document deviations;
- analyze incidents.

### Phase 5 — Review, 1 week

- value created;
- observed risks;
- field acceptance;
- data quality;
- costs;
- scaling conditions;
- decision: continue, adjust, stop, or extend.

---

## 12. Scaling criteria

Do not scale because the pilot “looks promising.”

Decide from criteria.

### Value criteria

- measurable gain;
- less downtime;
- less scrap;
- fewer delays;
- better service level;
- shorter decision time.

### Robustness criteria

- stable performance;
- reliable data;
- acceptable error rate;
- understandable model;
- controlled thresholds.

### Integration criteria

- clear process;
- named owners;
- usable interface;
- secure IT/OT connection;
- existing documentation.

### Human criteria

- users trained;
- field trust;
- feedback included;
- no massive bypassing.

### Security criteria

- OT risks assessed;
- access controlled;
- response plan;
- rollback possible.

If one critical criterion is missing, extend the pilot instead of scaling too quickly.

---

## 13. Final case: choosing between three AI projects

Imagine a Tunisian factory with three ideas.

### Project A — Quality vision on a packaging line

- frequent defect;
- images easy to collect;
- clear decision: OK/NOK/human review;
- direct impact on complaints.

### Project B — Predictive maintenance on a critical machine

- costly downtime;
- partial sensors;
- incomplete failure history;
- high potential value.

### Project C — Full supply chain optimization

- broad problem;
- scattered data;
- several departments;
- strategic value but high complexity.

### Recommended choice

For a first pilot, project A may be faster if images and quality rules are available.

Project B may be relevant if the machine is critical, but it should start with condition monitoring and event reliability.

Project C is too broad for a first pilot. It should be split into smaller cases: export delays for one product family, shortage of a critical component, or work-order prioritization on one line.

Project maturity does not depend only on value. It also depends on data quality, scope, risks, and possible action.

---

## 14. Your final deliverable

Your final lab is to produce an industrial AI roadmap.

It must answer these questions:

1. Which industrial problem do you want to address?
2. Why is this problem a priority?
3. Which scope do you choose?
4. What data is required?
5. Which AI or simulation approach do you propose?
6. Which field decision will be improved?
7. Which KPIs will measure value?
8. Which risks must be controlled?
9. Which guardrails do you propose?
10. How do you structure the 90-day pilot?
11. Which scaling conditions do you retain?

Your roadmap must be clear, realistic, and deployable.

It should not promise an autonomous factory. It should show a solid first step toward a more performant, safer, and better-controlled industry.

---

## Key takeaways

The real challenge of industrial AI is not building a model. It is building a reliable operational loop.

This loop is:

> industrial problem → data → model → decision → action → measurement → improvement.

Always add:

- OT cybersecurity;
- human responsibility;
- field acceptance;
- documentation;
- monitoring;
- scaling criteria.

This is how AI leaves the demonstration stage and starts producing industrial value.

---

## Ella checkpoint context

### Pedagogical intent

Ella should verify that the learner can turn an industrial AI use case into a deployable roadmap.

The checkpoint should prepare the final lab. It should test the ability to connect problem, scope, data, architecture, decision, risks, guardrails, and 90-day pilot.

### Suggested situation for dynamic checkpoint generation

Ella can propose three project ideas: quality vision, predictive maintenance, supply chain optimization.

She asks the learner to choose the most realistic project for a first pilot and justify it according to:

- value;
- data feasibility;
- complexity;
- OT risks;
- field decision;
- KPIs;
- team acceptance;
- pilot duration.

### What a good answer should contain

A good answer should mention:

1. a clear industrial problem;
2. a limited scope;
3. required data;
4. the improved action or decision;
5. KPIs;
6. OT or operational risks;
7. guardrails;
8. 90-day pilot logic;
9. one scaling condition.

### Common mistakes to detect

- Choosing the most spectacular project instead of the most testable.
- Forgetting the OT network and cybersecurity.
- Forgetting who acts after an alert.
- Forgetting the observation phase.
- Proposing scaling without criteria.
- Confusing POC and pilot.
- Not including field teams.

### Possible Socratic follow-ups

- “Why is this project a better first pilot than the others?”
- “Which decision will be different because of AI?”
- “Which data is missing today?”
- “Which OT risk must you check before connecting the system?”
- “Which KPI will make you stop or continue the pilot?”
- “Who must validate the alert or recommendation?”
- “How do you return to manual mode if the system fails?”

### Validation criteria

Ella can validate if the learner:

- chooses a realistic use case;
- justifies the priority;
- defines a limited scope;
- connects data, model, decision, and KPIs;
- integrates OT cybersecurity and human control;
- proposes a structured pilot;
- defines one scaling condition.

---

## Transition to the final lab

You are ready for the final lab.

Your mission will be to build an industrial AI roadmap for a line, factory, or department.

You will need to show that you can move from an idea to a credible, measurable, secure, and field-acceptable pilot.

---

## References

1. International Society of Automation. **ISA/IEC 62443 Series of Standards**.  
   https://www.isa.org/standards-and-publications/isa-standards/isa-iec-62443-series-of-standards

2. NIST. **The NIST Cybersecurity Framework (CSF) 2.0**. NIST CSWP 29, 2024.  
   https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf

3. NIST. **AI Risk Management Framework (AI RMF 1.0)**. NIST AI 100-1, 2023.  
   https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf

4. NIST. **AI RMF Core**.  
   https://airc.nist.gov/airmf-resources/airmf/5-sec-core/

5. NIST. **Artificial Intelligence: Key Considerations and Effective Implementation Strategies for Small and Medium Manufacturers**.  
   https://www.nist.gov/document/artificial-intelligence-key-consideration-and-effective-implementation-strategies

6. NIST. **Artificial Intelligence in Manufacturing: Real World Success Stories**.  
   https://www.nist.gov/blogs/manufacturing-innovation-blog/artificial-intelligence-manufacturing-real-world-success-stories

7. International Society of Automation. **ISA-95 Standard: Enterprise-Control System Integration**.  
   https://www.isa.org/standards-and-publications/isa-standards/isa-95-standard
