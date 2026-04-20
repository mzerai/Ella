# Module 5 — Structured Output

---

## 1. Le LLM ne parle pas que le français — il parle aussi le JSON

Vous avez appris à obtenir des réponses claires (zero-shot), fiables (few-shot), rigoureuses (chain-of-thought) et cadrées (system prompts). Mais jusqu'ici, le LLM vous retourne du texte que **vous** lisez.

Et si c'est du code qui lit la sortie ?

Quand un LLM s'intègre dans un pipeline — une application web, une API, un workflow d'automatisation — il doit produire une sortie que du code peut **parser automatiquement**. Pas du texte libre avec des paragraphes, mais du JSON, du CSV, du SQL, du YAML.

**Structured output** = obtenir du LLM une sortie dans un **format précis et parsable** (JSON, CSV, tableau, XML) que du code peut consommer directement sans traitement humain.

C'est la compétence qui transforme un prompt engineer en quelqu'un qui peut **intégrer l'IA dans des systèmes réels**. Résumer un article c'est utile ; retourner un JSON parsable avec les entités extraites, c'est déployable en production.

---

## 2. Pourquoi c'est difficile ?

Les LLM sont entraînés sur du langage naturel — du texte humain. Leur instinct naturel est d'**écrire comme un humain** : des phrases, des paragraphes, des explications. Quand vous demandez du JSON, le modèle est tenté de :

- Ajouter une phrase d'introduction avant le JSON ("Voici le résultat :")
- Ajouter une explication après le JSON ("J'espère que ça vous aide !")
- Entourer le JSON de triple backticks markdown (```json ... ```)
- Utiliser des types incorrects ("price": "45€" au lieu de "price": 45)
- Inventer des champs non demandés
- Produire du JSON invalide (virgule manquante, guillemet oublié)

Chacun de ces comportements **casse votre parser**. Un `json.loads()` qui reçoit "Voici le résultat :\n{...}" plante immédiatement.

La bonne nouvelle : avec les bonnes techniques, vous pouvez obtenir du JSON valide dans **95%+ des cas**. Les 5% restants se gèrent avec du code de fallback.

---

## 3. Les 4 techniques pour du structured output fiable

### Technique 1 : L'instruction directe

La plus simple. Dites explicitement ce que vous voulez, et surtout ce que vous ne voulez pas.

> "Réponds UNIQUEMENT en JSON valide. Pas de texte avant, pas de texte après, pas de backticks markdown. Le JSON doit être directement parsable par json.loads() en Python."

Cette phrase magique ("directement parsable par json.loads()") est étonnamment efficace. Le modèle comprend la contrainte technique et évite les pièges courants.

### Technique 2 : Le schéma explicite

Ne dites pas juste "retourne du JSON" — montrez **exactement** la structure attendue.

> "Retourne un JSON avec cette structure exacte :
> {
>   \"name\": \"string\",
>   \"category\": \"electronics|clothing|food|other\",
>   \"price\": number (pas de symbole monétaire),
>   \"in_stock\": boolean,
>   \"tags\": [\"string\", \"string\"]
> }"

En spécifiant les types (string, number, boolean), les valeurs possibles (enum), et les contraintes (pas de symbole monétaire), vous éliminez la majorité des erreurs.

### Technique 3 : L'exemple concret

Comme en few-shot, montrer un exemple de la sortie attendue est plus efficace que de la décrire.

> "Voici un exemple de sortie attendue :
> {\"name\": \"Chaise bureau\", \"category\": \"furniture\", \"price\": 299, \"in_stock\": true, \"tags\": [\"ergonomic\", \"adjustable\"]}
>
> Maintenant, traite le produit suivant en utilisant exactement le même format :"

L'exemple fixe le format de façon non ambiguë. Le modèle reproduit la structure exacte.

### Technique 4 : Le system prompt dédié

Pour les cas où le LLM est utilisé comme API (Lab 04), le format se définit dans le system prompt :

> System prompt : "Tu es un service de classification. Tu reçois un texte et tu retournes UNIQUEMENT du JSON valide. Schéma : {\"category\": \"string\", \"confidence\": float}. AUCUN texte en dehors du JSON. Si tu ne peux pas classifier, retourne {\"category\": \"unknown\", \"confidence\": 0.0}."

En combinant system prompt + instruction explicite, le taux de JSON valide approche 99%.

---

## 4. JSON — le format roi

JSON est le format de sortie le plus demandé pour les LLM en production. Voici les règles pour du JSON fiable.

### Règle 1 : Spécifiez les types

> ❌ "Retourne les informations du produit en JSON."
>
> ✅ "Retourne un JSON avec :
> - name : string
> - price : number (float, pas de devise)
> - available : boolean (true/false)
> - features : array de strings"

Sans types explicites, le modèle peut retourner `"price": "45 euros"` au lieu de `"price": 45.0`. Votre code plante au moment du calcul.

### Règle 2 : Définissez les enums

Quand un champ a un nombre limité de valeurs possibles, listez-les.

> "severity doit être exactement l'une de ces valeurs : \"low\", \"medium\", \"high\", \"critical\". Pas d'autre valeur."

Sans cette contrainte, le modèle peut inventer "moderate", "severe", "very high" — des valeurs que votre code ne sait pas traiter.

### Règle 3 : Gérez les valeurs nulles

Que fait le modèle quand une information n'est pas disponible ?

> "Si une information n'est pas trouvée dans le texte, utilise null pour les strings et 0 pour les numbers. Ne laisse JAMAIS un champ vide ou absent."

Sans cette règle, le modèle peut omettre un champ, retourner "N/A", ou inventer une valeur. Définissez le comportement par défaut.

### Règle 4 : Interdisez les ajouts

> "Retourne UNIQUEMENT les champs spécifiés. Ne rajoute PAS de champs supplémentaires comme 'explanation', 'note', ou 'comment'."

Les LLM adorent ajouter des commentaires. Si votre parser attend 5 champs et en reçoit 7, ça peut poser problème selon votre code.

### Règle 5 : Testez la parsabilité

Après chaque prompt, vérifiez que la sortie passe `json.loads()` en Python ou `JSON.parse()` en JavaScript. Si ce n'est pas le cas, identifiez l'erreur (backticks en trop ? texte ajouté ? virgule manquante ?) et ajustez votre prompt.

---

## 5. Au-delà du JSON : CSV, tableaux, et autres formats

### CSV

Le CSV est utile pour les datasets et les tableaux de données.

> "Génère un CSV avec le header 'name,category,price' suivi de 5 lignes de données.
> Règles :
> - Séparateur : virgule
> - Les textes contenant des virgules sont entre guillemets doubles
> - Pas de ligne vide
> - Pas de texte avant ou après le CSV"

**Piège courant** : le modèle oublie d'encadrer les textes avec des virgules. Si un nom de produit contient une virgule ("Chaise bureau, ergonomique"), ça casse le CSV. Précisez la règle des guillemets.

### Tableaux Markdown

Pour une sortie lisible par un humain mais structurée :

> "Présente les résultats sous forme de tableau markdown :
> | Nom | Catégorie | Prix |
> |-----|-----------|------|
> | ... | ...       | ...  |"

### YAML

Moins courant mais utile pour les fichiers de configuration :

> "Retourne le résultat en YAML valide, sans commentaires."

### XML

Rarement demandé mais parfois nécessaire pour des intégrations legacy :

> "Retourne le résultat en XML valide avec une racine <products>."

**Conseil** : privilégiez toujours JSON sauf si votre pipeline impose un autre format. JSON est le format le mieux supporté par les LLM.

---

## 6. Exemples concrets : avant/après

### Exemple 1 — Extraction d'entités en JSON

**Prompt faible :**
> "Quelles sont les entités importantes dans ce texte ?"

Résultat : un paragraphe de texte libre impossible à parser.

**Prompt structuré :**
> "Extrais les entités du texte ci-dessous et retourne UNIQUEMENT un JSON valide avec cette structure :
> {
>   \"persons\": [{\"name\": \"string\", \"role\": \"string\"}],
>   \"organizations\": [{\"name\": \"string\", \"sector\": \"string\"}],
>   \"amounts\": [{\"value\": number, \"currency\": \"string\", \"context\": \"string\"}],
>   \"sentiment\": \"positive\" | \"neutral\" | \"negative\"
> }
>
> Règles :
> - Pas de texte en dehors du JSON
> - Si un champ est inconnu, utilise \"unknown\"
> - Les montants sont des numbers, pas des strings"

Résultat : du JSON directement parsable avec toutes les entités structurées.

---

### Exemple 2 — Génération de dataset CSV

**Prompt faible :**
> "Génère des données de test pour un classificateur de sentiment."

Résultat : un mix de texte et de données dans un format aléatoire.

**Prompt structuré :**
> "Génère exactement 5 lignes de données CSV pour un classificateur de sentiment.
>
> Format :
> - Première ligne : header 'text,label,confidence'
> - text : un avis client de restaurant (entre guillemets si contient une virgule)
> - label : 'positive' ou 'negative' (exactement ces valeurs)
> - confidence : float entre 0.0 et 1.0 (2 décimales)
>
> Contraintes :
> - Exactement 5 lignes de données (pas 4, pas 6)
> - Au moins 2 positifs et 2 négatifs
> - Textes variés (pas de doublons)
> - Pas de texte avant ou après le CSV"

Résultat : un CSV propre, prêt à être ingéré par `pandas.read_csv()`.

---

### Exemple 3 — API JSON stricte

**Prompt faible :**
> "Analyse ce bug report."

Résultat : un long paragraphe d'analyse que votre backend ne peut pas traiter.

**Prompt structuré :**
> System prompt : "Tu es un service d'analyse de bugs. Réponds UNIQUEMENT en JSON valide."
>
> User prompt : "Analyse le rapport de bug suivant et retourne :
> {
>   \"severity\": \"low|medium|high|critical\",
>   \"category\": \"string (crash, ui, performance, security, data)\",
>   \"summary\": \"string (max 50 mots)\",
>   \"affected_users_percent\": number,
>   \"suggested_fix\": \"string (max 30 mots)\",
>   \"confidence\": float entre 0.0 et 1.0
> }
>
> Rapport : [texte du bug report]"

Résultat : un JSON que votre système de ticketing peut ingérer directement.

---

## 7. Gérer les échecs : quand le LLM ne respecte pas le format

Même avec un prompt parfait, le LLM va parfois dévier. Voici comment gérer les cas courants en code :

### Cas 1 : Texte avant/après le JSON

Le modèle retourne : "Voici le résultat :\n{...}\nJ'espère que ça aide !"

**Solution** : extraire le JSON avec une regex.

```
Pattern : chercher le premier { et le dernier } dans la réponse
```

### Cas 2 : Backticks markdown

Le modèle retourne : ` ```json\n{...}\n``` `

**Solution** : supprimer les backticks avant de parser.

### Cas 3 : JSON invalide (virgule en trop, guillemet manquant)

**Solution** : utiliser un parser tolérant ou renvoyer au LLM avec "Le JSON suivant est invalide. Corrige-le et retourne uniquement le JSON corrigé."

### Cas 4 : Champs manquants ou types incorrects

**Solution** : valider avec un schéma (JSON Schema, Pydantic) et utiliser des valeurs par défaut pour les champs manquants.

**Règle d'or du structured output en production** : ne faites **jamais** confiance à 100% à la sortie du LLM. Validez toujours côté code. Le prompt maximise la probabilité de succès, le code gère les cas d'échec.

---

## 8. La checklist du format parfait

Quand vous concevez un prompt pour du structured output, passez par ces étapes :

### Étape 1 : Définir le schéma
Quels champs ? Quels types ? Quels enums ? Quels défauts ?

### Étape 2 : Montrer un exemple
Un exemple concret de la sortie attendue vaut mieux que 10 lignes d'explications.

### Étape 3 : Lister les interdictions
Pas de texte hors format. Pas de champs supplémentaires. Pas de backticks.

### Étape 4 : Définir le comportement par défaut
Que faire quand une info manque ? null ? "unknown" ? 0 ?

### Étape 5 : Tester avec un parser
`json.loads()`, `csv.reader()`, ou équivalent. Si ça ne parse pas, le prompt n'est pas prêt.

---

## 9. Les pièges du structured output

### Piège 1 : Spécifier le format mais pas les types
"Retourne un JSON" sans préciser les types = le modèle choisit arbitrairement entre `"45"` (string) et `45` (number). Si votre code fait `price * quantity` et que price est un string, ça plante.

### Piège 2 : Pas de gestion des cas vides
Si le texte ne contient aucune entité, que retourne le modèle ? Sans instruction, il peut retourner "Aucune entité trouvée" (du texte, pas du JSON). Spécifiez : "Si aucune entité n'est trouvée, retourne {\"persons\": [], \"organizations\": []}."

### Piège 3 : Le JSON trop profond
Un JSON avec 5 niveaux d'imbrication est plus difficile à produire correctement. Gardez la structure aussi plate que possible. Si vous avez besoin de profondeur, montrez un exemple complet.

### Piège 4 : Oublier les caractères spéciaux
Les textes en français (accents, guillemets français « »), les emojis et les retours à la ligne dans les strings JSON posent des problèmes. Précisez l'encodage attendu si nécessaire.

### Piège 5 : Faire confiance sans valider
On le répète : le LLM va se tromper. Pas souvent, mais assez pour casser une application en production. Validez systématiquement la sortie en code. Le prompt est votre meilleure chance, pas une garantie.

---

## 10. Structured output dans le monde réel

Voici des cas d'usage réels où le structured output est critique :

| Cas d'usage | Format | Pourquoi |
|------------|--------|----------|
| Extraction d'entités pour un CRM | JSON | Alimenter automatiquement les fiches clients |
| Génération de données de test | CSV | Entraîner ou évaluer un modèle ML |
| Analyse de sentiment pour dashboard | JSON | Alimenter des graphiques en temps réel |
| Triage de tickets support | JSON | Intégrer dans Jira/Zendesk via API |
| Traduction de specs en SQL | SQL | Générer des requêtes pour un data analyst |
| Résumé structuré pour newsletter | JSON/Markdown | Alimenter un template d'email automatisé |
| Classification de documents | JSON | Router des documents dans un workflow |

Dans tous ces cas, le LLM n'est pas un interlocuteur — c'est un **composant** d'un système plus large. Et un composant qui retourne du texte libre au lieu de JSON est un composant cassé.

---

## 11. Checklist avant de soumettre un prompt structured output

- [ ] **Format spécifié** — JSON, CSV, ou autre, nommé explicitement
- [ ] **Schéma complet** — tous les champs avec leurs types
- [ ] **Enums définis** — les champs à valeurs limitées ont leurs valeurs listées
- [ ] **Exemple fourni** — au moins un exemple concret de la sortie attendue
- [ ] **Interdictions explicites** — pas de texte hors format, pas de backticks, pas de champs supplémentaires
- [ ] **Comportement par défaut** — défini pour les champs manquants ou les cas vides
- [ ] **Testé avec un parser** — `json.loads()` ou équivalent réussit sur la sortie
- [ ] **Types vérifiés** — les numbers sont des numbers, les booleans sont des booleans

---

## 12. Pour aller plus loin

- **OpenAI — Structured Outputs** : le guide officiel d'OpenAI pour forcer du JSON valide
- **Anthropic — Get structured output** : les recommandations d'Anthropic pour des sorties parsables
- **JSON Schema** : le standard de validation de structure JSON (utile pour valider les sorties)
- **Pydantic** : la bibliothèque Python de référence pour valider des données structurées

---

## Résumé du module

Le structured output, c'est l'art d'obtenir du LLM une sortie que du **code** peut lire, pas juste un humain. Les 4 techniques : instruction directe ("UNIQUEMENT du JSON"), schéma explicite (champs + types), exemple concret, et system prompt dédié. Le piège principal : faire confiance au LLM sans valider. En production, le prompt maximise la probabilité de succès, et le code gère les cas d'échec.

---

## Résumé du cursus complet

Vous avez maintenant les 5 compétences fondamentales du prompt engineering :

| Module | Compétence | En une phrase |
|--------|-----------|---------------|
| 1. Zero-shot | Formuler une instruction claire | Les 4C : Contexte, Consigne, Contraintes, Format |
| 2. Few-shot | Guider par l'exemple | Cohérence de format, diversité, cas limites |
| 3. Chain-of-thought | Forcer le raisonnement | Étapes explicites pour les tâches complexes |
| 4. System prompt | Configurer le comportement | Identité, périmètre, sécurité, garde-fous |
| 5. Structured output | Produire des sorties parsables | Schéma, types, validation, fallback en code |

Ces 5 techniques se combinent. Un prompt de production typique utilise un **system prompt** (Module 4) avec du **structured output** (Module 5), enrichi de **few-shot** (Module 2) si nécessaire, avec du **chain-of-thought** (Module 3) pour les tâches qui demandent du raisonnement.

Le prompt engineering n'est pas de la magie — c'est de l'**ingénierie de communication**. Vous apprenez à parler à une machine de façon précise, structurée et testable. Et comme toute ingénierie, ça s'améliore avec la pratique.

Bienvenue dans les labs. C'est maintenant que vous pratiquez. 🚀

---

# Module 5 — Structured Output (English Version)

---

## 1. The LLM Doesn't Just Speak English — It Also Speaks JSON

You've learned to get clear answers (zero-shot), reliable ones (few-shot), rigorous ones (chain-of-thought), and bounded ones (system prompts). But so far, the LLM returns text that **you** read.

What if code reads the output?

When an LLM integrates into a pipeline — a web app, an API, an automation workflow — it must produce output that code can **automatically parse**. Not free text with paragraphs, but JSON, CSV, SQL, YAML.

**Structured output** = getting the LLM to produce output in a **precise, parsable format** (JSON, CSV, table, XML) that code can consume directly without human processing.

This is the skill that transforms a prompt engineer into someone who can **integrate AI into real systems**. Summarizing an article is useful; returning parsable JSON with extracted entities is production-deployable.

---

## 2. Why Is It Hard?

LLMs are trained on natural language — human text. Their natural instinct is to **write like a human**: sentences, paragraphs, explanations. When you ask for JSON, the model is tempted to:

- Add an introductory sentence before the JSON ("Here are the results:")
- Add an explanation after the JSON ("I hope this helps!")
- Wrap JSON in markdown triple backticks (```json ... ```)
- Use incorrect types ("price": "€45" instead of "price": 45)
- Invent unrequested fields
- Produce invalid JSON (missing comma, forgotten quote)

Each of these behaviors **breaks your parser**. A `json.loads()` receiving "Here are the results:\n{...}" crashes immediately.

The good news: with the right techniques, you can get valid JSON in **95%+ of cases**. The remaining 5% are handled with fallback code.

---

## 3. The 4 Techniques for Reliable Structured Output

### Technique 1: Direct Instruction

The simplest. Explicitly state what you want, and especially what you don't want.

> "Respond ONLY with valid JSON. No text before, no text after, no markdown backticks. The JSON must be directly parsable by json.loads() in Python."

This magic phrase ("directly parsable by json.loads()") is surprisingly effective. The model understands the technical constraint and avoids common pitfalls.

### Technique 2: Explicit Schema

Don't just say "return JSON" — show **exactly** the expected structure.

> "Return a JSON with this exact structure:
> {
>   \"name\": \"string\",
>   \"category\": \"electronics|clothing|food|other\",
>   \"price\": number (no currency symbol),
>   \"in_stock\": boolean,
>   \"tags\": [\"string\", \"string\"]
> }"

By specifying types (string, number, boolean), possible values (enum), and constraints (no currency symbol), you eliminate the majority of errors.

### Technique 3: Concrete Example

Like in few-shot, showing an output example is more effective than describing it.

> "Here's an example of expected output:
> {\"name\": \"Office Chair\", \"category\": \"furniture\", \"price\": 299, \"in_stock\": true, \"tags\": [\"ergonomic\", \"adjustable\"]}
>
> Now process the following product using exactly the same format:"

The example fixes the format unambiguously. The model reproduces the exact structure.

### Technique 4: Dedicated System Prompt

For cases where the LLM is used as an API (Module 4), the format is defined in the system prompt:

> System prompt: "You are a classification service. You receive text and return ONLY valid JSON. Schema: {\"category\": \"string\", \"confidence\": float}. NO text outside the JSON. If you cannot classify, return {\"category\": \"unknown\", \"confidence\": 0.0}."

By combining system prompt + explicit instruction, the valid JSON rate approaches 99%.

---

## 4. JSON — The King of Formats

JSON is the most requested output format for LLMs in production. Here are the rules for reliable JSON.

### Rule 1: Specify types
Without explicit types, the model may return `"45"` (string) instead of `45` (number).

### Rule 2: Define enums
When a field has limited possible values, list them. Otherwise the model invents "moderate," "severe," "very high."

### Rule 3: Handle null values
Define what happens when information isn't available. null? "unknown"? 0?

### Rule 4: Forbid additions
LLMs love adding comments. Tell them explicitly: only the specified fields.

### Rule 5: Test parsability
After each prompt, verify the output passes `json.loads()` or `JSON.parse()`.

---

## 5. Beyond JSON: CSV, Tables, and Other Formats

### CSV
Useful for datasets. Specify separator, quote handling, and exact row count.

### Markdown Tables
For human-readable but structured output.

### YAML
Less common but useful for configuration files.

### XML
Rarely requested but sometimes needed for legacy integrations.

**Advice**: always prefer JSON unless your pipeline requires another format.

---

## 6. Concrete Examples: Before/After

### Example 1 — Entity Extraction in JSON

**Weak prompt:** "What are the important entities in this text?"
→ Free text paragraph, impossible to parse.

**Structured prompt:** Explicit schema with persons, organizations, amounts, sentiment, all with types and null handling.
→ Directly parsable JSON.

### Example 2 — CSV Dataset Generation

**Weak prompt:** "Generate test data for a sentiment classifier."
→ Random format mix.

**Structured prompt:** Exact header, exact row count, exact value constraints, explicit CSV rules.
→ Clean CSV ready for `pandas.read_csv()`.

### Example 3 — Strict JSON API

**Weak prompt:** "Analyze this bug report."
→ Long paragraph your backend can't process.

**Structured prompt:** System prompt enforcing JSON + explicit schema with severity, category, summary, confidence.
→ JSON your ticketing system can ingest directly.

---

## 7. Handling Failures: When the LLM Doesn't Respect the Format

Even with a perfect prompt, the LLM will sometimes deviate. Common cases and solutions:

1. **Text before/after JSON** → Extract with regex (find first `{` and last `}`)
2. **Markdown backticks** → Strip backticks before parsing
3. **Invalid JSON** → Use a tolerant parser or ask the LLM to fix it
4. **Missing fields or wrong types** → Validate with a schema and use defaults

**Golden rule**: never trust LLM output 100%. The prompt maximizes success probability; code handles failure cases.

---

## 8. The Perfect Format Checklist

1. Define the schema (fields, types, enums, defaults)
2. Show an example
3. List prohibitions (no text outside format, no extra fields, no backticks)
4. Define default behavior (for missing info or empty cases)
5. Test with a parser

---

## 9. Structured Output Traps

### Trap 1: Format without types
→ The model arbitrarily chooses between strings and numbers.

### Trap 2: No empty case handling
→ The model returns text instead of an empty JSON structure.

### Trap 3: Too-deep JSON
→ 5 levels of nesting is hard to produce correctly. Keep it flat.

### Trap 4: Forgetting special characters
→ French accents, special quotes, emojis, and newlines in JSON strings cause problems.

### Trap 5: Trusting without validating
→ The LLM will make mistakes. Not often, but enough to break a production app.

---

## 10. Structured Output in the Real World

| Use Case | Format | Why |
|----------|--------|-----|
| Entity extraction for CRM | JSON | Auto-populate customer records |
| Test data generation | CSV | Train or evaluate an ML model |
| Sentiment analysis for dashboard | JSON | Feed real-time charts |
| Support ticket triage | JSON | Integrate with Jira/Zendesk via API |
| Specs-to-SQL translation | SQL | Generate queries for data analysts |
| Structured summary for newsletter | JSON/Markdown | Feed automated email templates |
| Document classification | JSON | Route documents in a workflow |

In all these cases, the LLM isn't a conversationalist — it's a **component** of a larger system. And a component returning free text instead of JSON is a broken component.

---

## 11. Checklist Before Submitting a Structured Output Prompt

- [ ] **Format specified** — JSON, CSV, or other, named explicitly
- [ ] **Complete schema** — all fields with their types
- [ ] **Enums defined** — fields with limited values have their values listed
- [ ] **Example provided** — at least one concrete output example
- [ ] **Explicit prohibitions** — no text outside format, no backticks, no extra fields
- [ ] **Default behavior** — defined for missing fields or empty cases
- [ ] **Tested with a parser** — `json.loads()` or equivalent succeeds on the output
- [ ] **Types verified** — numbers are numbers, booleans are booleans

---

## 12. Going Further

- **OpenAI — Structured Outputs**: OpenAI's official guide for forcing valid JSON
- **Anthropic — Get structured output**: Anthropic's recommendations for parsable outputs
- **JSON Schema**: the standard for JSON structure validation
- **Pydantic**: the reference Python library for validating structured data

---

## Module Summary

Structured output is the art of getting the LLM to produce output that **code** can read, not just a human. The 4 techniques: direct instruction ("ONLY JSON"), explicit schema (fields + types), concrete example, and dedicated system prompt. The main trap: trusting the LLM without validating. In production, the prompt maximizes success probability, and code handles failure cases.

---

## Complete Curriculum Summary

You now have the 5 fundamental prompt engineering skills:

| Module | Skill | In One Sentence |
|--------|-------|-----------------|
| 1. Zero-shot | Clear instruction writing | The 4C's: Context, Command, Constraints, Output Format |
| 2. Few-shot | Guiding by example | Format consistency, diversity, edge cases |
| 3. Chain-of-thought | Forcing reasoning | Explicit steps for complex tasks |
| 4. System prompt | Configuring behavior | Identity, scope, security, guardrails |
| 5. Structured output | Producing parsable outputs | Schema, types, validation, code fallback |

These 5 techniques combine. A typical production prompt uses a **system prompt** (Module 4) with **structured output** (Module 5), enriched with **few-shot** (Module 2) if needed, and **chain-of-thought** (Module 3) for tasks requiring reasoning.

Prompt engineering isn't magic — it's **communication engineering**. You're learning to talk to a machine in a precise, structured, and testable way. And like all engineering, it improves with practice.

Welcome to the labs. This is where you practice. 🚀
