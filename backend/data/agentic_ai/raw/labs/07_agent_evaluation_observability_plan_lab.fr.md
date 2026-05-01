---
course_id: ella_tech_agentic_ai_enterprise_workflows
lab_id: "07_agent_evaluation_observability_plan_lab"
lab_title_fr: "Lab 7 — Plan d’évaluation et d’observabilité"
lab_title_en: "Lab 7 — Agent Evaluation and Observability Plan"
language: "fr"
encoding: "UTF-8"
target_score: 8
max_score: 10
---

# Lab 7 — Plan d’évaluation et d’observabilité

## Mission

Vous devez construire un plan d’évaluation, d’observabilité et de passage en pilote pour un agent d’entreprise.

Choisissez un agent :

- agent support interne ;
- agent admission ;
- agent RH ;
- agent finance ;
- agent conformité ;
- agent service client.

Votre objectif est de prouver que l’agent peut être testé, surveillé et arrêté si nécessaire.

---

## Situation proposée

Une organisation veut piloter un agent support interne.

L’agent doit :

- lire les tickets ;
- chercher les procédures ;
- préparer des réponses ;
- créer des notes internes ;
- escalader les cas sensibles ;
- ne jamais envoyer de réponse externe sans validation.

La direction demande : “Comment savons-nous qu’il est prêt ?”

---

## Livrable attendu

Complétez ce modèle.

```markdown
# Plan d’évaluation et d’observabilité

## 1. Agent évalué
...

## 2. Objectif de l’agent
...

## 3. Périmètre du test
...

## 4. Dataset de test
| ID | Type de cas | Entrée | Comportement attendu | Critère de réussite |
|---|---|---|---|---|

## 5. Cas standard
...

## 6. Cas ambigus
...

## 7. Cas sensibles
...

## 8. Cas hostiles ou prompt injection
...

## 9. Tests des outils
...

## 10. Tests RAG et sources
...

## 11. Tests mémoire
...

## 12. Métriques
...

## 13. Graders
Humain :
Règle déterministe :
IA :
...

## 14. Traces à conserver
...

## 15. Dashboard d’observabilité
...

## 16. Feedback utilisateur
...

## 17. Tests de régression
...

## 18. Seuils de passage en pilote
...

## 19. Procédure de rollback
...

## 20. Décision finale
Continuer / ajuster / bloquer / passer en pilote :
...
```

---

## Contraintes

Votre plan doit :

- évaluer la réponse finale et le chemin agentique ;
- tester les outils ;
- tester les permissions ;
- tester les sources ;
- inclure des cas sensibles ;
- inclure des cas d’injection ;
- prévoir les logs ;
- définir des seuils ;
- prévoir un rollback ;
- lier les métriques au risque métier.

---

## Ce que Ella va évaluer

Ella vérifiera si vous :

- créez un dataset varié ;
- définissez des comportements attendus ;
- évaluez outils, RAG, mémoire et permissions ;
- prévoyez les traces ;
- utilisez des graders adaptés ;
- définissez des seuils réalistes ;
- incluez observabilité et feedback ;
- prévoyez une procédure de rollback.

---

## Indices

- Une réponse correcte ne suffit pas si le mauvais outil a été appelé.
- Une escalade correcte vaut mieux qu’une réponse inventée.
- Les actions sensibles doivent exiger une validation humaine.
- Le dashboard doit montrer les risques, pas seulement le volume.
- Les tests de régression protègent contre les mises à jour risquées.
