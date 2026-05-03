# ELLA Lesson Markdown Format

Each ELLA lesson is stored as a UTF-8 Markdown file.

## Naming convention

Use one file per language:

```text
lessons_markdown/00_welcome_intro.fr.md
lessons_markdown/00_welcome_intro.en.md
lessons_markdown/01_credit_scoring_intro.fr.md
lessons_markdown/01_credit_scoring_intro.en.md
```

## Required structure

Each lesson should contain:

1. YAML front matter
2. Lesson title
3. Learner-facing content
4. Examples or caution boxes using Markdown, not inline HTML
5. Ella checkpoint
6. `ella_system_hint`
7. References section

## Style rules

- Use UTF-8 encoding.
- Use a direct coach-like tone.
- Keep paragraphs short.
- Use concrete finance, banking, insurance, fintech, and CFO examples.
- Cite every regulatory, institutional, or methodological reference.
- Use `[R1]`, `[R2]`, etc. in the text.
- Put full reference details at the end.
- Do not use inline HTML for red/green boxes. Use Markdown:

```markdown
❌ **Common mistake**  
...

✅ **Better approach**  
...
```
