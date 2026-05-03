# ELLA Course Package - AI for Finance & Banking

Version: 1.0.0  
Pathway: Industry  
Level: Advanced  
Delivery modes: instructor-led workshop and self-paced ELLA.

## Content

- `course.json`: course metadata, pathway, objectives, delivery modes, sources.
- `modules/`: 5 bilingual ELLA modules.
- `labs/`: 5 practical lab mission files.
- `rubrics/`: global and lab-specific rubrics.
- `datasets/`: simulated datasets for safe learning.
- `specs/integration_spec.json`: implementation contract for Codex, Antigravity, Claude Code, or another coding assistant.

## Pedagogical structure

Each module follows the ELLA flow:
content cell -> Ella checkpoint -> content cell -> checkpoint -> diagram -> more checkpoints -> Ella gate -> lab.

The course is designed for a 4-day instructor-led workshop, 32 hours total, and an 18-24 hour self-paced version.

## Regulatory context

This package includes a Tunisian focus:
- BCT circulars and financial-sector supervision context.
- BCT Fintech and sandbox references.
- Tunisian personal-data protection references.
- International references such as NIST AI RMF and EU AI Act banking implications.

Before production use, update the regulatory references and validate them with legal, compliance, and risk teams.

## Integration notes

1. Import `course.json`.
2. Register each module under `/courses/ai-finance-banking/modules`.
3. Register each lab under `/courses/ai-finance-banking/labs`.
4. Attach each lab to its rubric by matching lab/module names.
5. Load datasets only in the lab sandbox. They are simulated and contain no real personal data.
6. Sanitize SVG before rendering.
7. Use the `ella_system_hint` only server-side. Do not expose it to learners.

## Completion rule

Certificate is unlocked when:
- every lab score is at least 8/10;
- overall lab average is at least 8/10.

