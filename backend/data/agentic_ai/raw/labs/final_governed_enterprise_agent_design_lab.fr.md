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
language: "fr"
encoding: "UTF-8"
target_score: 16
max_score: 20
checkpoint_mode: "dynamic"
---

# Lab final — Concevoir un agent d’entreprise gouverné

## Mission

Vous allez concevoir un agent IA d’entreprise complet, gouverné et pilotable.

Votre objectif n’est pas de produire une idée générale. Votre objectif est de produire une spécification exploitable par une équipe métier, une équipe technique et un assistant IA de codage.

Votre agent doit agir dans un workflow réel, avec des outils, des données, des permissions, des garde-fous, des tests, des traces et un plan de pilote.

---

## Situation de départ

Choisissez un cas réel de votre organisation ou l’un des cas simulés ci-dessous.

### Cas A — Agent support interne

L’agent aide l’équipe support à lire les tickets, classer les demandes, chercher les procédures, préparer des brouillons, créer des notes internes et escalader les cas sensibles.

### Cas B — Agent admission

L’agent aide une école ou université à répondre aux demandes d’admission, identifier les profils, chercher les conditions d’accès, lister les pièces, préparer une réponse et escalader les cas particuliers.

### Cas C — Agent RH

L’agent répond aux questions générales sur les procédures RH validées, oriente les collaborateurs, prépare des demandes de complément et escalade les sujets sensibles.

### Cas D — Agent finance

L’agent aide à suivre des demandes de paiement, vérifier les pièces, préparer une réponse interne et escalader les cas nécessitant validation financière.

### Cas E — Agent conformité

L’agent aide à analyser un dossier, retrouver les règles applicables, relever les manques, produire une synthèse et demander validation humaine.

### Cas F — Agent service client

L’agent analyse une demande client, consulte les règles autorisées, prépare une réponse, propose une escalade et ne communique jamais officiellement sans validation.

Vous pouvez adapter ces cas à votre contexte : banque, assurance, université, industrie, retail, administration, santé, télécoms ou services.

---

## Votre livrable

Produisez une spécification structurée en 18 sections.

```markdown
# Spécification d’un agent IA d’entreprise gouverné

## 1. Cas d’usage choisi
...

## 2. Problème métier
...

## 3. Objectif précis de l’agent
...

## 4. Utilisateurs et parties prenantes
...

## 5. Workflow agentique
| Étape | Entrée | Action agent | Outil | Décision | Validation humaine | Sortie |
|---|---|---|---|---|---|---|
| 1 | ... | ... | ... | ... | ... | ... |

## 6. Outils de l’agent
| Outil | Type | Entrées | Sorties | Permissions | Risques | Validation |
|---|---|---|---|---|---|---|

## 7. Données, RAG et sources
Sources autorisées :
Sources interdites :
Métadonnées :
Règles de citation :
Gestion des contradictions :
...

## 8. Mémoire et état de travail
État de workflow :
Mémoire de session :
Mémoire durable :
Données à ne jamais mémoriser :
...

## 9. Architecture choisie
Workflow déterministe / agent unique / routeur / superviseur / handoffs / orchestrator-workers / evaluator-optimizer :
Justification :
Pourquoi une architecture plus complexe serait risquée :
...

## 10. Permissions et contrôle d’accès
...

## 11. Garde-fous techniques
...

## 12. Garde-fous organisationnels
...

## 13. Risques principaux
| Risque | Impact | Probabilité | Mesure de réduction |
|---|---|---|---|

## 14. Évaluation et tests
Dataset :
Cas standard :
Cas ambigus :
Cas sensibles :
Cas hostiles :
Tests outils :
Tests RAG :
Tests mémoire :
Tests de régression :
...

## 15. Observabilité et logs
Traces :
Dashboard :
Feedback utilisateur :
Alertes :
...

## 16. Plan pilote 60 ou 90 jours
| Phase | Durée | Activités | Livrables |
|---|---:|---|---|

## 17. KPI et seuils de décision
Qualité :
Sécurité :
Adoption :
Métier :
Exploitation :
Seuils go / no-go :
...

## 18. Décision finale et passage à l’échelle
Continuer :
Ajuster :
Arrêter :
Étendre :
Conditions :
...
```

---

## Contraintes obligatoires

Votre agent doit :

- avoir un objectif précis ;
- agir dans un workflow limité ;
- utiliser des outils spécialisés ;
- séparer lecture, écriture et action externe ;
- appliquer les permissions côté système ;
- limiter les données personnelles ;
- citer les sources quand la réponse dépend d’un document ;
- distinguer RAG, mémoire et état de workflow ;
- inclure une validation humaine pour les actions sensibles ;
- prévoir des logs et traces ;
- inclure un plan d’évaluation ;
- inclure un plan de pilote ;
- prévoir rollback ou désactivation ;
- définir une décision finale.

Votre agent ne doit pas :

- accéder à toutes les données internes ;
- envoyer une réponse officielle sans validation ;
- prendre une décision RH, financière, réglementaire ou institutionnelle sans humain ;
- mémoriser des données sensibles sans cadre ;
- cacher ses sources ;
- ignorer les erreurs d’outils ;
- fonctionner sans propriétaire.

---

## Ce que Ella va évaluer

Ella évaluera la crédibilité globale du design.

Elle vérifiera si vous savez :

- partir d’un problème métier réel ;
- limiter le périmètre ;
- construire un workflow clair ;
- spécifier des outils sûrs ;
- gérer RAG, contexte et mémoire ;
- choisir une architecture adaptée ;
- intégrer sécurité, gouvernance et conformité ;
- prévoir évaluation et observabilité ;
- organiser un pilote réaliste ;
- décider selon la valeur et le risque.

---

## Conseils avant de répondre

Ne cherchez pas l’agent le plus impressionnant.

Cherchez l’agent le plus utile, le plus contrôlable et le plus testable.

Un bon design agentique ne promet pas une autonomie totale. Il montre comment l’agent aide l’organisation tout en respectant les données, les règles, les personnes et les responsabilités.

---

## Contexte d’évaluation Ella

### Intention pédagogique

Ella doit vérifier la capacité de l’apprenant à synthétiser tout le cours dans une spécification complète d’agent d’entreprise.

Le lab final doit évaluer la maîtrise des notions suivantes : agenticité, workflow, outils, RAG, mémoire, architecture, gouvernance, sécurité, évaluation, observabilité et pilote.

### Critères de validation

Ella peut valider si la réponse :

1. formule un cas d’usage et un problème métier précis ;
2. définit un objectif agentique limité ;
3. décrit un workflow exploitable ;
4. spécifie des outils limités et auditables ;
5. gère les sources, le RAG et les citations ;
6. distingue mémoire, état et contexte ;
7. choisit une architecture justifiée ;
8. applique permissions et garde-fous ;
9. identifie les risques ;
10. propose un plan d’évaluation ;
11. prévoit observabilité, logs et feedback ;
12. structure un pilote 60/90 jours ;
13. définit des KPI et seuils ;
14. garde une validation humaine sur les actions sensibles.

### Relances possibles

- “Quelle décision l’agent améliore-t-il exactement ?”
- “Pourquoi ce périmètre est-il limité ?”
- “Quel outil est le plus risqué ?”
- “Quelle donnée n’est pas nécessaire ?”
- “Quelle action exige une validation humaine ?”
- “Comment testez-vous une source contradictoire ?”
- “Que montre la trace d’exécution ?”
- “Quel KPI bloque le passage à l’échelle ?”
- “Comment désactivez-vous l’agent ou un outil ?”

---

## Références

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

10. République Tunisienne. **Loi organique n°2004-63 du 27 juillet 2004, portant sur la protection des données à caractère personnel**.  
   https://www.ins.tn/sites/default/files/2020-04/Loi%2063-2004%20Fr.pdf
