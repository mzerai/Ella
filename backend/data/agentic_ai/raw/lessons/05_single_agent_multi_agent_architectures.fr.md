---
course_id: ella_tech_agentic_ai_enterprise_workflows
course_title_fr: "IA agentique pour les workflows d’entreprise"
course_title_en: "Agentic AI for Enterprise Workflows"
lesson_id: "05_single_agent_multi_agent_architectures"
lesson_number: 5
lesson_title_fr: "Architectures mono-agent et multi-agents"
lesson_title_en: "Single-Agent and Multi-Agent Architectures"
pathway: "Tech"
secondary_pathway: "Leadership"
level: "Intermediate-Advanced"
language: "fr"
encoding: "UTF-8"
delivery_modes:
  instructor_led: "3 jours / 24h pour le cours complet"
  self_paced: "14 à 20h pour le cours complet"
checkpoint_mode: "dynamic"
lab_next: "05_choose_agent_architecture_lab"
---

# Leçon 5 — Architectures mono-agent et multi-agents

## Objectif de la leçon

Vous savez maintenant définir un agent, le placer dans un workflow, spécifier ses outils et gérer son contexte.

La question devient :

> Quelle architecture faut-il choisir ?

Vous pouvez construire un workflow déterministe, un agent unique avec outils, un superviseur qui appelle des agents spécialisés, un système de handoffs ou une architecture multi-agents plus ouverte.

Cette leçon vous apprend à choisir l’architecture la plus simple qui résout le problème avec un niveau de risque acceptable.

---

## 1. Le piège : choisir une architecture trop complexe

Le marché parle beaucoup de systèmes multi-agents. Cela peut donner l’impression qu’un vrai projet agentique doit forcément combiner plusieurs agents.

Ce n’est pas vrai.

Une architecture complexe ajoute :

- plus de prompts ;
- plus d’outils ;
- plus de chemins possibles ;
- plus de coûts ;
- plus de latence ;
- plus de risques d’erreur ;
- plus de logs à interpréter ;
- plus de tests ;
- plus de maintenance.

La bonne question n’est pas :

> Combien d’agents pouvons-nous créer ?

La bonne question est :

> Quelle est l’architecture minimale qui permet d’atteindre l’objectif, avec contrôle, traçabilité et qualité ?

Anthropic recommande de commencer par des workflows simples et composables. OpenAI recommande aussi de configurer proprement un agent avant de faire grandir le workflow vers des patterns plus avancés.

---

## 2. Les cinq architectures à connaître

Vous devez connaître cinq patterns.

### 1. Workflow déterministe avec étapes LLM

Le workflow suit des étapes fixes. Le LLM intervient sur certaines tâches : classification, résumé, extraction, brouillon.

Exemple :

> Ticket reçu → classification LLM → recherche procédure → brouillon LLM → validation humaine → note interne.

C’est souvent le meilleur point de départ.

### 2. Agent unique avec outils

Un seul agent reçoit un objectif et choisit parmi un petit ensemble d’outils.

Exemple :

> Agent support interne avec `read_ticket`, `search_policy`, `draft_response`, `create_note`, `escalate`.

L’architecture reste lisible si l’objectif est précis et les outils limités.

### 3. Routeur vers agents spécialisés

Un premier agent ou composant classe la demande et l’envoie vers un spécialiste.

Exemple :

> Routeur → agent RH, agent IT, agent finance, agent admission.

Utile si les domaines sont distincts et si chaque spécialiste a des règles et sources propres.

### 4. Superviseur avec agents comme outils

Un agent principal garde la responsabilité du résultat. Il appelle des agents spécialisés comme des outils.

Exemple :

> Superviseur support → agent recherche documentaire → agent conformité → agent rédaction.

OpenAI décrit ce pattern avec l’idée d’utiliser des agents comme outils pour des workflows de type manager. Le superviseur reste responsable de la réponse finale.

### 5. Handoffs entre agents

Un agent transfère la tâche à un autre agent. Le nouvel agent prend le relais.

Exemple :

> Agent support général → transfert vers agent remboursement → transfert vers agent litige.

OpenAI présente les handoffs comme un mécanisme qui permet à un agent de déléguer une tâche à un autre agent spécialisé.

Ce pattern est utile quand la responsabilité doit passer d’un domaine à un autre. Il demande un cadrage strict des frontières.

---

## 3. Workflow déterministe : le choix le plus sûr pour commencer

Un workflow déterministe est adapté quand les étapes sont connues.

### Exemple

Un agent d’admission doit traiter une demande simple :

1. identifier le profil ;
2. chercher les conditions d’admission ;
3. lister les pièces ;
4. préparer une réponse ;
5. demander validation avant envoi.

Le chemin est stable. Il n’est pas nécessaire de laisser l’agent décider librement.

### Avantages

- facile à tester ;
- facile à auditer ;
- coûts prévisibles ;
- risques réduits ;
- meilleure intégration SI ;
- logique claire pour les équipes métier.

### Limites

- moins flexible ;
- moins adapté aux dossiers complexes ;
- demande une bonne modélisation du processus.

### Quand le choisir

Choisissez ce pattern si :

- le processus est connu ;
- les règles sont stables ;
- les actions sensibles sont limitées ;
- vous lancez un premier pilote ;
- vous devez rassurer les équipes.

Dans ELLA, ce pattern doit être présenté comme une option forte, pas comme une solution moins avancée.

---

## 4. Agent unique avec outils : simple, mais à surveiller

Un agent unique avec outils devient pertinent quand la demande varie et que le chemin n’est pas entièrement fixe.

### Exemple

Un agent support interne reçoit des demandes variées. Il doit choisir entre :

- lire le ticket ;
- chercher une procédure ;
- demander une information ;
- préparer un brouillon ;
- créer une note ;
- escalader.

### Avantages

- plus flexible qu’un workflow fixe ;
- architecture encore lisible ;
- moins de coordination qu’un système multi-agents ;
- bon compromis pour un pilote.

### Risques

- choix du mauvais outil ;
- boucle inutile ;
- usage excessif d’un outil ;
- oubli d’escalade ;
- difficulté à expliquer le chemin suivi ;
- action d’écriture déclenchée trop tôt.

### Garde-fous

- petit nombre d’outils ;
- noms d’outils explicites ;
- permissions côté système ;
- limites d’itérations ;
- validation humaine sur les actions sensibles ;
- logs détaillés ;
- mode observation au début.

Choisissez ce pattern si le workflow a besoin d’interprétation, mais pas d’une équipe complète d’agents.

---

## 5. Routeur vers spécialistes : clarifier les domaines

Le pattern routeur fonctionne bien quand les demandes appartiennent à des domaines distincts.

### Exemple

Une organisation reçoit des demandes internes :

- IT ;
- RH ;
- finance ;
- administratif ;
- sécurité.

Un routeur classe la demande. Puis il transmet vers le bon agent spécialisé.

### Avantages

- spécialisation claire ;
- prompts plus ciblés ;
- sources séparées ;
- permissions différentes par domaine ;
- meilleure maîtrise des sujets sensibles.

### Risques

- mauvais routage ;
- conflit entre domaines ;
- passage d’un cas sensible vers le mauvais agent ;
- fragmentation de la responsabilité ;
- doublons de contexte.

### Garde-fous

- règles de routage explicites ;
- catégorie “incertain” ;
- escalade si sensibilité élevée ;
- logs du routage ;
- tests sur cas limites ;
- interdiction de traiter hors domaine.

Ce pattern convient aux organisations qui ont plusieurs processus bien séparés.

---

## 6. Superviseur avec agents comme outils

Dans ce pattern, un agent principal garde le contrôle. Il appelle des agents spécialisés pour l’aider.

OpenAI décrit ce modèle comme un workflow de type manager : le main agent reste responsable et appelle des spécialistes comme outils.

### Exemple

Un superviseur traite une réclamation client.

Il peut appeler :

- agent documentaire pour chercher la politique ;
- agent conformité pour identifier les risques ;
- agent rédaction pour préparer un brouillon ;
- agent qualité pour vérifier le ton.

Le superviseur synthétise et produit la sortie finale.

### Avantages

- contrôle centralisé ;
- spécialisation ;
- meilleure cohérence finale ;
- moins de transfert de responsabilité qu’un handoff complet.

### Risques

- coût plus élevé ;
- latence ;
- incohérence entre spécialistes ;
- dépendance au superviseur ;
- difficulté à tester toutes les combinaisons.

### Quand le choisir

Choisissez ce pattern si :

- la tâche exige plusieurs expertises ;
- la sortie finale doit rester cohérente ;
- le superviseur doit garder la responsabilité ;
- les agents spécialistes peuvent être traités comme outils bornés.

Ce pattern est souvent préférable à un multi-agent libre.

---

## 7. Handoffs : transférer la responsabilité

Le handoff consiste à passer la tâche à un autre agent. Le second agent prend la main.

### Exemple

Un agent support général reçoit une demande de remboursement. Il transfère vers un agent finance.

Le nouvel agent utilise ses sources, ses règles et ses outils.

### Avantages

- utile quand le domaine change ;
- adapté aux organisations avec équipes spécialisées ;
- permet de limiter les outils de chaque agent ;
- chaque agent peut avoir ses instructions propres.

### Risques

- perte de contexte ;
- transfert au mauvais agent ;
- validation absente au moment du transfert ;
- logs difficiles à lire ;
- responsabilité floue ;
- garde-fous différents selon les agents.

OpenAI précise que les handoffs permettent à un agent de déléguer à un autre agent spécialisé. En pratique, vous devez définir précisément quand le transfert est autorisé.

### Questions à poser

- Qui peut initier le handoff ?
- Quel contexte est transféré ?
- Quel contexte ne doit pas être transféré ?
- Qui devient responsable ?
- Comment journaliser le transfert ?
- Comment revenir en arrière ?
- Quand faut-il une validation humaine ?

Utilisez les handoffs quand le changement de domaine est réel. Ne les utilisez pas pour rendre l’architecture plus élégante.

---

## 8. Orchestrator-workers : décomposer une tâche complexe

Anthropic décrit un pattern orchestrator-workers : un orchestrateur décompose une tâche, délègue à des workers, puis synthétise les résultats.

### Exemple

Préparer une analyse de conformité documentaire :

- worker 1 cherche la règle ;
- worker 2 extrait les obligations ;
- worker 3 compare le dossier ;
- worker 4 relève les manques ;
- orchestrateur synthétise.

### Avantages

- utile pour tâches complexes ;
- bonne séparation du travail ;
- traitement parallèle possible ;
- spécialisation des sous-tâches.

### Risques

- coordination difficile ;
- résultats contradictoires ;
- erreurs de synthèse ;
- coûts élevés ;
- risque de sur-architecture.

Ce pattern doit rester réservé aux tâches qui justifient cette complexité.

---

## 9. Evaluator-optimizer : améliorer une sortie

Un autre pattern utile consiste à produire une sortie, puis à la faire évaluer par un second composant.

### Exemple

Un agent rédige une réponse client. Un évaluateur vérifie :

- exactitude ;
- ton ;
- conformité ;
- source citée ;
- données sensibles ;
- besoin d’escalade.

Si l’évaluation échoue, la sortie est corrigée ou envoyée à un humain.

### Avantages

- améliore la qualité ;
- réduit certaines erreurs ;
- utile pour les réponses sensibles ;
- simple à ajouter à un workflow.

### Risques

- l’évaluateur peut se tromper ;
- coût supplémentaire ;
- faux sentiment de sécurité ;
- besoin de critères précis.

Ce pattern est utile, mais il ne remplace pas la validation humaine sur les actions sensibles.

---

## 10. Choisir l’architecture selon le risque

Le choix d’architecture dépend du niveau de risque.

| Situation | Architecture recommandée |
|---|---|
| Processus stable, règles claires | Workflow déterministe avec étapes LLM |
| Demandes variées, outils limités | Agent unique avec outils |
| Domaines séparés | Routeur vers spécialistes |
| Expertise multiple, sortie finale unique | Superviseur avec agents comme outils |
| Transfert réel de domaine | Handoffs |
| Tâche complexe à décomposer | Orchestrator-workers |
| Sortie sensible à contrôler | Evaluator-optimizer + humain si nécessaire |

Ne choisissez pas une architecture pour son prestige. Choisissez-la pour son adéquation au risque et à la décision.

---

## 11. Critères de décision

Utilisez ces critères.

### Complexité de la tâche

La tâche a-t-elle un chemin stable ou plusieurs chemins possibles ?

### Sensibilité des données

Les agents accèdent-ils à des données personnelles, financières, RH ou clients ?

### Impact des actions

L’agent lit-il, écrit-il, envoie-t-il ou déclenche-t-il une décision ?

### Besoin de spécialisation

Un seul agent peut-il gérer le sujet ou faut-il plusieurs domaines ?

### Traçabilité

Pouvez-vous expliquer ce qui s’est passé ?

### Coût et latence

Le système doit-il répondre vite ? Les coûts sont-ils maîtrisés ?

### Testabilité

Pouvez-vous tester les chemins principaux et les cas limites ?

### Maintenance

L’équipe pourra-t-elle maintenir les prompts, outils, sources et logs ?

Une architecture difficile à tester doit être considérée comme risquée.

---

## 12. Cas tunisien : groupe universitaire ou grande entreprise

Imaginez un groupe tunisien avec plusieurs départements : admissions, scolarité, finance, RH, IT et communication.

La direction veut un agent unique qui répond à tout.

### Analyse

C’est risqué.

Les domaines n’ont pas les mêmes données, règles, droits et responsabilités.

Une demande d’admission ne doit pas être traitée comme une demande RH. Une question financière peut contenir des données sensibles. Une demande IT peut impliquer des droits d’accès.

### Architecture prudente

Pour un premier pilote :

1. workflow déterministe ou agent unique sur un seul domaine ;
2. périmètre : admission ou support interne ;
3. outils limités ;
4. RAG validé ;
5. pas d’action officielle sans validation ;
6. logs complets ;
7. escalade vers humain.

Pour une version plus mature :

- routeur de domaine ;
- agents spécialisés ;
- superviseur ;
- handoffs contrôlés ;
- permissions par domaine ;
- tableau d’audit.

Le bon chemin est progressif.

---

## 13. Responsabilité et supervision

Plus il y a d’agents, plus la responsabilité doit être explicite.

Vous devez définir :

- qui possède le système ;
- qui possède chaque agent ;
- qui valide les sources ;
- qui valide les outils ;
- qui lit les logs ;
- qui traite les erreurs ;
- qui arrête le système ;
- qui met à jour les prompts ;
- qui décide du passage à l’échelle.

Le NIST AI RMF insiste sur la gouvernance comme fonction transversale de la gestion des risques IA. Pour les architectures multi-agents, cette gouvernance devient encore plus importante.

---

## 14. Traces et observabilité

Une architecture multi-agents doit être observable.

Vous devez tracer :

- agent appelé ;
- raison de l’appel ;
- entrée transmise ;
- sortie produite ;
- outils appelés ;
- handoff réalisé ;
- validation humaine ;
- erreurs ;
- coût ;
- latence ;
- version du prompt ;
- version du modèle.

Sans observabilité, vous ne pouvez pas comprendre pourquoi le système a agi.

Un système multi-agents opaque ne doit pas passer en production.

---

## 15. Anti-patterns fréquents

Évitez ces erreurs.

### Agent universel

Un agent unique peut tout faire, tout lire, tout modifier.

Risque : très élevé.

### Multi-agents pour impressionner

Plusieurs agents sont ajoutés sans besoin réel.

Risque : complexité inutile.

### Handoff sans responsabilité

La tâche passe d’un agent à un autre sans trace claire.

Risque : audit impossible.

### Spécialistes sans frontières

Chaque agent peut répondre hors de son domaine.

Risque : incohérence et erreurs.

### Superviseur faible

Le superviseur se contente de concaténer les réponses.

Risque : synthèse fausse ou contradictoire.

### Pas de mode dégradé

Si un agent ou outil échoue, le workflow s’arrête sans solution.

Risque : perte de service.

---

## 16. Méthode de choix en six étapes

### 1. Décrire le workflow réel

Avant l’architecture, décrivez le processus.

### 2. Identifier les décisions

Quelles décisions doivent être prises ?

### 3. Classer les données et actions

Lecture, écriture, envoi, données sensibles, impact externe.

### 4. Évaluer la complexité

Combien de chemins ? Combien de domaines ? Combien d’exceptions ?

### 5. Choisir l’architecture minimale

Commencez par la plus simple.

### 6. Ajouter les contrôles

Permissions, validation humaine, logs, garde-fous, évaluation.

Cette méthode évite la sur-architecture.

---

## À retenir

Un bon design agentique n’est pas celui qui utilise le plus d’agents.

C’est celui qui choisit le bon niveau d’autonomie et de spécialisation pour un workflow donné.

Retenez cette règle :

> Workflow d’abord. Agent ensuite. Multi-agents seulement si la complexité le justifie.

Commencez simple, mesurez, sécurisez, puis ajoutez de la spécialisation si le besoin est prouvé.

---

## Contexte checkpoint Ella

### Intention pédagogique

Ella doit vérifier que l’apprenant sait choisir une architecture agentique adaptée à un cas d’entreprise, plutôt que choisir automatiquement une architecture multi-agents.

Le checkpoint doit comparer plusieurs cas et demander une justification.

### Situation suggérée pour générer le checkpoint

Ella peut proposer trois cas :

1. un processus stable de création de ticket à partir d’un formulaire ;
2. un agent support interne qui reçoit des demandes variées mais reste dans un seul domaine ;
3. une plateforme d’assistance qui couvre RH, finance, IT et conformité avec sources et permissions séparées.

Ella demande à l’apprenant de choisir l’architecture appropriée pour chaque cas :

- workflow déterministe ;
- agent unique avec outils ;
- routeur vers spécialistes ;
- superviseur avec agents comme outils ;
- handoffs ;
- orchestrator-workers.

### Ce qu’une bonne réponse doit contenir

Une bonne réponse doit mentionner :

1. la complexité du workflow ;
2. le niveau de risque ;
3. les données sensibles ;
4. les outils nécessaires ;
5. la responsabilité finale ;
6. les logs ;
7. la validation humaine ;
8. pourquoi une architecture plus simple peut être préférable.

### Erreurs fréquentes à détecter

- Choisir multi-agents pour tous les cas.
- Oublier la testabilité.
- Oublier la responsabilité.
- Oublier les logs de handoff.
- Donner trop d’outils à chaque agent.
- Ne pas isoler les domaines sensibles.
- Ne pas prévoir de mode dégradé.

### Relances socratiques possibles

- “Pourquoi un workflow déterministe ne suffit-il pas ici ?”
- “Quel agent garde la responsabilité finale ?”
- “Quelles données ne doivent pas passer au prochain agent ?”
- “Comment tracez-vous un handoff ?”
- “Quel risque augmente quand vous ajoutez un agent ?”
- “Comment testez-vous toutes les branches ?”

### Critères de validation

Ella peut valider si l’apprenant :

- choisit une architecture adaptée ;
- justifie par la complexité et le risque ;
- évite la sur-architecture ;
- prévoit responsabilité et logs ;
- limite les outils par agent ;
- ajoute validation humaine pour actions sensibles.

---

## Passage vers le Lab 5

Vous êtes prêt pour le Lab 5.

Votre mission sera de choisir l’architecture adaptée pour plusieurs cas d’entreprise et de justifier votre choix par le risque, la complexité, les données, les outils et la gouvernance.

---

## Références

1. OpenAI. **Agents SDK documentation**.  
   https://developers.openai.com/api/docs/guides/agents

2. OpenAI. **Orchestration and handoffs**.  
   https://developers.openai.com/api/docs/guides/agents/orchestration

3. OpenAI Agents SDK. **Handoffs**.  
   https://openai.github.io/openai-agents-python/handoffs/

4. OpenAI Agents SDK. **Agent definitions**.  
   https://developers.openai.com/api/docs/guides/agents/define-agents

5. Anthropic. **Building effective AI agents**. 2024.  
   https://www.anthropic.com/research/building-effective-agents

6. NIST. **AI Risk Management Framework (AI RMF 1.0)**.  
   https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf
