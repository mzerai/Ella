---
course_id: ella_tech_agentic_ai_enterprise_workflows
lab_id: "02_map_agentic_workflow_lab"
lab_title_fr: "Lab 2 — Cartographier un workflow agentique"
lab_title_en: "Lab 2 — Map an Agentic Workflow"
language: "fr"
encoding: "UTF-8"
target_score: 8
max_score: 10
---

# Lab 2 — Cartographier un workflow agentique

## Mission

Vous devez transformer un processus métier en workflow agentique contrôlé.

Choisissez un domaine :

- support interne ;
- RH ;
- finance ;
- admission ou inscription ;
- achats ;
- conformité ;
- service client ;
- IT.

Votre objectif est de produire une cartographie claire du workflow.

---

## Situation proposée

Une organisation reçoit des demandes internes par ticket et par email. Les demandes sont variées : IT, RH, finance, administratif. Certaines sont simples. D’autres contiennent des données sensibles ou demandent une action qui doit être validée.

La direction veut “un agent qui traite automatiquement les demandes”.

Vous devez proposer un workflow prudent.

---

## Livrable attendu

Complétez ce modèle.

```markdown
# Workflow agentique proposé

## 1. Processus choisi
...

## 2. Problème actuel
...

## 3. Déclencheur du workflow
...

## 4. Étapes du workflow
| Étape | Entrée | Action agent | Outil | Décision | Validation humaine | Sortie |
|---|---|---|---|---|---|---|
| 1 | ... | ... | ... | ... | ... | ... |

## 5. Points de décision
...

## 6. Exceptions à gérer
...

## 7. Actions autorisées
...

## 8. Actions interdites
...

## 9. Validations humaines nécessaires
...

## 10. Logs et traces à conserver
...

## 11. Sorties exploitables
...

## 12. Métriques d’évaluation
...
```

---

## Contraintes

Votre workflow doit :

- limiter l’autonomie de l’agent ;
- séparer les outils de lecture et d’écriture ;
- prévoir une escalade humaine ;
- bloquer les actions sensibles ;
- journaliser les outils appelés ;
- produire des sorties exploitables ;
- gérer les cas où l’information manque.

---

## Ce que Ella va évaluer

Ella vérifiera si vous :

- partez d’un processus réel ;
- structurez les étapes ;
- identifiez les décisions ;
- reliez les outils aux actions ;
- placez la validation humaine au bon moment ;
- prévoyez les exceptions ;
- produisez des sorties utiles ;
- conservez la traçabilité.

---

## Indices

- Un workflow agentique n’est pas une suite de prompts.
- Le LLM peut traiter l’ambiguïté.
- Le code doit gérer les règles strictes.
- Une action sensible doit être validée.
- Une bonne sortie permet au workflow de continuer.
