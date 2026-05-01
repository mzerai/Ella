---
course_id: ella_tech_agentic_ai_enterprise_workflows
lab_id: "00_diagnose_fake_agent_lab"
lab_title_fr: "Lab 0 — Diagnostiquer un faux agent"
language: "fr"
encoding: "UTF-8"
---

# Lab 0 — Diagnostiquer un faux agent

## Mission

Vous recevez cinq descriptions de systèmes IA. Votre tâche est de classer chaque système :

- chatbot ;
- assistant IA ;
- workflow automatisé ;
- agent IA ;
- système multi-agents.

Pour chaque cas, justifiez votre choix en 3 à 5 lignes.

## Cas

### Cas 1

Un outil répond aux questions des collaborateurs à partir d’une FAQ RH. Il ne consulte aucun outil externe, ne crée aucun ticket et ne garde aucune trace d’action.

### Cas 2

Quand un formulaire est soumis, un scénario crée automatiquement un ticket, envoie une notification et archive le fichier. Le scénario suit toujours les mêmes étapes.

### Cas 3

Un assistant cherche dans une base documentaire interne, prépare une réponse à un client et demande à l’utilisateur de relire avant envoi.

### Cas 4

Un système analyse une demande support, consulte l’historique du ticket, cherche la procédure applicable, crée un brouillon de réponse, propose une priorité et demande validation avant mise à jour du ticket.

### Cas 5

Un système comprend un agent de tri, un agent conformité, un agent support et un agent superviseur. Chaque agent a un rôle spécialisé. Le superviseur décide à quel agent transmettre la tâche.

## Livrable attendu

Pour chaque cas :

```markdown
## Cas X
Classification :
Justification :
Garde-fou nécessaire :
```

## Critères de réussite

Votre réponse sera validée si vous distinguez clairement :

- réponse simple ;
- exécution d’étapes fixes ;
- usage d’outils ;
- choix d’actions ;
- validation humaine ;
- coordination entre agents.
