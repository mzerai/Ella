---
course_id: ella_tech_agentic_ai_enterprise_workflows
lab_id: "04_design_rag_memory_context_lab"
lab_title_fr: "Lab 4 — Concevoir RAG, mémoire et contexte"
lab_title_en: "Lab 4 — Design RAG, Memory, and Context"
language: "fr"
encoding: "UTF-8"
target_score: 8
max_score: 10
---

# Lab 4 — Concevoir RAG, mémoire et contexte

## Mission

Vous devez concevoir la stratégie RAG, mémoire et contexte d’un agent d’entreprise.

Choisissez un agent :

- agent RH ;
- agent admission ;
- agent support interne ;
- agent conformité ;
- agent service client ;
- agent finance ;
- agent achats.

Votre objectif est de décider quelles sources l’agent peut consulter, ce qu’il peut mémoriser, ce qu’il doit citer et ce qu’il doit refuser ou escalader.

---

## Situation proposée

Une organisation veut créer un agent RH. Elle propose d’indexer :

- tout le drive partagé ;
- les procédures RH ;
- les emails RH ;
- des anciens fichiers Excel ;
- les notes de réunion ;
- des dossiers collaborateurs.

L’agent doit répondre aux collaborateurs et retenir les informations utiles pour les prochaines conversations.

Vous devez corriger cette approche.

---

## Livrable attendu

Complétez ce modèle.

```markdown
# Stratégie RAG, mémoire et contexte

## 1. Agent choisi
...

## 2. Objectif de l’agent
...

## 3. Sources RAG autorisées
| Source | Propriétaire | Statut | Confidentialité | Accès | Date de validité |
|---|---|---|---|---|---|

## 4. Sources interdites ou à exclure
...

## 5. Métadonnées à utiliser
...

## 6. Règles de chunking
...

## 7. Règles de citation
...

## 8. Mémoire de session autorisée
...

## 9. Mémoire durable autorisée
...

## 10. Données à ne jamais mémoriser
...

## 11. Droits d’accès
...

## 12. Gestion des contradictions
...

## 13. Documents obsolètes
...

## 14. Risques de prompt injection documentaire
...

## 15. Garde-fous
...

## 16. Tests à réaliser
...
```

---

## Contraintes

Votre stratégie doit :

- refuser l’indexation non filtrée de tout le drive ;
- privilégier les sources validées ;
- limiter les données personnelles ;
- distinguer RAG, état de workflow et mémoire ;
- prévoir les citations ;
- gérer documents obsolètes et contradictions ;
- traiter les documents récupérés comme données, pas instructions ;
- définir ce qui doit être escaladé.

---

## Ce que Ella va évaluer

Ella vérifiera si vous :

- sélectionnez des sources pertinentes ;
- excluez les sources risquées ;
- proposez des métadonnées utiles ;
- distinguez mémoire de session et mémoire durable ;
- limitez les données sensibles ;
- prévoyez citations et règles de priorité ;
- ajoutez des garde-fous contre l’injection ;
- proposez des tests réalistes.

---

## Indices

- Le RAG récupère une source. La mémoire conserve une information.
- Un document récupéré n’est jamais une instruction système.
- Une source validée vaut mieux qu’un drive complet.
- Une contradiction doit être signalée ou escaladée.
- La mémoire durable doit rester rare.
