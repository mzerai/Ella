---
course_id: ella_tech_agentic_ai_enterprise_workflows
course_title_fr: "IA agentique pour les workflows d’entreprise"
course_title_en: "Agentic AI for Enterprise Workflows"
lesson_id: "02_design_agentic_workflow"
lesson_number: 2
lesson_title_fr: "Concevoir un workflow agentique"
lesson_title_en: "Designing an Agentic Workflow"
pathway: "Tech"
secondary_pathway: "Leadership"
level: "Intermediate-Advanced"
language: "fr"
encoding: "UTF-8"
delivery_modes:
  instructor_led: "3 jours / 24h pour le cours complet"
  self_paced: "14 à 20h pour le cours complet"
checkpoint_mode: "dynamic"
lab_next: "02_map_agentic_workflow_lab"
---

# Leçon 2 — Concevoir un workflow agentique

## Objectif de la leçon

Dans la leçon précédente, vous avez décomposé un agent en composants : objectif, instructions, outils, contexte, permissions, logs et garde-fous.

Maintenant, vous devez placer cet agent dans un workflow.

Un agent d’entreprise ne doit pas flotter au-dessus de l’organisation. Il doit agir dans une séquence de travail réelle : demande, analyse, recherche, décision, validation, action, traçabilité et suivi.

Votre objectif dans cette leçon :

> Transformer un processus métier en workflow agentique contrôlé.

Vous allez apprendre à modéliser les étapes, les décisions, les exceptions, les validations humaines et les sorties attendues.

---

## 1. Un workflow agentique part d’un processus réel

Ne commencez pas par l’agent. Commencez par le travail réel.

Posez d’abord ces questions :

- Qui fait la demande ?
- Où arrive la demande ?
- Qui la traite aujourd’hui ?
- Quelles informations sont nécessaires ?
- Quelles règles métier s’appliquent ?
- Quelles décisions sont prises ?
- Quels outils sont utilisés ?
- Quelles validations sont nécessaires ?
- Quelles erreurs arrivent souvent ?
- Quelle trace doit rester ?

Un agent ne doit pas créer un processus parallèle. Il doit améliorer un processus existant ou aider à construire un processus mieux maîtrisé.

Dans les organisations tunisiennes, beaucoup de workflows passent encore par un mélange de mails, fichiers Excel, formulaires, appels, messages et validations informelles. L’agent peut aider, mais il doit d’abord révéler le workflow réel.

---

## 2. Workflow automatisé ou workflow agentique ?

Un workflow automatisé suit des étapes fixes.

Exemple :

> Si un formulaire est soumis, créer un ticket, envoyer une notification, archiver le fichier.

C’est utile si les cas sont prévisibles et les règles stables.

Un workflow agentique ajoute un raisonnement contrôlé.

Exemple :

> Lire la demande, identifier le type de problème, chercher la procédure applicable, vérifier les informations manquantes, proposer une réponse, demander validation humaine si le cas est sensible, puis consigner l’action.

Le workflow agentique est utile si la tâche contient :

- des cas variés ;
- des informations incomplètes ;
- des décisions de tri ;
- des exceptions ;
- des recherches documentaires ;
- des outils multiples ;
- des validations humaines ;
- des règles qui dépendent du contexte.

Anthropic recommande de commencer avec des workflows simples et composables avant de passer vers des agents plus autonomes. OpenAI souligne aussi que les agents peuvent planifier, appeler des outils, collaborer entre spécialistes et garder un état de travail pour accomplir des tâches multi-étapes.

---

## 3. La règle d’or : garder le chemin critique sous contrôle

Un workflow agentique doit être lisible.

Si vous ne pouvez pas expliquer le chemin suivi par l’agent, vous ne pourrez pas l’auditer.

Le chemin critique doit répondre à cette logique :

> entrée → qualification → récupération du contexte → choix d’action → validation → exécution → trace → suivi.

### Exemple simple

Demande collaborateur :

> “Je n’arrive pas à accéder à l’application de paie.”

Workflow possible :

1. recevoir la demande ;
2. identifier la catégorie : accès applicatif ;
3. vérifier si l’utilisateur est dans le bon département ;
4. chercher la procédure support ;
5. demander les informations manquantes ;
6. préparer une réponse ;
7. créer une note dans le ticket ;
8. escalader si le problème touche les droits utilisateurs ;
9. journaliser les outils appelés.

L’agent ne fait pas “tout”. Il suit une séquence contrôlée.

---

## 4. Les étapes d’un workflow agentique

Vous pouvez modéliser un workflow agentique en huit blocs.

### 1. Déclencheur

Qu’est-ce qui lance le workflow ?

Exemples :

- ticket reçu ;
- email reçu ;
- formulaire soumis ;
- document déposé ;
- alerte système ;
- demande utilisateur dans un chatbot ;
- événement dans un ERP ou CRM.

### 2. Qualification

Le système comprend la nature de la demande.

Exemples :

- catégorie ;
- urgence ;
- département concerné ;
- niveau de sensibilité ;
- action possible ;
- besoin de validation.

### 3. Collecte du contexte

L’agent rassemble les informations nécessaires.

Exemples :

- ticket ;
- historique ;
- procédure ;
- profil utilisateur ;
- statut commande ;
- politique interne ;
- document justificatif.

### 4. Choix d’action

L’agent choisit l’étape suivante dans le cadre autorisé.

Exemples :

- répondre ;
- demander une information ;
- créer un brouillon ;
- escalader ;
- appeler un outil ;
- arrêter le workflow.

### 5. Validation

Certaines actions exigent un humain.

Exemples :

- envoi externe ;
- décision financière ;
- traitement RH ;
- modification de statut ;
- accès à une donnée sensible ;
- réponse réglementaire.

### 6. Exécution

L’action est exécutée par l’agent ou par un humain.

Exemples :

- créer une note ;
- générer un brouillon ;
- ouvrir une tâche ;
- notifier un responsable ;
- classer un ticket ;
- mettre à jour un statut si autorisé.

### 7. Trace

Le système garde une preuve.

Exemples :

- outil appelé ;
- données consultées ;
- résultat produit ;
- validation reçue ;
- erreur rencontrée ;
- version du prompt ou du modèle.

### 8. Suivi

Le workflow n’est pas terminé si personne ne suit le résultat.

Exemples :

- ticket résolu ;
- demande escaladée ;
- délai dépassé ;
- réponse validée ;
- utilisateur satisfait ;
- erreur corrigée.

---

## 5. Les points de décision

Un workflow agentique n’est pas une ligne droite.

Il contient des points de décision.

Exemples :

- La demande est-elle complète ?
- Le sujet est-il sensible ?
- Le demandeur a-t-il le droit d’accès ?
- La procédure existe-t-elle ?
- Les sources sont-elles suffisantes ?
- L’agent peut-il répondre ou doit-il escalader ?
- L’action est-elle réversible ?
- Une validation humaine est-elle obligatoire ?

Chaque point de décision doit avoir une règle.

### Mauvaise règle

> L’agent décide selon le contexte.

Trop vague.

### Bonne règle

> Si la demande touche les salaires, les sanctions, les données personnelles, la sécurité ou les droits utilisateurs, l’agent ne répond pas directement. Il prépare une synthèse et escalade vers un humain autorisé.

Une bonne règle limite l’autonomie au bon endroit.

---

## 6. Les exceptions : là où les agents doivent être prudents

Les workflows réels contiennent des exceptions.

Un agent doit savoir quoi faire quand :

- la procédure est absente ;
- deux sources se contredisent ;
- l’utilisateur demande une action interdite ;
- l’outil externe échoue ;
- la donnée est manquante ;
- le niveau de confiance est faible ;
- la demande contient des données sensibles ;
- la demande sort du périmètre ;
- l’utilisateur insiste pour contourner une règle.

La bonne réponse n’est pas d’inventer.

La bonne réponse est :

- demander une information ;
- citer l’incertitude ;
- refuser ;
- escalader ;
- arrêter ;
- créer une note pour revue humaine.

Un agent fiable n’est pas celui qui répond toujours. C’est celui qui sait quand ne pas agir.

---

## 7. Human-in-the-loop : définir le bon moment

La validation humaine ne doit pas être placée partout. Sinon le workflow devient lourd.

Elle doit être placée aux bons points.

### Validation avant action externe

Exemple : envoyer un email client.

### Validation avant modification

Exemple : changer un statut dans un CRM.

### Validation avant décision sensible

Exemple : refuser une demande, classer une réclamation grave, traiter une donnée RH.

### Validation en cas d’incertitude

Exemple : sources contradictoires ou procédure absente.

### Validation par échantillonnage

Exemple : relire 10 % des réponses à faible risque pendant le pilote.

Le bon workflow équilibre productivité et contrôle.

---

## 8. Exemple : workflow agentique de support interne

### Problème

Les collaborateurs envoient des demandes support par email ou ticket. Les demandes sont mal catégorisées. Les réponses sont parfois lentes. Les procédures sont dispersées.

### Objectif du workflow

Qualifier la demande, chercher la procédure applicable, préparer une réponse et escalader les cas sensibles.

### Workflow proposé

1. Le ticket arrive.
2. L’agent lit le ticket.
3. Il classe la demande : IT, RH, finance, administratif, sécurité ou autre.
4. Il évalue la sensibilité : faible, moyenne, élevée.
5. Il cherche la procédure applicable dans la base documentaire.
6. Il identifie les informations manquantes.
7. Il prépare une réponse ou une demande de complément.
8. Il crée une note interne dans le ticket.
9. Il demande validation si la réponse touche un sujet sensible.
10. Il journalise les sources et outils utilisés.

### Actions autorisées

- classer le ticket ;
- chercher une procédure ;
- rédiger un brouillon ;
- créer une note interne ;
- proposer une escalade.

### Actions interdites au pilote

- fermer le ticket ;
- envoyer une réponse externe sans validation ;
- modifier les droits d’accès ;
- traiter un dossier RH sensible ;
- supprimer une donnée.

Ce workflow est contrôlé. Il donne de la valeur sans donner trop de pouvoir à l’agent.

---

## 9. Exemple tunisien : assistant d’admission ou d’inscription

Dans une école ou université tunisienne, les demandes d’admission ou d’inscription peuvent arriver par formulaire, téléphone, email, réseaux sociaux ou visite sur site.

Elles peuvent porter sur :

- conditions d’admission ;
- pièces du dossier ;
- délais ;
- frais ;
- équivalences ;
- bourses ;
- logement ;
- statut international ;
- changement de filière ;
- documents manquants.

Un agent peut aider à qualifier et préparer les réponses. Mais il ne doit pas prendre seul des décisions d’admission, de dérogation ou de traitement financier.

### Workflow agentique prudent

1. Recevoir la demande.
2. Identifier le profil : bachelier, étudiant licence, international, parent, autre.
3. Identifier le sujet : admission, pièces, paiement, hébergement, orientation.
4. Chercher les règles publiées ou validées.
5. Préparer une réponse sourcée.
6. Demander des informations manquantes.
7. Escalader les cas sensibles : équivalence, situation financière, cas particulier, dérogation.
8. Journaliser la réponse proposée et les sources.

Ce cas montre un principe important : l’agent peut accélérer l’orientation, mais la décision institutionnelle reste humaine.

---

## 10. Cartographier avec une table simple

Vous n’avez pas besoin d’un outil complexe pour commencer.

Utilisez une table.

| Étape | Entrée | Action agent | Outil | Décision | Validation | Sortie |
|---|---|---|---|---|---|---|
| 1 | Ticket reçu | Lire la demande | read_ticket | Catégorie ? | Non | Ticket résumé |
| 2 | Ticket résumé | Chercher procédure | search_kb | Source trouvée ? | Non | Sources |
| 3 | Sources | Préparer réponse | draft_response | Sensible ? | Oui si sensible | Brouillon |
| 4 | Brouillon | Créer note | create_note | Action autorisée ? | Non | Note interne |
| 5 | Cas sensible | Escalader | escalate | Responsable ? | Oui | Ticket escaladé |

Cette table devient la base pour l’intégration technique.

Elle aide Codex, Claude Code ou Antigravity à comprendre le workflow attendu.

---

## 11. Où placer le LLM ?

Toutes les étapes ne doivent pas être confiées au LLM.

Le LLM est utile pour :

- comprendre une demande ;
- résumer ;
- extraire des informations ;
- classer ;
- reformuler ;
- préparer un brouillon ;
- comparer des sources ;
- proposer une prochaine action.

Le code classique est préférable pour :

- vérifier une permission ;
- appliquer une règle stricte ;
- calculer un montant ;
- vérifier une date ;
- bloquer une action interdite ;
- écrire dans une base ;
- journaliser ;
- appeler une API.

Règle pratique :

> Laissez le LLM gérer l’ambiguïté. Laissez le code gérer les règles strictes.

Un workflow agentique solide combine les deux.

---

## 12. Déterministe ou agentique ?

Vous devez choisir le bon niveau de flexibilité.

### Workflow déterministe

Adapté si les étapes sont connues et les règles stables.

Exemple : formulaire → ticket → notification → archivage.

### Workflow agentique contrôlé

Adapté si la demande varie et nécessite une interprétation.

Exemple : demande support multi-thèmes avec procédure à chercher et sensibilité à évaluer.

### Agent plus autonome

Adapté si l’objectif est ouvert et si l’agent doit décider de plusieurs étapes possibles.

Exemple : analyser un dossier complexe, coordonner plusieurs outils et produire une synthèse de décision à valider.

Commencez toujours par le niveau le plus simple qui résout le problème.

---

## 13. Les sorties du workflow

Une sortie doit être exploitable.

Exemples de mauvaises sorties :

- “Voici une réponse.”
- “Le ticket semble urgent.”
- “Il faut vérifier.”

Exemples de bonnes sorties :

- catégorie ;
- niveau de priorité ;
- source utilisée ;
- informations manquantes ;
- brouillon de réponse ;
- action recommandée ;
- raison de l’escalade ;
- responsable suggéré ;
- trace des outils appelés.

Une bonne sortie permet au workflow de continuer.

---

## 14. Évaluer le workflow, pas seulement la réponse

Un agent peut produire une bonne phrase et un mauvais workflow.

Vous devez évaluer :

- classification correcte ;
- bonne source retrouvée ;
- informations manquantes détectées ;
- escalade appropriée ;
- action interdite bloquée ;
- validation humaine demandée au bon moment ;
- logs complets ;
- erreurs d’outil bien gérées ;
- temps gagné ;
- satisfaction utilisateur.

L’évaluation doit couvrir les cas normaux et les cas difficiles.

---

## À retenir

Un workflow agentique n’est pas un agent qui improvise.

C’est une séquence contrôlée qui combine :

> déclencheur → qualification → contexte → choix → validation → action → trace → suivi.

Votre rôle est de décider quelles étapes sont confiées au LLM, quelles étapes restent déterministes, quelles actions exigent un humain et quelles traces doivent rester.

Un bon workflow agentique donne de la flexibilité sans perdre le contrôle.

---

## Contexte checkpoint Ella

### Intention pédagogique

Ella doit vérifier que l’apprenant sait transformer un processus métier en workflow agentique contrôlé.

Le checkpoint doit demander à l’apprenant de structurer les étapes, décisions, outils, validations et sorties.

### Situation suggérée pour générer le checkpoint

Ella peut proposer ce scénario :

> Une organisation reçoit des demandes internes par ticket. Les demandes peuvent concerner l’IT, les RH, la finance ou l’administration. Certaines demandes sont simples, d’autres contiennent des données sensibles. La direction veut un agent qui traite automatiquement les tickets.

Ella demande à l’apprenant de concevoir un workflow agentique prudent :

- déclencheur ;
- qualification ;
- contexte ;
- outils ;
- décisions ;
- validations humaines ;
- actions autorisées ;
- sorties ;
- logs ;
- cas d’escalade.

### Ce qu’une bonne réponse doit contenir

Une bonne réponse doit mentionner :

1. les étapes du workflow ;
2. les points de décision ;
3. les outils nécessaires ;
4. la séparation lecture / écriture ;
5. la validation humaine pour les cas sensibles ;
6. les sorties exploitables ;
7. la traçabilité.

### Erreurs fréquentes à détecter

- Dire simplement “l’agent traite le ticket”.
- Oublier les exceptions.
- Oublier les validations humaines.
- Donner au LLM des règles strictes qui devraient être codées.
- Autoriser l’envoi ou la modification sans contrôle.
- Oublier les logs.
- Oublier les données sensibles.

### Relances socratiques possibles

- “Quel est le déclencheur exact du workflow ?”
- “Quelle étape doit rester déterministe ?”
- “À quel moment l’humain doit-il valider ?”
- “Quelle action l’agent peut-il faire seul ?”
- “Que se passe-t-il si la procédure n’existe pas ?”
- “Quelle sortie permet au workflow de continuer ?”

### Critères de validation

Ella peut valider si l’apprenant :

- produit un workflow structuré ;
- identifie les décisions et exceptions ;
- relie les outils aux étapes ;
- limite l’autonomie ;
- ajoute une validation humaine ;
- prévoit des logs ;
- définit des sorties utiles.

---

## Passage vers le Lab 2

Vous êtes prêt pour le Lab 2.

Votre mission sera de cartographier un workflow agentique pour un processus métier : support, RH, finance, admission, achats ou conformité.

---

## Références

1. OpenAI. **Agents SDK documentation**.  
   https://developers.openai.com/api/docs/guides/agents

2. OpenAI. **A practical guide to building AI agents**.  
   https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/

3. OpenAI Agents SDK. **Handoffs**.  
   https://openai.github.io/openai-agents-python/handoffs/

4. Anthropic. **Building effective AI agents**. 2024.  
   https://www.anthropic.com/research/building-effective-agents

5. Anthropic. **Writing effective tools for AI agents**. 2025.  
   https://www.anthropic.com/engineering/writing-tools-for-agents

6. NIST. **AI Risk Management Framework (AI RMF 1.0)**.  
   https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf

7. République Tunisienne. **Loi organique n°2004-63 du 27 juillet 2004, portant sur la protection des données à caractère personnel**.  
   https://www.ins.tn/sites/default/files/2020-04/Loi%2063-2004%20Fr.pdf
