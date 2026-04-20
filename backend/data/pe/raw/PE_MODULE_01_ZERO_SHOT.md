# Module 1 — Zero-Shot Prompting

---

## 1. C'est quoi le Zero-Shot ?

Quand vous utilisez ChatGPT, Claude ou un autre LLM, vous faites déjà du zero-shot sans le savoir. Vous tapez une instruction, le modèle répond. Pas d'exemples, pas de démonstration préalable — juste votre consigne.

**Zero-shot** = vous demandez au modèle de réaliser une tâche **sans lui montrer d'exemples** de ce que vous attendez.

C'est le mode par défaut du prompt engineering, et paradoxalement, c'est le plus exigeant. Pourquoi ? Parce que sans exemples pour guider le modèle, **la qualité de votre instruction est votre seul levier**.

Un bon prompt zero-shot, c'est comme un bon brief à un freelance que vous n'avez jamais rencontré : si votre brief est vague, le résultat sera décevant. Si votre brief est précis, vous obtenez exactement ce que vous voulez.

---

## 2. Pourquoi ça marche ?

Les LLM comme Llama, GPT ou Claude ont été entraînés sur des milliards de textes. Ils ont "vu" des résumés, des classifications, des traductions, des analyses — dans tous les formats possibles. Quand vous leur donnez une instruction claire, ils s'appuient sur ces patterns appris pour produire un résultat.

Le zero-shot fonctionne bien quand :
- La tâche est **courante** (résumer, classifier, traduire, reformuler)
- L'instruction est **claire et spécifique**
- Le format de sortie est **bien défini**

Le zero-shot fonctionne mal quand :
- La tâche est **inhabituelle** ou très spécialisée
- L'instruction est **ambiguë** (le modèle ne sait pas ce que vous voulez)
- Vous avez besoin d'un comportement **très précis** que seuls des exemples pourraient illustrer

Dans ces cas-là, on passe au few-shot (Module 2) ou au chain-of-thought (Module 3).

---

## 3. Anatomie d'un bon prompt zero-shot

Un prompt zero-shot efficace contient 4 composantes — on les appelle les "4C" :

### 🎯 Contexte
Qui êtes-vous ? Pour qui est le résultat ? Quelle est la situation ?

> ❌ "Résume ce texte."
>
> ✅ "Tu es un analyste financier senior. Résume ce rapport trimestriel pour le comité de direction de la banque. Les lecteurs sont des non-techniciens qui veulent comprendre l'impact business."

Le contexte oriente le ton, le vocabulaire et le niveau de détail. Le même texte sera résumé très différemment pour un CEO et pour un ingénieur.

### 📋 Consigne
Que doit faire le modèle ? Soyez explicite et précis.

> ❌ "Analyse ce texte."
>
> ✅ "Identifie les 3 risques principaux mentionnés dans ce texte, classe-les par ordre de gravité, et pour chacun donne une recommandation actionable en une phrase."

"Analyse" est vague. Le modèle ne sait pas s'il doit résumer, critiquer, comparer, ou extraire des données. Plus votre consigne est spécifique, plus le résultat sera utile.

### 🔒 Contraintes
Quelles limites imposez-vous ? Longueur, ton, format, interdictions ?

> "Maximum 200 mots. Ton professionnel. Pas de jargon technique. Pas de bullet points — rédige en paragraphes."

Les contraintes empêchent le modèle de divaguer. Sans elles, un LLM a tendance à être verbeux et générique. Les contraintes forcent la précision.

### 📦 Format de sortie
Comment le résultat doit-il être structuré ?

> "Retourne le résultat en JSON avec les champs : title (string), summary (string), risk_level (low/medium/high)."

Ou bien :

> "Formate ta réponse comme un email professionnel avec objet, corps et signature."

Définir le format est critique quand le résultat sera lu par un humain (email, rapport) ou consommé par du code (JSON, CSV).

---

## 4. Exemples concrets : avant/après

### Exemple 1 — Classification

**Prompt faible :**
> "De quoi parle ce texte ?"

**Problème :** trop vague. Le modèle peut résumer, thématiser, lister des mots-clés, ou interpréter la question de 10 façons différentes.

**Prompt amélioré :**
> "Classifie le texte ci-dessous dans exactement UNE de ces catégories : TECHNOLOGIE, FINANCE, SANTÉ, POLITIQUE, SPORT. Réponds uniquement avec le nom de la catégorie, sans explication."

**Pourquoi c'est mieux :** catégories claires, format contraint (un seul mot), pas d'ambiguïté sur la tâche.

---

### Exemple 2 — Résumé

**Prompt faible :**
> "Résume cet article."

**Problème :** aucune indication sur la longueur, le public, le format, l'angle.

**Prompt amélioré :**
> "Résume cet article en exactement 3 bullet points. Chaque point fait maximum 20 mots. Le résumé s'adresse à un manager pressé qui veut comprendre les enjeux en 30 secondes. Commence chaque point par un verbe d'action."

**Pourquoi c'est mieux :** longueur fixe, public cible défini, format imposé, style prescrit. Le modèle n'a aucune latitude pour divaguer.

---

### Exemple 3 — Extraction de données

**Prompt faible :**
> "Quels sont les chiffres importants dans ce texte ?"

**Problème :** "importants" est subjectif. Le modèle ne sait pas quels chiffres vous intéressent ni comment les présenter.

**Prompt amélioré :**
> "Extrais tous les montants financiers mentionnés dans le texte ci-dessous. Pour chaque montant, indique : le montant exact, la devise, et le contexte (en 5 mots max). Présente le résultat sous forme de tableau markdown avec les colonnes : Montant | Devise | Contexte."

**Pourquoi c'est mieux :** critère objectif ("montants financiers" vs "chiffres importants"), structure définie, format tableau.

---

## 5. Les pièges du zero-shot

### Piège 1 : "Le modèle sait ce que je veux"
Non. Le modèle ne lit pas dans vos pensées. Si vous écrivez "fais-moi un résumé", il va produire SON idée d'un résumé, pas la vôtre. Tout ce qui n'est pas explicite dans votre prompt est laissé au hasard.

### Piège 2 : les instructions contradictoires
> "Sois concis et détaillé." 

Le modèle ne sait pas comment résoudre cette contradiction. Il va généralement ignorer l'une des deux contraintes. Choisissez.

### Piège 3 : l'absence de format
Si vous ne spécifiez pas de format, le modèle choisit pour vous — et il choisit souvent mal (trop long, mauvaise structure, mix de styles). Spécifiez TOUJOURS le format.

### Piège 4 : les mots vagues
"Intéressant", "pertinent", "bien", "court", "détaillé" — ces mots ne veulent rien dire pour un LLM. Remplacez-les par des critères mesurables :
- "court" → "maximum 100 mots"
- "détaillé" → "inclus 3 exemples concrets avec des chiffres"
- "pertinent" → "lié au secteur bancaire en Europe"

### Piège 5 : trop d'instructions à la fois
Un prompt qui demande 10 choses différentes en un seul bloc va produire un résultat médiocre. Si votre tâche est complexe, décomposez-la en étapes (vous apprendrez ça dans le Module 3 — Chain-of-Thought).

---

## 6. Quand utiliser le zero-shot vs autre chose ?

| Situation | Technique recommandée |
|-----------|----------------------|
| Tâche simple et courante (résumer, traduire, reformuler) | **Zero-shot** ✅ |
| Classification avec des catégories inhabituelles | Few-shot (Module 2) |
| Problème qui nécessite du raisonnement étape par étape | Chain-of-thought (Module 3) |
| Besoin d'un comportement très spécifique et constant | System prompt (Module 4) |
| Sortie qui doit être parsable par du code | Structured output (Module 5) |

Le zero-shot est votre **point de départ par défaut**. Si le résultat ne vous satisfait pas, vous passez au few-shot (ajout d'exemples) ou au chain-of-thought (décomposition du raisonnement). C'est une escalade progressive, pas un choix binaire.

---

## 7. Checklist avant de soumettre un prompt zero-shot

Avant de valider votre prompt, vérifiez ces points :

- [ ] **Objectif clair** — est-ce que quelqu'un d'autre comprendrait la tâche en lisant mon prompt ?
- [ ] **Public cible** — ai-je précisé pour qui est le résultat ?
- [ ] **Contraintes** — ai-je fixé au moins une contrainte (longueur, ton, format) ?
- [ ] **Format de sortie** — ai-je dit au modèle comment structurer sa réponse ?
- [ ] **Pas de mots vagues** — ai-je remplacé "court", "détaillé", "pertinent" par des critères mesurables ?
- [ ] **Pas d'exemples** — si j'ai ajouté des exemples, ce n'est plus du zero-shot (passez au Module 2)

---

## 8. Pour aller plus loin

- **OpenAI — Prompt Engineering Guide** : le guide officiel d'OpenAI, clair et pratique
- **Anthropic — Prompt Engineering Documentation** : les recommandations d'Anthropic pour Claude
- **Lilian Weng — Prompt Engineering (blog)** : une synthèse académique des techniques de prompting
- **DAIR.ai — Prompt Engineering Guide** : un guide communautaire complet et à jour

---

## Résumé du module

Le zero-shot, c'est l'art de formuler une instruction tellement précise que le modèle n'a pas besoin d'exemples pour comprendre ce que vous voulez. Retenez les 4C : **Contexte, Consigne, Contraintes, Format de sortie**. Si votre prompt a ces 4 éléments, vous êtes déjà meilleur que 90% des utilisateurs de LLM.

Dans le prochain module, vous apprendrez à aller plus loin en fournissant des exemples au modèle — c'est le **few-shot prompting**.

---

# Module 1 — Zero-Shot Prompting (English Version)

---

## 1. What is Zero-Shot?

When you use ChatGPT, Claude, or any other LLM, you're already doing zero-shot prompting without knowing it. You type an instruction, the model responds. No examples, no prior demonstration — just your instruction.

**Zero-shot** = you ask the model to perform a task **without showing it any examples** of what you expect.

It's the default mode of prompt engineering, and paradoxically, the most demanding. Why? Because without examples to guide the model, **the quality of your instruction is your only leverage**.

A good zero-shot prompt is like a good brief to a freelancer you've never met: if your brief is vague, the result will be disappointing. If your brief is precise, you get exactly what you need.

---

## 2. Why Does It Work?

LLMs like Llama, GPT, or Claude were trained on billions of texts. They've "seen" summaries, classifications, translations, analyses — in every possible format. When you give them a clear instruction, they rely on these learned patterns to produce a result.

Zero-shot works well when:
- The task is **common** (summarize, classify, translate, rephrase)
- The instruction is **clear and specific**
- The output format is **well-defined**

Zero-shot works poorly when:
- The task is **unusual** or highly specialized
- The instruction is **ambiguous** (the model doesn't know what you want)
- You need a **very specific behavior** that only examples could illustrate

In those cases, you switch to few-shot (Module 2) or chain-of-thought (Module 3).

---

## 3. Anatomy of a Good Zero-Shot Prompt

An effective zero-shot prompt contains 4 components — the "4C's":

### 🎯 Context
Who are you? Who is the result for? What's the situation?

> ❌ "Summarize this text."
>
> ✅ "You are a senior financial analyst. Summarize this quarterly report for the bank's board of directors. The readers are non-technical executives who want to understand the business impact."

Context shapes the tone, vocabulary, and level of detail. The same text will be summarized very differently for a CEO versus an engineer.

### 📋 Command
What should the model do? Be explicit and precise.

> ❌ "Analyze this text."
>
> ✅ "Identify the 3 main risks mentioned in this text, rank them by severity, and for each one provide an actionable recommendation in one sentence."

"Analyze" is vague. The model doesn't know if it should summarize, critique, compare, or extract data. The more specific your command, the more useful the result.

### 🔒 Constraints
What limits do you impose? Length, tone, format, prohibitions?

> "Maximum 200 words. Professional tone. No technical jargon. No bullet points — write in paragraphs."

Constraints prevent the model from rambling. Without them, LLMs tend to be verbose and generic. Constraints force precision.

### 📦 Output Format
How should the result be structured?

> "Return the result as JSON with these fields: title (string), summary (string), risk_level (low/medium/high)."

Or:

> "Format your response as a professional email with subject line, body, and signature."

Defining the format is critical when the result will be read by a human (email, report) or consumed by code (JSON, CSV).

---

## 4. Concrete Examples: Before/After

### Example 1 — Classification

**Weak prompt:**
> "What is this text about?"

**Problem:** too vague. The model could summarize, identify themes, list keywords, or interpret the question 10 different ways.

**Improved prompt:**
> "Classify the text below into exactly ONE of these categories: TECHNOLOGY, FINANCE, HEALTH, POLITICS, SPORTS. Respond with only the category name, no explanation."

**Why it's better:** clear categories, constrained format (one word only), no ambiguity about the task.

---

### Example 2 — Summarization

**Weak prompt:**
> "Summarize this article."

**Problem:** no indication of length, audience, format, or angle.

**Improved prompt:**
> "Summarize this article in exactly 3 bullet points. Each point is maximum 20 words. The summary is for a busy manager who needs to understand the key issues in 30 seconds. Start each point with an action verb."

**Why it's better:** fixed length, defined target audience, imposed format, prescribed style. The model has zero room to ramble.

---

### Example 3 — Data Extraction

**Weak prompt:**
> "What are the important numbers in this text?"

**Problem:** "important" is subjective. The model doesn't know which numbers you care about or how to present them.

**Improved prompt:**
> "Extract all financial amounts mentioned in the text below. For each amount, indicate: the exact figure, the currency, and the context (in 5 words max). Present the result as a markdown table with columns: Amount | Currency | Context."

**Why it's better:** objective criteria ("financial amounts" vs "important numbers"), defined structure, table format.

---

## 5. Zero-Shot Traps

### Trap 1: "The model knows what I want"
No. The model cannot read your mind. If you write "give me a summary," it will produce ITS idea of a summary, not yours. Everything not explicit in your prompt is left to chance.

### Trap 2: Contradictory instructions
> "Be concise and detailed."

The model doesn't know how to resolve this contradiction. It will generally ignore one of the two constraints. Choose.

### Trap 3: No format specified
If you don't specify a format, the model chooses for you — and it often chooses poorly (too long, wrong structure, mixed styles). ALWAYS specify the format.

### Trap 4: Vague words
"Interesting," "relevant," "good," "short," "detailed" — these words mean nothing to an LLM. Replace them with measurable criteria:
- "short" → "maximum 100 words"
- "detailed" → "include 3 concrete examples with numbers"
- "relevant" → "related to the European banking sector"

### Trap 5: Too many instructions at once
A prompt that asks for 10 different things in one block will produce mediocre results. If your task is complex, break it into steps (you'll learn this in Module 3 — Chain-of-Thought).

---

## 6. When to Use Zero-Shot vs Something Else

| Situation | Recommended Technique |
|-----------|----------------------|
| Simple, common task (summarize, translate, rephrase) | **Zero-shot** ✅ |
| Classification with unusual categories | Few-shot (Module 2) |
| Problem requiring step-by-step reasoning | Chain-of-thought (Module 3) |
| Need for very specific, consistent behavior | System prompt (Module 4) |
| Output must be parsable by code | Structured output (Module 5) |

Zero-shot is your **default starting point**. If the result doesn't satisfy you, escalate to few-shot (add examples) or chain-of-thought (decompose reasoning). It's a progressive escalation, not a binary choice.

---

## 7. Checklist Before Submitting a Zero-Shot Prompt

Before validating your prompt, check these points:

- [ ] **Clear objective** — would someone else understand the task by reading my prompt?
- [ ] **Target audience** — did I specify who the result is for?
- [ ] **Constraints** — did I set at least one constraint (length, tone, format)?
- [ ] **Output format** — did I tell the model how to structure its response?
- [ ] **No vague words** — did I replace "short," "detailed," "relevant" with measurable criteria?
- [ ] **No examples** — if I added examples, it's no longer zero-shot (go to Module 2)

---

## 8. Going Further

- **OpenAI — Prompt Engineering Guide**: OpenAI's official guide, clear and practical
- **Anthropic — Prompt Engineering Documentation**: Anthropic's recommendations for Claude
- **Lilian Weng — Prompt Engineering (blog)**: an academic synthesis of prompting techniques
- **DAIR.ai — Prompt Engineering Guide**: a comprehensive, up-to-date community guide

---

## Module Summary

Zero-shot is the art of writing an instruction so precise that the model doesn't need examples to understand what you want. Remember the 4C's: **Context, Command, Constraints, Output Format**. If your prompt has these 4 elements, you're already better than 90% of LLM users.

In the next module, you'll learn to go further by providing examples to the model — that's **few-shot prompting**.
