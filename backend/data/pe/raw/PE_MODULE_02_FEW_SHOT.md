# Module 2 — Few-Shot Prompting

---

## 1. Le zero-shot ne suffit pas toujours

Vous avez appris dans le Module 1 à rédiger des prompts sans exemples. C'est puissant, mais parfois insuffisant. Imaginez que vous demandiez à un LLM de classifier des emails internes selon une taxonomie propre à votre entreprise — "P1-Urgent", "P2-Standard", "P3-Info" — le modèle n'a jamais vu ces catégories. En zero-shot, il va deviner. En few-shot, vous lui **montrez** ce que vous voulez.

**Few-shot** = vous fournissez **quelques exemples** (2 à 5) au modèle pour illustrer le comportement attendu avant de lui poser votre question.

C'est la différence entre dire à quelqu'un "trie ces dossiers" (zero-shot) et lui montrer 3 dossiers déjà triés puis dire "continue comme ça" (few-shot). Le résultat est radicalement meilleur dans le second cas.

---

## 2. Pourquoi ça marche ?

Les LLM sont des machines à reconnaître des patterns. Quand vous fournissez des exemples dans votre prompt, le modèle détecte automatiquement :
- Le **format** de la sortie (JSON, une seule ligne, tableau...)
- Le **style** de réponse (formel, technique, court...)
- La **logique** de transformation (input → output)
- Les **cas limites** (comment traiter les ambiguïtés)

Ce phénomène s'appelle l'**apprentissage en contexte** (in-context learning). Le modèle n'est pas réentraîné — il utilise vos exemples comme un "mode d'emploi temporaire" pour cette requête uniquement.

**Point clé** : la qualité des exemples compte plus que leur quantité. 2 exemples bien choisis battent 10 exemples médiocres.

---

## 3. Anatomie d'un bon prompt few-shot

Un prompt few-shot a 3 parties :

### 📐 L'instruction
Comme en zero-shot, vous commencez par expliquer la tâche. Mais plus brièvement, car les exemples vont faire le gros du travail.

> "Classifie le sentiment de chaque avis client comme POSITIF, NEUTRE ou NÉGATIF."

### 📎 Les exemples
C'est le cœur du few-shot. Chaque exemple est une paire **input → output** qui illustre le comportement attendu.

> Avis : "Le produit est arrivé en avance et fonctionne parfaitement."
> Sentiment : POSITIF
>
> Avis : "La livraison était dans les délais, rien de spécial à signaler."
> Sentiment : NEUTRE
>
> Avis : "Produit défectueux, service client injoignable. Honteux."
> Sentiment : NÉGATIF

### ❓ La requête
L'input réel que le modèle doit traiter, présenté exactement dans le même format que les exemples.

> Avis : "La qualité est correcte pour le prix, mais l'emballage était abîmé."
> Sentiment :

Le modèle complète naturellement en suivant le pattern établi par les exemples.

---

## 4. Les 5 règles d'or des exemples

### Règle 1 : Cohérence de format absolue

**Tous** vos exemples doivent suivre **exactement** le même format. Si un exemple utilise "Sentiment : POSITIF" et un autre "→ positif", le modèle ne saura pas lequel imiter.

> ❌ Incohérent :
> ```
> Texte: "Super produit" → POSITIF
> Input: "Mauvaise qualité" / Résultat: négatif
> "Correct" -- Sentiment = Neutre
> ```
>
> ✅ Cohérent :
> ```
> Texte : "Super produit"
> Sentiment : POSITIF
>
> Texte : "Mauvaise qualité"
> Sentiment : NÉGATIF
>
> Texte : "Correct"
> Sentiment : NEUTRE
> ```

Le format est un contrat. Si vous le brisez dans les exemples, le modèle le brisera dans sa réponse.

### Règle 2 : Couvrir les cas difficiles

N'utilisez pas vos exemples pour montrer des cas évidents. Le modèle sait déjà que "Extraordinaire !" est positif. Utilisez vos exemples pour montrer les **cas limites** — les cas où la bonne réponse n'est pas évidente.

> ❌ Exemples trop faciles :
> - "J'adore ce produit !" → POSITIF
> - "C'est horrible." → NÉGATIF
> - "Bien." → POSITIF
>
> ✅ Exemples qui couvrent les ambiguïtés :
> - "Le produit fait le job, sans plus." → NEUTRE
> - "Bonne qualité mais le prix est excessif." → NEUTRE (pas négatif, malgré la critique)
> - "Je ne recommande pas, trop fragile." → NÉGATIF

Les cas limites sont ceux où le modèle a le plus besoin de guidance. C'est là que vos exemples ont le plus d'impact.

### Règle 3 : Diversité des exemples

Vos exemples doivent couvrir la **variété** des inputs possibles. Si tous vos exemples concernent des restaurants, le modèle va sur-adapter au domaine de la restauration.

> ❌ Tous du même domaine :
> - Restaurant → POSITIF
> - Restaurant → NÉGATIF
> - Restaurant → NEUTRE
>
> ✅ Domaines variés :
> - Restaurant → POSITIF
> - Logiciel SaaS → NÉGATIF
> - Hôtel → NEUTRE

La diversité enseigne au modèle que le pattern est **la classification de sentiment en général**, pas la classification d'avis de restaurant.

### Règle 4 : Le bon nombre d'exemples

- **2-3 exemples** : suffisant pour les tâches simples (classification binaire, extraction simple)
- **4-5 exemples** : nécessaire pour les tâches avec plus de catégories ou des formats complexes
- **Au-delà de 5** : rarement utile et consomme du contexte. Si vous avez besoin de plus de 5 exemples, votre tâche est probablement trop complexe pour du few-shot

**Attention au coût** : chaque exemple consomme des tokens dans la fenêtre de contexte du LLM. Plus d'exemples = plus cher et plus lent. Trouvez le minimum efficace.

### Règle 5 : L'ordre compte

Le modèle accorde plus d'attention aux derniers exemples (effet de récence). Placez vos exemples stratégiquement :
- Commencez par un exemple clair et typique (pour établir le pattern)
- Terminez par l'exemple le plus proche du cas réel (pour maximiser la pertinence)
- Mettez les cas limites au milieu

---

## 5. Exemples concrets : avant/après

### Exemple 1 — Extraction structurée

**Prompt faible :**
> "Convertis cette description de produit en JSON."
> 
> Produit : Chaise de bureau ergonomique, noire, 299€, réglable en hauteur, accoudoirs 3D.

**Problème :** aucun exemple. Le modèle ne sait pas quels champs utiliser, quel format de prix, quels types de données.

**Prompt amélioré :**
> Convertis chaque description de produit en JSON avec les champs : name, color, price (number), features (array).
>
> Description : Table basse en chêne, finition naturelle, 159€, pieds compas, plateau ovale.
> JSON : {"name": "Table basse en chêne", "color": "naturelle", "price": 159, "features": ["pieds compas", "plateau ovale"]}
>
> Description : Lampe de chevet LED, blanche, 45€, tactile, 3 intensités.
> JSON : {"name": "Lampe de chevet LED", "color": "blanche", "price": 45, "features": ["tactile", "3 intensités"]}
>
> Description : Chaise de bureau ergonomique, noire, 299€, réglable en hauteur, accoudoirs 3D.
> JSON :

**Pourquoi c'est mieux :** les exemples montrent que `price` est un nombre (pas "299€"), que `features` est un array, et que le format est constant. Le modèle va reproduire exactement ce pattern.

---

### Exemple 2 — Traduction de ton

**Prompt faible :**
> "Réécris ce message en version professionnelle."
> 
> "Hey, le truc que tu m'as envoyé marche pas, tu peux checker ?"

**Prompt amélioré :**
> Réécris chaque message informel en version professionnelle adaptée à un email interne.
>
> Informel : "Salut, je peux pas venir demain, j'suis malade."
> Professionnel : "Bonjour, je vous informe que je serai absent demain pour raison de santé. Je reste joignable par email si nécessaire."
>
> Informel : "C'est bon j'ai fini le rapport, dis-moi si ça te va."
> Professionnel : "Veuillez trouver ci-joint le rapport finalisé. N'hésitez pas à me faire part de vos retours."
>
> Informel : "Hey, le truc que tu m'as envoyé marche pas, tu peux checker ?"
> Professionnel :

**Pourquoi c'est mieux :** les exemples définissent le niveau de formalité (vouvoiement, formules de politesse, structure). Sans eux, "professionnel" est subjectif — le modèle pourrait produire quelque chose de trop formel ou pas assez.

---

## 6. Few-shot pour des formats complexes

Le few-shot est particulièrement puissant pour les transformations **format → format**. Voici des cas d'usage courants :

### Texte → JSON
Montrez 2-3 exemples avec le schéma exact. Le modèle reproduit les champs, les types et la structure.

### Texte → SQL
Montrez des paires (question en langage naturel → requête SQL). Le modèle apprend le schéma de votre base de données via les exemples.

### Texte → Texte (réécriture)
Montrez le style cible : ton formel, résumé concis, traduction technique, etc.

### Texte → Catégorie (classification)
Le cas le plus classique. Montrez un exemple par catégorie pour fixer les frontières.

Dans tous ces cas, la **cohérence de format entre les exemples** est le facteur #1 de réussite.

---

## 7. Les pièges du few-shot

### Piège 1 : Exemples biaisés
Si tous vos exemples de classification sont POSITIF, le modèle va sur-classifier en POSITIF. Équilibrez vos exemples entre les catégories.

### Piège 2 : Format incohérent
Le piège le plus fréquent. Si un exemple retourne `{"price": "45€"}` et un autre `{"price": 45}`, le modèle ne saura pas lequel suivre. Vérifiez que chaque exemple suit **exactement** le même pattern.

### Piège 3 : Exemples trop similaires
3 exemples de classification de tweets politiques ne servent à rien si les 3 sont des tweets de même camp. Variez le contenu pour montrer la **généralité** du pattern.

### Piège 4 : Trop d'exemples
Au-delà de 5 exemples, vous consommez beaucoup de tokens sans gain de qualité. Si le modèle ne comprend pas avec 5 exemples, le problème est probablement dans la clarté de votre instruction, pas dans le nombre d'exemples.

### Piège 5 : Exemples incorrects
Si un de vos exemples contient une erreur (mauvaise catégorie, JSON invalide), le modèle risque de reproduire cette erreur. **Vérifiez chaque exemple avant de l'inclure.**

---

## 8. Zero-shot + Few-shot : quand basculer ?

Commencez **toujours** en zero-shot. Si le résultat n'est pas satisfaisant, identifiez **pourquoi** :

| Problème observé | Solution |
|-----------------|----------|
| Le modèle ne comprend pas le format souhaité | Ajoutez 2 exemples du format exact |
| Le modèle confond des catégories proches | Ajoutez des exemples aux frontières |
| Le modèle utilise le mauvais ton/style | Ajoutez des exemples du ton souhaité |
| Le modèle invente des champs ou ajoute du texte | Ajoutez des exemples "propres" sans rien en trop |
| Le résultat est correct mais pas assez précis | Améliorez d'abord votre instruction zero-shot |

La dernière ligne est importante : si votre instruction est vague, ajouter des exemples ne compensera pas. Corrigez d'abord l'instruction, puis ajoutez des exemples si nécessaire.

---

## 9. Checklist avant de soumettre un prompt few-shot

- [ ] **Instruction claire** — j'ai décrit la tâche avant les exemples
- [ ] **Format cohérent** — tous mes exemples suivent exactement le même pattern
- [ ] **Diversité** — mes exemples couvrent des cas variés, pas juste le cas facile
- [ ] **Cas limites** — j'ai inclus au moins un exemple ambigu ou difficile
- [ ] **Bon nombre** — j'utilise 2-5 exemples, pas plus
- [ ] **Exemples corrects** — chaque exemple est vérifié (pas d'erreur de catégorie, pas de JSON invalide)
- [ ] **Requête alignée** — ma question finale est dans le même format que les exemples
- [ ] **Pas de biais** — mes exemples sont équilibrés entre les catégories

---

## 10. Pour aller plus loin

- **Brown et al. (2020) — "Language Models are Few-Shot Learners"** : le papier fondateur de GPT-3 qui a popularisé le few-shot prompting
- **DAIR.ai — Few-Shot Prompting Guide** : exemples pratiques et comparaisons avec le zero-shot
- **Anthropic — Prompt Engineering: Give examples** : les recommandations d'Anthropic pour structurer les exemples

---

## Résumé du module

Le few-shot, c'est l'art de **montrer au modèle ce que vous voulez** au lieu de simplement le décrire. Les 5 règles d'or : cohérence de format, couverture des cas difficiles, diversité, bon nombre (2-5), et ordre stratégique. Commencez toujours en zero-shot, et passez au few-shot quand le modèle ne comprend pas votre format ou confond des catégories.

Dans le prochain module, vous apprendrez à aller encore plus loin en demandant au modèle de **raisonner étape par étape** — c'est le **chain-of-thought prompting**.

---

# Module 2 — Few-Shot Prompting (English Version)

---

## 1. Zero-Shot Isn't Always Enough

In Module 1, you learned to write prompts without examples. That's powerful, but sometimes insufficient. Imagine asking an LLM to classify internal emails using your company's own taxonomy — "P1-Urgent," "P2-Standard," "P3-Info" — the model has never seen these categories. In zero-shot, it'll guess. In few-shot, you **show** it what you want.

**Few-shot** = you provide **a few examples** (2 to 5) to the model to illustrate the expected behavior before asking your question.

It's the difference between telling someone "sort these files" (zero-shot) and showing them 3 already-sorted files then saying "keep going like this" (few-shot). The result is dramatically better in the second case.

---

## 2. Why Does It Work?

LLMs are pattern-recognition machines. When you provide examples in your prompt, the model automatically detects:
- The **format** of the output (JSON, single line, table...)
- The **style** of response (formal, technical, short...)
- The **transformation logic** (input → output)
- **Edge cases** (how to handle ambiguities)

This phenomenon is called **in-context learning**. The model isn't retrained — it uses your examples as a "temporary manual" for this request only.

**Key point**: example quality matters more than quantity. 2 well-chosen examples beat 10 mediocre ones.

---

## 3. Anatomy of a Good Few-Shot Prompt

A few-shot prompt has 3 parts:

### 📐 The Instruction
Like in zero-shot, you start by explaining the task. But more briefly, since the examples will do the heavy lifting.

> "Classify the sentiment of each customer review as POSITIVE, NEUTRAL, or NEGATIVE."

### 📎 The Examples
This is the heart of few-shot. Each example is an **input → output** pair illustrating the expected behavior.

> Review: "The product arrived early and works perfectly."
> Sentiment: POSITIVE
>
> Review: "Delivery was on time, nothing special to report."
> Sentiment: NEUTRAL
>
> Review: "Defective product, customer service unreachable. Shameful."
> Sentiment: NEGATIVE

### ❓ The Query
The actual input the model needs to process, presented in exactly the same format as the examples.

> Review: "Quality is decent for the price, but the packaging was damaged."
> Sentiment:

The model naturally completes by following the pattern established by the examples.

---

## 4. The 5 Golden Rules of Examples

### Rule 1: Absolute Format Consistency

**All** your examples must follow **exactly** the same format. If one example uses "Sentiment: POSITIVE" and another "→ positive," the model won't know which to imitate.

> ❌ Inconsistent:
> ```
> Text: "Great product" → POSITIVE
> Input: "Bad quality" / Result: negative
> "Decent" -- Sentiment = Neutral
> ```
>
> ✅ Consistent:
> ```
> Text: "Great product"
> Sentiment: POSITIVE
>
> Text: "Bad quality"
> Sentiment: NEGATIVE
>
> Text: "Decent"
> Sentiment: NEUTRAL
> ```

Format is a contract. If you break it in the examples, the model will break it in its response.

### Rule 2: Cover the Difficult Cases

Don't use your examples to show obvious cases. The model already knows that "Amazing!" is positive. Use your examples to show **edge cases** — cases where the right answer isn't obvious.

> ❌ Too-easy examples:
> - "I love this product!" → POSITIVE
> - "This is horrible." → NEGATIVE
> - "Good." → POSITIVE
>
> ✅ Examples covering ambiguities:
> - "The product does the job, nothing more." → NEUTRAL
> - "Good quality but the price is excessive." → NEUTRAL (not negative, despite the criticism)
> - "I don't recommend it, too fragile." → NEGATIVE

Edge cases are where the model needs guidance most. That's where your examples have the most impact.

### Rule 3: Example Diversity

Your examples should cover the **variety** of possible inputs. If all your examples are about restaurants, the model will over-adapt to the restaurant domain.

> ❌ All same domain:
> - Restaurant → POSITIVE
> - Restaurant → NEGATIVE
> - Restaurant → NEUTRAL
>
> ✅ Varied domains:
> - Restaurant → POSITIVE
> - SaaS Software → NEGATIVE
> - Hotel → NEUTRAL

Diversity teaches the model that the pattern is **sentiment classification in general**, not restaurant review classification.

### Rule 4: The Right Number of Examples

- **2-3 examples**: sufficient for simple tasks (binary classification, simple extraction)
- **4-5 examples**: needed for tasks with more categories or complex formats
- **Beyond 5**: rarely useful and consumes context. If the model doesn't get it with 5 examples, the problem is likely in your instruction clarity, not the example count

**Watch the cost**: each example consumes tokens in the LLM's context window. More examples = more expensive and slower. Find the effective minimum.

### Rule 5: Order Matters

The model pays more attention to the last examples (recency effect). Place your examples strategically:
- Start with a clear, typical example (to establish the pattern)
- End with the example closest to the real case (to maximize relevance)
- Put edge cases in the middle

---

## 5. Concrete Examples: Before/After

### Example 1 — Structured Extraction

**Weak prompt:**
> "Convert this product description to JSON."
>
> Product: Ergonomic office chair, black, €299, height adjustable, 3D armrests.

**Problem:** no examples. The model doesn't know which fields to use, what price format, what data types.

**Improved prompt:**
> Convert each product description to JSON with fields: name, color, price (number), features (array).
>
> Description: Oak coffee table, natural finish, €159, compass legs, oval top.
> JSON: {"name": "Oak coffee table", "color": "natural", "price": 159, "features": ["compass legs", "oval top"]}
>
> Description: LED bedside lamp, white, €45, touch-activated, 3 brightness levels.
> JSON: {"name": "LED bedside lamp", "color": "white", "price": 45, "features": ["touch-activated", "3 brightness levels"]}
>
> Description: Ergonomic office chair, black, €299, height adjustable, 3D armrests.
> JSON:

**Why it's better:** the examples show that `price` is a number (not "€299"), that `features` is an array, and that the format is constant. The model will reproduce this exact pattern.

---

### Example 2 — Tone Translation

**Weak prompt:**
> "Rewrite this message in a professional version."
>
> "Hey, the thing you sent doesn't work, can you check?"

**Improved prompt:**
> Rewrite each informal message as a professional version suitable for an internal email.
>
> Informal: "Hey, I can't make it tomorrow, I'm sick."
> Professional: "Hello, I would like to inform you that I will be absent tomorrow due to health reasons. I remain reachable by email if needed."
>
> Informal: "Done with the report, let me know if it works for you."
> Professional: "Please find attached the finalized report. Do not hesitate to share your feedback."
>
> Informal: "Hey, the thing you sent doesn't work, can you check?"
> Professional:

**Why it's better:** the examples define the formality level (polite phrases, structure). Without them, "professional" is subjective — the model could produce something too formal or not formal enough.

---

## 6. Few-Shot for Complex Formats

Few-shot is particularly powerful for **format → format** transformations. Common use cases:

### Text → JSON
Show 2-3 examples with the exact schema. The model reproduces fields, types, and structure.

### Text → SQL
Show pairs of (natural language question → SQL query). The model learns your database schema through the examples.

### Text → Text (rewriting)
Show the target style: formal tone, concise summary, technical translation, etc.

### Text → Category (classification)
The most classic case. Show one example per category to fix the boundaries.

In all these cases, **format consistency between examples** is the #1 success factor.

---

## 7. Few-Shot Traps

### Trap 1: Biased Examples
If all your classification examples are POSITIVE, the model will over-classify as POSITIVE. Balance your examples across categories.

### Trap 2: Inconsistent Format
The most frequent trap. If one example returns `{"price": "€45"}` and another `{"price": 45}`, the model won't know which to follow. Verify that every example follows **exactly** the same pattern.

### Trap 3: Too-Similar Examples
3 examples of political tweet classification are useless if all 3 are tweets from the same camp. Vary the content to show the **generality** of the pattern.

### Trap 4: Too Many Examples
Beyond 5 examples, you consume lots of tokens with no quality gain. If the model doesn't get it with 5 examples, the problem is probably in your instruction clarity, not the example count.

### Trap 5: Incorrect Examples
If one of your examples contains an error (wrong category, invalid JSON), the model may reproduce that error. **Verify each example before including it.**

---

## 8. Zero-Shot + Few-Shot: When to Switch?

**Always** start with zero-shot. If the result isn't satisfactory, identify **why**:

| Observed Problem | Solution |
|-----------------|----------|
| Model doesn't understand the desired format | Add 2 examples of the exact format |
| Model confuses similar categories | Add examples at the boundaries |
| Model uses the wrong tone/style | Add examples of the desired tone |
| Model invents fields or adds extra text | Add "clean" examples with nothing extra |
| Result is correct but not precise enough | Improve your zero-shot instruction first |

The last row is important: if your instruction is vague, adding examples won't compensate. Fix the instruction first, then add examples if needed.

---

## 9. Checklist Before Submitting a Few-Shot Prompt

- [ ] **Clear instruction** — I described the task before the examples
- [ ] **Consistent format** — all my examples follow exactly the same pattern
- [ ] **Diversity** — my examples cover varied cases, not just the easy one
- [ ] **Edge cases** — I included at least one ambiguous or difficult example
- [ ] **Right number** — I'm using 2-5 examples, no more
- [ ] **Correct examples** — each example is verified (no category errors, no invalid JSON)
- [ ] **Aligned query** — my final question is in the same format as the examples
- [ ] **No bias** — my examples are balanced across categories

---

## 10. Going Further

- **Brown et al. (2020) — "Language Models are Few-Shot Learners"**: the foundational GPT-3 paper that popularized few-shot prompting
- **DAIR.ai — Few-Shot Prompting Guide**: practical examples and comparisons with zero-shot
- **Anthropic — Prompt Engineering: Give examples**: Anthropic's recommendations for structuring examples

---

## Module Summary

Few-shot is the art of **showing the model what you want** instead of just describing it. The 5 golden rules: format consistency, edge case coverage, diversity, right number (2-5), and strategic ordering. Always start with zero-shot, and switch to few-shot when the model doesn't understand your format or confuses categories.

In the next module, you'll learn to go even further by asking the model to **reason step by step** — that's **chain-of-thought prompting**.
