---
course_id: ella_tech_agentic_ai_enterprise_workflows
lab_id: "06_agentic_risk_review_lab"
lab_title_fr: "Lab 6 — Revue de risques agentiques"
lab_title_en: "Lab 6 — Agentic Risk Review"
language: "fr"
encoding: "UTF-8"
target_score: 8
max_score: 10
---

# Lab 6 — Revue de risques agentiques

## Mission

Vous devez réaliser une revue de risques pour un agent IA d’entreprise.

Choisissez un agent :

- agent RH ;
- agent finance ;
- agent support interne ;
- agent CRM ;
- agent admission ;
- agent conformité.

Votre objectif est de dire ce qui est dangereux, ce qui est acceptable et quels garde-fous sont nécessaires avant pilote.

---

## Situation proposée

Une entreprise veut créer un agent RH interne.

L’agent proposé aura accès à :

- procédures RH ;
- emails RH ;
- dossiers collaborateurs ;
- demandes de congé ;
- informations de contrat ;
- échanges avec les managers.

L’agent pourra :

- répondre directement aux collaborateurs ;
- préparer des décisions ;
- conserver les informations utiles ;
- créer des notes dans le système RH.

Vous devez corriger cette approche et proposer une version gouvernée.

---

## Livrable attendu

Complétez ce modèle.

```markdown
# Revue de risques agentiques

## 1. Agent analysé
...

## 2. Objectif acceptable de l’agent
...

## 3. Accès à refuser
...

## 4. Sources autorisées
...

## 5. Données personnelles ou sensibles
...

## 6. Actions autorisées
...

## 7. Actions interdites
...

## 8. Validations humaines obligatoires
...

## 9. Garde-fous techniques
...

## 10. Garde-fous organisationnels
...

## 11. Logs à conserver
...

## 12. Protection des secrets
...

## 13. Mode observation
...

## 14. Incident response et rollback
...

## 15. Responsable et gouvernance
...

## 16. Critères de passage en pilote
...
```

---

## Contraintes

Votre réponse doit :

- limiter les données personnelles ;
- refuser l’accès aux dossiers non nécessaires ;
- séparer procédure générale et dossier individuel ;
- placer une validation humaine sur les sujets sensibles ;
- protéger les secrets ;
- prévoir les logs ;
- prévoir un mode observation ;
- prévoir la désactivation de l’agent ou d’un outil ;
- nommer un responsable ;
- tenir compte du cadre tunisien de protection des données personnelles.

---

## Ce que Ella va évaluer

Ella vérifiera si vous :

- identifiez les risques réels ;
- refusez les accès excessifs ;
- proposez des garde-fous concrets ;
- distinguez sécurité technique et gouvernance ;
- placez la validation humaine ;
- protégez logs et secrets ;
- prévoyez incident response et rollback ;
- proposez une version pilotable.

---

## Indices

- Un agent RH ne doit pas lire tous les dossiers collaborateurs.
- Une procédure générale n’est pas un dossier individuel.
- Une mémoire durable sur données sensibles est dangereuse.
- Un outil d’écriture RH doit être validé.
- Les logs protègent, mais ils peuvent aussi exposer.
