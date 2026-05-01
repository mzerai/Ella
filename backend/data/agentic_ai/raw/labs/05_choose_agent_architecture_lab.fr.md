---
course_id: ella_tech_agentic_ai_enterprise_workflows
lab_id: "05_choose_agent_architecture_lab"
lab_title_fr: "Lab 5 — Choisir l’architecture agentique"
lab_title_en: "Lab 5 — Choose the Agentic Architecture"
language: "fr"
encoding: "UTF-8"
target_score: 8
max_score: 10
---

# Lab 5 — Choisir l’architecture agentique

## Mission

Vous devez choisir l’architecture adaptée pour plusieurs cas d’entreprise.

Votre objectif n’est pas de choisir l’architecture la plus avancée. Votre objectif est de choisir l’architecture la plus simple, sûre et testable pour chaque situation.

---

## Cas à analyser

### Cas 1 — Formulaire vers ticket

Un collaborateur soumet un formulaire IT. Le système doit créer un ticket, notifier l’équipe et archiver la pièce jointe. Les règles sont fixes.

### Cas 2 — Support interne

Un agent reçoit des tickets internes variés. Les demandes restent dans le domaine support. L’agent doit lire le ticket, chercher la procédure, préparer une réponse, créer une note et escalader les cas sensibles.

### Cas 3 — Assistance multi-domaines

Une entreprise veut une plateforme qui traite les demandes RH, IT, finance et conformité. Chaque domaine a ses propres sources, permissions, règles et responsables.

### Cas 4 — Analyse de dossier conformité

Un agent doit analyser un dossier complexe, extraire les obligations, comparer avec les pièces disponibles, relever les manques et produire une synthèse à valider.

### Cas 5 — Réclamation client sensible

Un système doit préparer une réponse à une réclamation client. La réponse doit être exacte, sourcée, conforme et validée avant envoi.

---

## Architectures possibles

Choisissez parmi :

- workflow déterministe avec étapes LLM ;
- agent unique avec outils ;
- routeur vers agents spécialisés ;
- superviseur avec agents comme outils ;
- handoffs ;
- orchestrator-workers ;
- evaluator-optimizer ;
- validation humaine renforcée.

---

## Livrable attendu

Pour chaque cas, complétez :

```markdown
## Cas X

### Architecture choisie
...

### Pourquoi cette architecture
...

### Pourquoi une architecture plus complexe n’est pas nécessaire ou devient risquée
...

### Données sensibles ou risques
...

### Outils nécessaires
...

### Validation humaine
...

### Logs à conserver
...

### Mode dégradé si un agent ou outil échoue
...
```

---

## Ce que Ella va évaluer

Ella vérifiera si vous :

- choisissez une architecture adaptée ;
- évitez la sur-architecture ;
- justifiez par la complexité et le risque ;
- limitez les outils ;
- définissez la responsabilité ;
- prévoyez les logs ;
- placez la validation humaine ;
- prévoyez un mode dégradé.

---

## Indices

- Un workflow fixe ne nécessite pas toujours un agent.
- Un seul domaine peut souvent commencer avec un agent unique.
- Plusieurs domaines sensibles justifient un routeur ou des spécialistes.
- Une tâche complexe peut justifier orchestrator-workers.
- Une réponse sensible gagne à être évaluée avant validation humaine.
