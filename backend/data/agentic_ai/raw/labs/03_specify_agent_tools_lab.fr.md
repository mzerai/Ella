---
course_id: ella_tech_agentic_ai_enterprise_workflows
lab_id: "03_specify_agent_tools_lab"
lab_title_fr: "Lab 3 — Spécifier les outils d’un agent"
lab_title_en: "Lab 3 — Specify Agent Tools"
language: "fr"
encoding: "UTF-8"
target_score: 8
max_score: 10
---

# Lab 3 — Spécifier les outils d’un agent

## Mission

Vous devez spécifier cinq outils pour un agent d’entreprise.

L’agent choisi peut être :

- agent support interne ;
- agent admission ;
- agent RH ;
- agent finance ;
- agent achats ;
- agent conformité ;
- agent service client.

Votre objectif est de produire des fiches d’outils claires, limitées et sécurisables.

---

## Situation proposée

Une organisation veut créer un agent support interne. L’agent doit :

- lire un ticket ;
- chercher une procédure ;
- préparer une réponse ;
- créer une note interne ;
- escalader les cas sensibles.

La direction propose un outil unique appelé :

```text
access_all_systems
```

Vous devez refuser cette approche et proposer des outils spécialisés.

---

## Livrable attendu

Spécifiez au moins cinq outils avec ce modèle :

```markdown
# Spécification des outils de l’agent

## Outil 1 — Nom

### Objectif
...

### Type
Lecture / Écriture / Envoi ou déclenchement

### Quand l’utiliser
...

### Quand ne pas l’utiliser
...

### Entrées
...

### Sorties
...

### Permissions
...

### Risques
...

### Garde-fous
...

### Erreurs possibles
...

### Logs à conserver
...

### Validation humaine
...
```

---

## Outils attendus possibles

Vous pouvez utiliser ou adapter ces exemples :

- `read_ticket_summary`
- `search_internal_policy`
- `draft_internal_response`
- `create_internal_note`
- `escalate_sensitive_case`
- `request_manager_approval`
- `log_agent_action`

---

## Contraintes

Vos outils doivent :

- être nommés clairement ;
- avoir un périmètre limité ;
- séparer lecture et écriture ;
- éviter les données personnelles inutiles ;
- vérifier les permissions côté système ;
- prévoir les erreurs ;
- journaliser les appels ;
- demander une validation humaine pour les actions sensibles.

---

## Ce que Ella va évaluer

Ella vérifiera si vous :

- refusez l’outil trop large ;
- découpez correctement les outils ;
- définissez des entrées minimales ;
- définissez des sorties utiles ;
- limitez les permissions ;
- prévoyez les erreurs ;
- ajoutez les logs ;
- placez la validation humaine au bon niveau.

---

## Indices

- Un outil qui “accède à tout” est dangereux.
- Un outil de lecture doit retourner un résumé limité.
- Un outil d’écriture doit être idempotent.
- Une action externe doit être validée.
- L’agent ne doit jamais voir les clés API.
- Une erreur d’outil doit être visible, pas cachée.
