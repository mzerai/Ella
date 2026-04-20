# Module 3 — Chain-of-Thought Prompting

---

## 1. Le problème : les LLM ne réfléchissent pas (sauf si vous les y forcez)

Posez cette question à un LLM sans précaution :

> "Un magasin vend un article à 120€. Le lendemain, il baisse le prix de 25%, puis le surlendemain il l'augmente de 25%. Quel est le prix final ?"

Beaucoup de modèles répondront **120€** — "on enlève 25%, on rajoute 25%, c'est pareil". C'est faux. Le vrai prix final est **112,50€** (120 × 0.75 × 1.25). Le modèle a pris un raccourci mental au lieu de calculer étape par étape.

Le **chain-of-thought** (CoT) est la technique qui force le modèle à **montrer son raisonnement** avant de donner sa réponse. En l'obligeant à expliciter chaque étape, vous réduisez drastiquement ce type d'erreurs.

C'est contre-intuitif : demander au modèle de travailler **plus** (écrire ses étapes) lui fait produire des résultats **meilleurs**. En prompting, la paresse est l'ennemie de la précision.

---

## 2. Pourquoi ça marche ?

Un LLM génère des tokens un par un, de gauche à droite. Quand il saute directement à la réponse, il n'a pas d'espace pour "réfléchir" — il doit deviner le résultat final en un seul coup.

Quand vous lui demandez de raisonner étape par étape, vous lui offrez un **espace de travail intermédiaire**. Chaque étape écrite devient du contexte pour la suivante. Le modèle peut :
- Décomposer un problème complexe en sous-problèmes simples
- Vérifier chaque étape avant de passer à la suivante
- Corriger sa trajectoire en cours de raisonnement

C'est exactement comme un humain qui résout un problème de maths : vous n'essayez pas de deviner la réponse finale d'un coup, vous posez les calculs intermédiaires sur papier. Le CoT donne au LLM ce "papier brouillon".

**La recherche confirme l'impact** : le papier fondateur de Wei et al. (2022) a montré que le simple ajout de "Let's think step by step" dans un prompt améliorait les performances de GPT-3 sur des tâches de raisonnement mathématique de **+40 points de pourcentage**. Ce n'est pas marginal — c'est transformationnel.

---

## 3. Les 3 niveaux de chain-of-thought

### Niveau 1 — Le déclencheur simple

La forme la plus basique : ajouter une phrase qui active le raisonnement.

> "Résous ce problème. **Réfléchis étape par étape.**"

Ou en anglais :

> "Solve this problem. **Let's think step by step.**"

C'est étonnamment efficace pour un ajout aussi simple. Le modèle passe d'un mode "réponse directe" à un mode "raisonnement explicite". Mais vous n'avez aucun contrôle sur la structure des étapes.

### Niveau 2 — Le raisonnement structuré

Vous imposez une structure au raisonnement :

> "Résous ce problème en suivant ces étapes :
> Étape 1 : Identifie les données du problème
> Étape 2 : Pose la formule nécessaire
> Étape 3 : Effectue le calcul
> Étape 4 : Vérifie le résultat
> Étape 5 : Donne la réponse finale"

C'est plus puissant car vous guidez le modèle à travers un processus rigoureux. Il ne peut pas sauter d'étapes.

### Niveau 3 — Le CoT avec exemples (few-shot CoT)

Vous combinez few-shot et chain-of-thought : vous montrez un exemple complet avec le raisonnement, puis vous posez votre question.

> **Problème** : Un train part à 14h00 et roule à 80 km/h. Un autre part à 15h00 et roule à 120 km/h. Quand le second rattrape-t-il le premier ?
> **Raisonnement** :
> - À 15h00, le premier train a 1h d'avance, soit 80 km.
> - La différence de vitesse est 120 - 80 = 40 km/h.
> - Temps de rattrapage : 80 / 40 = 2 heures.
> - Le second rattrape le premier à 17h00.
> **Réponse** : 17h00
>
> **Problème** : [votre problème ici]
> **Raisonnement** :

C'est le niveau le plus fiable. L'exemple montre au modèle non seulement **quoi** faire, mais **comment** raisonner.

---

## 4. Au-delà des maths : le CoT pour l'analyse

Le chain-of-thought ne se limite pas au calcul. Il est puissant pour toute tâche qui nécessite un **jugement en plusieurs étapes** :

### Analyse de code
> "Analyse ce code. D'abord, décris ce que fait chaque bloc. Ensuite, identifie les bugs potentiels. Enfin, propose des corrections."

Sans CoT, le modèle pourrait manquer un bug subtil parce qu'il n'a pas pris le temps de comprendre le flux du programme.

### Prise de décision business
> "On hésite entre lancer le produit maintenant ou attendre 3 mois. Analyse d'abord les avantages de chaque option. Puis liste les risques. Puis donne ta recommandation avec ta justification."

Sans CoT, le modèle donnerait une recommandation directe sans peser les pour et les contre. Avec CoT, la recommandation est fondée sur une analyse explicite.

### Diagnostic
> "Un utilisateur signale que l'application est lente. Liste d'abord les causes possibles par ordre de probabilité. Pour chaque cause, indique comment la vérifier. Puis recommande par quoi commencer."

Le CoT transforme une réponse vague ("c'est peut-être la base de données") en une démarche structurée de diagnostic.

### Évaluation critique
> "Évalue cette proposition commerciale. D'abord, résume les points forts. Ensuite, identifie les faiblesses. Puis, évalue la faisabilité. Enfin, donne ta recommandation globale."

Le modèle est forcé de considérer tous les angles avant de conclure.

---

## 5. Anatomie d'un bon prompt CoT

Un prompt chain-of-thought efficace contient :

### 🎯 La tâche
Décrivez clairement ce que vous voulez obtenir au final.

### 🪜 Les étapes imposées
Listez les étapes que le modèle doit suivre. Soyez spécifique sur ce que chaque étape doit contenir.

### 🔒 La contrainte de format
Séparez clairement le raisonnement de la réponse finale. Le modèle doit produire les deux.

### ✅ La vérification (optionnelle mais recommandée)
Demandez au modèle de vérifier son propre résultat à la fin. Ça semble simpliste, mais ça attrape beaucoup d'erreurs.

**Exemple complet :**

> Résous le problème suivant.
>
> **Problème** : Une entreprise a 150 employés. 40% travaillent à distance. Parmi les employés à distance, 30% sont dans le fuseau horaire UTC+1 et les autres en UTC-5. Combien d'employés travaillent à distance en UTC-5 ?
>
> **Instructions** :
> 1. Identifie les données numériques du problème
> 2. Calcule le nombre d'employés à distance
> 3. Calcule le nombre d'employés en UTC+1
> 4. Déduis le nombre en UTC-5
> 5. Vérifie que tes chiffres sont cohérents (les parties doivent faire le tout)
>
> **Format** :
> - Montre chaque étape avec le calcul
> - Termine par "Réponse finale : [nombre]"

---

## 6. Exemples concrets : avant/après

### Exemple 1 — Calcul financier

**Sans CoT :**
> "Si j'investis 10 000€ à un taux annuel de 7% composé mensuellement, combien aurai-je après 5 ans ?"

Le modèle risque de faire un calcul simplifié (intérêts simples) ou de se tromper dans la formule.

**Avec CoT :**
> "Si j'investis 10 000€ à un taux annuel de 7% composé mensuellement, combien aurai-je après 5 ans ?
>
> Résous ce problème étape par étape :
> 1. Identifie les variables : capital initial, taux annuel, fréquence de composition, durée
> 2. Convertis le taux annuel en taux mensuel
> 3. Calcule le nombre total de périodes
> 4. Applique la formule des intérêts composés
> 5. Calcule le montant final
> 6. Vérifie : le résultat doit être supérieur à 10 000€ × 1.07^5"

**Résultat** : le modèle identifie correctement le taux mensuel (0.07/12), le nombre de périodes (60), et applique la bonne formule. Avec vérification.

---

### Exemple 2 — Analyse de bug

**Sans CoT :**
> "Pourquoi ce code ne marche pas ?"
> ```python
> def average(numbers):
>     total = 0
>     for n in numbers:
>         total += n
>     return total / len(numbers)
> ```

Le modèle pourrait dire "ça a l'air correct" et passer à côté du cas `numbers = []` (division par zéro).

**Avec CoT :**
> "Analyse ce code étape par étape :
> 1. Lis chaque ligne et décris ce qu'elle fait
> 2. Identifie les inputs possibles (cas normal, cas vide, cas avec un seul élément)
> 3. Trace l'exécution mentalement pour chaque cas
> 4. Identifie où ça peut échouer
> 5. Propose une correction"

**Résultat** : à l'étape 3, le modèle trace `numbers = []` → `total = 0` → `len(numbers) = 0` → **division par zéro**. Le bug est trouvé parce que le CoT a forcé l'analyse systématique des cas.

---

### Exemple 3 — Décision stratégique

**Sans CoT :**
> "Est-ce qu'on devrait passer de AWS à Google Cloud ?"

Réponse probable : un paragraphe vague avec des "ça dépend".

**Avec CoT :**
> "Notre startup héberge ses services sur AWS depuis 2 ans (budget mensuel : 4 500€, 3 ingénieurs formés AWS). Google Cloud propose un crédit de 100 000$ sur 2 ans.
>
> Analyse cette décision :
> 1. Liste les coûts de migration (techniques, formation, downtime)
> 2. Calcule l'économie réelle du crédit Google (100k$ sur 2 ans vs budget actuel)
> 3. Évalue les risques opérationnels (compétences équipe, compatibilité services)
> 4. Liste les avantages non-financiers éventuels
> 5. Donne ta recommandation avec un seuil de décision clair"

**Résultat** : une analyse structurée qui quantifie le coût de migration, compare avec le crédit, et donne une recommandation argumentée. Pas un vague "ça dépend".

---

## 7. Les pièges du chain-of-thought

### Piège 1 : CoT sur une tâche simple
Demander "réfléchis étape par étape" pour "traduis 'bonjour' en anglais" est inutile et ralentit la réponse. Le CoT est pour les tâches **complexes** — calcul multi-étapes, analyse, diagnostic, raisonnement logique. Pour les tâches simples, le zero-shot suffit.

### Piège 2 : pas de structure imposée
"Réfléchis étape par étape" est un bon début, mais le modèle peut produire des étapes désordonnées ou en oublier. Imposez les étapes explicitement si la rigueur est importante.

### Piège 3 : faire confiance aveuglément au raisonnement
Le modèle peut produire un raisonnement **convaincant mais faux**. Il peut écrire des étapes qui "ont l'air logiques" mais contiennent une erreur de calcul ou de logique. Ajoutez toujours une étape de vérification, et vérifiez vous-même les résultats critiques.

### Piège 4 : le CoT verbeux
Un raisonnement trop long dilue l'attention du modèle. Si votre problème nécessite 15 étapes, décomposez-le en 2-3 sous-problèmes avec chacun ses propres étapes. Un prompt CoT efficace a entre 3 et 7 étapes.

### Piège 5 : oublier la réponse finale
Le modèle peut se perdre dans son raisonnement et ne jamais conclure. Imposez explicitement : "Termine par 'Réponse finale : [ta réponse]'." Ça force le modèle à converger.

---

## 8. CoT + les autres techniques

Le chain-of-thought se combine avec tout ce que vous avez appris :

| Combinaison | Quand l'utiliser | Exemple |
|------------|------------------|---------|
| **Zero-shot CoT** | Tâche complexe, pas besoin d'exemples | "Résous ce problème. Réfléchis étape par étape." |
| **Few-shot CoT** | Tâche complexe avec un format de raisonnement spécifique | Montrer un exemple de raisonnement complet, puis poser la question |
| **CoT + System prompt** | Assistant qui doit toujours raisonner avant de répondre | System prompt : "Tu dois toujours montrer ton raisonnement avant de conclure." |
| **CoT + Structured output** | Calcul ou analyse dont le résultat doit être en JSON | CoT pour le raisonnement, puis JSON pour le résultat final |

Le CoT n'est pas un remplacement des modules précédents — c'est un **amplificateur** qui rend les autres techniques plus fiables sur les tâches complexes.

---

## 9. Variantes avancées du CoT

### Self-consistency
Au lieu de demander un seul raisonnement, vous demandez au modèle de résoudre le problème **3 fois** par des chemins différents, puis de choisir la réponse qui revient le plus souvent. C'est coûteux en tokens mais très fiable.

> "Résous ce problème 3 fois avec des approches différentes. Puis compare tes 3 réponses et donne celle qui est la plus probable."

### Tree of Thought
Le modèle explore plusieurs pistes à chaque étape, évalue laquelle est la plus prometteuse, et continue seulement sur celle-là. C'est le CoT en mode "exploration stratégique".

### Decomposition prompting
Au lieu d'un seul prompt avec des étapes, vous décomposez en **plusieurs prompts séquentiels** : le résultat du prompt 1 devient l'input du prompt 2. C'est plus fiable pour les problèmes très complexes mais nécessite une logique d'orchestration côté code.

Ces variantes sont avancées — vous n'en avez pas besoin au quotidien, mais elles existent si le CoT standard ne suffit pas.

---

## 10. Checklist avant de soumettre un prompt CoT

- [ ] **La tâche justifie le CoT** — elle nécessite du calcul, de la logique, de l'analyse ou un jugement multi-critères
- [ ] **Les étapes sont explicites** — j'ai listé les étapes ou au minimum écrit "réfléchis étape par étape"
- [ ] **Les étapes sont dans le bon ordre** — chaque étape utilise le résultat de la précédente
- [ ] **Le nombre d'étapes est raisonnable** — entre 3 et 7 étapes
- [ ] **La réponse finale est demandée** — j'ai imposé un format pour la conclusion
- [ ] **Une vérification est incluse** — j'ai demandé au modèle de vérifier son résultat
- [ ] **Les données sont toutes dans le prompt** — le modèle a toutes les informations nécessaires pour raisonner

---

## 11. Pour aller plus loin

- **Wei et al. (2022) — "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"** : le papier fondateur du CoT
- **Kojima et al. (2022) — "Large Language Models are Zero-Shot Reasoners"** : montre que "Let's think step by step" suffit à activer le raisonnement
- **Yao et al. (2023) — "Tree of Thoughts"** : l'extension du CoT en exploration arborescente
- **DAIR.ai — Chain-of-Thought Prompting** : guide pratique avec exemples

---

## Résumé du module

Le chain-of-thought, c'est donner au modèle un **brouillon** pour poser ses calculs et ses raisonnements. Trois niveaux d'utilisation : le déclencheur simple ("réfléchis étape par étape"), le raisonnement structuré (étapes imposées), et le few-shot CoT (exemple de raisonnement complet). Le CoT est inutile pour les tâches simples, mais il est transformationnel pour le calcul, l'analyse et la prise de décision.

Dans le prochain module, vous apprendrez à configurer le **comportement global** du LLM avant même qu'il reçoive un message — c'est le **system prompt**.

---

# Module 3 — Chain-of-Thought Prompting (English Version)

---

## 1. The Problem: LLMs Don't Think (Unless You Force Them)

Ask an LLM this question without precaution:

> "A store sells an item for €120. The next day, it lowers the price by 25%, then the day after raises it by 25%. What's the final price?"

Many models will answer **€120** — "remove 25%, add 25%, same thing." That's wrong. The actual final price is **€112.50** (120 × 0.75 × 1.25). The model took a mental shortcut instead of calculating step by step.

**Chain-of-thought** (CoT) is the technique that forces the model to **show its reasoning** before giving its answer. By requiring it to make each step explicit, you drastically reduce these types of errors.

It's counterintuitive: asking the model to work **more** (write out its steps) makes it produce **better** results. In prompting, laziness is the enemy of accuracy.

---

## 2. Why Does It Work?

An LLM generates tokens one at a time, left to right. When it jumps directly to the answer, it has no room to "think" — it has to guess the final result in one shot.

When you ask it to reason step by step, you offer it an **intermediate workspace**. Each written step becomes context for the next. The model can:
- Decompose a complex problem into simple sub-problems
- Verify each step before moving to the next
- Correct its trajectory mid-reasoning

It's exactly like a human solving a math problem: you don't try to guess the final answer in one shot, you write intermediate calculations on paper. CoT gives the LLM that "scratch paper."

**Research confirms the impact**: the foundational paper by Wei et al. (2022) showed that simply adding "Let's think step by step" to a prompt improved GPT-3's performance on mathematical reasoning tasks by **+40 percentage points**. That's not marginal — it's transformational.

---

## 3. The 3 Levels of Chain-of-Thought

### Level 1 — The Simple Trigger

The most basic form: add a phrase that activates reasoning.

> "Solve this problem. **Let's think step by step.**"

It's surprisingly effective for such a simple addition. The model switches from "direct answer" mode to "explicit reasoning" mode. But you have no control over the step structure.

### Level 2 — Structured Reasoning

You impose a structure on the reasoning:

> "Solve this problem following these steps:
> Step 1: Identify the problem data
> Step 2: Write the necessary formula
> Step 3: Perform the calculation
> Step 4: Verify the result
> Step 5: Give the final answer"

This is more powerful because you guide the model through a rigorous process. It can't skip steps.

### Level 3 — CoT with Examples (Few-Shot CoT)

You combine few-shot and chain-of-thought: show a complete example with reasoning, then ask your question.

> **Problem**: A train leaves at 2:00 PM traveling at 80 km/h. Another leaves at 3:00 PM traveling at 120 km/h. When does the second catch the first?
> **Reasoning**:
> - At 3:00 PM, the first train has a 1-hour head start, i.e., 80 km.
> - Speed difference is 120 - 80 = 40 km/h.
> - Catch-up time: 80 / 40 = 2 hours.
> - The second catches the first at 5:00 PM.
> **Answer**: 5:00 PM
>
> **Problem**: [your problem here]
> **Reasoning**:

This is the most reliable level. The example shows the model not just **what** to do, but **how** to reason.

---

## 4. Beyond Math: CoT for Analysis

Chain-of-thought isn't limited to calculations. It's powerful for any task requiring **multi-step judgment**:

### Code Analysis
> "Analyze this code. First, describe what each block does. Then, identify potential bugs. Finally, propose fixes."

Without CoT, the model might miss a subtle bug because it didn't take time to understand the program flow.

### Business Decision-Making
> "We're debating whether to launch the product now or wait 3 months. First analyze the advantages of each option. Then list the risks. Then give your recommendation with justification."

Without CoT, the model would give a direct recommendation without weighing pros and cons. With CoT, the recommendation is grounded in explicit analysis.

### Diagnosis
> "A user reports the app is slow. First list possible causes in order of probability. For each cause, indicate how to verify it. Then recommend where to start."

CoT transforms a vague answer ("maybe it's the database") into a structured diagnostic approach.

### Critical Evaluation
> "Evaluate this business proposal. First, summarize the strengths. Then, identify weaknesses. Then, assess feasibility. Finally, give your overall recommendation."

The model is forced to consider all angles before concluding.

---

## 5. Anatomy of a Good CoT Prompt

An effective chain-of-thought prompt contains:

### 🎯 The Task
Clearly describe what you want to obtain in the end.

### 🪜 The Imposed Steps
List the steps the model must follow. Be specific about what each step should contain.

### 🔒 The Format Constraint
Clearly separate the reasoning from the final answer. The model must produce both.

### ✅ Verification (optional but recommended)
Ask the model to verify its own result at the end. It seems simplistic, but it catches many errors.

**Complete example:**

> Solve the following problem.
>
> **Problem**: A company has 150 employees. 40% work remotely. Among remote employees, 30% are in the UTC+1 timezone and the rest in UTC-5. How many employees work remotely in UTC-5?
>
> **Instructions**:
> 1. Identify the numerical data in the problem
> 2. Calculate the number of remote employees
> 3. Calculate the number of employees in UTC+1
> 4. Deduce the number in UTC-5
> 5. Verify that your numbers are consistent (parts must add up to the whole)
>
> **Format**:
> - Show each step with the calculation
> - End with "Final answer: [number]"

---

## 6. Concrete Examples: Before/After

### Example 1 — Financial Calculation

**Without CoT:**
> "If I invest €10,000 at 7% annual rate compounded monthly, how much will I have after 5 years?"

The model may use a simplified calculation (simple interest) or get the formula wrong.

**With CoT:**
> "If I invest €10,000 at 7% annual rate compounded monthly, how much will I have after 5 years?
>
> Solve step by step:
> 1. Identify variables: initial capital, annual rate, compounding frequency, duration
> 2. Convert annual rate to monthly rate
> 3. Calculate total number of periods
> 4. Apply the compound interest formula
> 5. Calculate the final amount
> 6. Verify: result should be greater than €10,000 × 1.07^5"

**Result**: the model correctly identifies the monthly rate (0.07/12), number of periods (60), and applies the right formula. With verification.

---

### Example 2 — Bug Analysis

**Without CoT:**
> "Why doesn't this code work?"
> ```python
> def average(numbers):
>     total = 0
>     for n in numbers:
>         total += n
>     return total / len(numbers)
> ```

The model might say "looks correct" and miss the `numbers = []` case (division by zero).

**With CoT:**
> "Analyze this code step by step:
> 1. Read each line and describe what it does
> 2. Identify possible inputs (normal case, empty, single element)
> 3. Mentally trace execution for each case
> 4. Identify where it can fail
> 5. Propose a fix"

**Result**: at step 3, the model traces `numbers = []` → `total = 0` → `len(numbers) = 0` → **division by zero**. The bug is found because CoT forced systematic case analysis.

---

### Example 3 — Strategic Decision

**Without CoT:**
> "Should we switch from AWS to Google Cloud?"

Likely answer: a vague paragraph with lots of "it depends."

**With CoT:**
> "Our startup has been on AWS for 2 years (monthly budget: €4,500, 3 AWS-trained engineers). Google Cloud offers $100,000 credit over 2 years.
>
> Analyze this decision:
> 1. List migration costs (technical, training, downtime)
> 2. Calculate the real savings from the Google credit ($100K over 2 years vs current budget)
> 3. Evaluate operational risks (team skills, service compatibility)
> 4. List potential non-financial advantages
> 5. Give your recommendation with a clear decision threshold"

**Result**: a structured analysis that quantifies migration cost, compares with the credit, and gives a well-argued recommendation. Not a vague "it depends."

---

## 7. Chain-of-Thought Traps

### Trap 1: CoT on a simple task
Asking "think step by step" for "translate 'hello' to French" is pointless and slows the response. CoT is for **complex** tasks — multi-step calculation, analysis, diagnosis, logical reasoning. For simple tasks, zero-shot is enough.

### Trap 2: No imposed structure
"Think step by step" is a good start, but the model may produce disordered steps or skip some. Impose steps explicitly if rigor matters.

### Trap 3: Blindly trusting the reasoning
The model can produce reasoning that's **convincing but wrong**. It can write steps that "look logical" but contain a calculation or logic error. Always add a verification step, and check critical results yourself.

### Trap 4: Verbose CoT
Reasoning that's too long dilutes the model's attention. If your problem needs 15 steps, break it into 2-3 sub-problems each with their own steps. An effective CoT prompt has between 3 and 7 steps.

### Trap 5: Forgetting the final answer
The model can get lost in its reasoning and never conclude. Explicitly impose: "End with 'Final answer: [your answer]'." This forces the model to converge.

---

## 8. CoT + Other Techniques

Chain-of-thought combines with everything you've learned:

| Combination | When to Use | Example |
|------------|-------------|---------|
| **Zero-shot CoT** | Complex task, no examples needed | "Solve this problem. Let's think step by step." |
| **Few-shot CoT** | Complex task with a specific reasoning format | Show a complete reasoning example, then ask |
| **CoT + System prompt** | Assistant that should always reason before answering | System prompt: "You must always show your reasoning before concluding." |
| **CoT + Structured output** | Calculation or analysis with JSON result | CoT for reasoning, then JSON for final result |

CoT isn't a replacement for previous modules — it's an **amplifier** that makes other techniques more reliable on complex tasks.

---

## 9. Advanced CoT Variants

### Self-Consistency
Instead of asking for one reasoning path, you ask the model to solve the problem **3 times** via different approaches, then pick the most common answer. Token-expensive but very reliable.

> "Solve this problem 3 times using different approaches. Then compare your 3 answers and give the most likely one."

### Tree of Thought
The model explores multiple paths at each step, evaluates which is most promising, and continues only on that one. It's CoT in "strategic exploration" mode.

### Decomposition Prompting
Instead of one prompt with steps, you decompose into **multiple sequential prompts**: prompt 1's result becomes prompt 2's input. More reliable for very complex problems but requires orchestration logic in code.

These variants are advanced — you won't need them daily, but they exist if standard CoT isn't enough.

---

## 10. Checklist Before Submitting a CoT Prompt

- [ ] **The task justifies CoT** — it requires calculation, logic, analysis, or multi-criteria judgment
- [ ] **Steps are explicit** — I listed steps or at minimum wrote "think step by step"
- [ ] **Steps are in the right order** — each step uses the result of the previous one
- [ ] **Step count is reasonable** — between 3 and 7 steps
- [ ] **Final answer is requested** — I imposed a format for the conclusion
- [ ] **Verification is included** — I asked the model to check its result
- [ ] **All data is in the prompt** — the model has all information needed to reason

---

## 11. Going Further

- **Wei et al. (2022) — "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"**: the foundational CoT paper
- **Kojima et al. (2022) — "Large Language Models are Zero-Shot Reasoners"**: shows that "Let's think step by step" alone activates reasoning
- **Yao et al. (2023) — "Tree of Thoughts"**: the CoT extension into tree-based exploration
- **DAIR.ai — Chain-of-Thought Prompting**: practical guide with examples

---

## Module Summary

Chain-of-thought is giving the model a **scratch pad** to write out its calculations and reasoning. Three usage levels: the simple trigger ("think step by step"), structured reasoning (imposed steps), and few-shot CoT (complete reasoning example). CoT is useless for simple tasks, but transformational for calculation, analysis, and decision-making.

In the next module, you'll learn to configure the LLM's **global behavior** before it even receives a message — that's the **system prompt**.
