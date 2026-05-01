---
course_id: ella_tech_agentic_ai_enterprise_workflows
lab_id: "01_decompose_enterprise_agent_lab"
lab_title_fr: "Lab 1 — Décomposer un agent d’entreprise"
lab_title_en: "Lab 1 — Decompose an Enterprise Agent"
language: "fr"
encoding: "UTF-8"
target_score: 8
max_score: 10
---

# Lab 1 — Décomposer un agent d’entreprise

## Mission

Vous devez décomposer un agent de support interne avant sa conception.

La direction souhaite un agent capable de recevoir des demandes collaborateurs, chercher dans une base documentaire interne, proposer une catégorie, préparer une réponse et créer une note dans le ticketing.

Votre rôle : transformer cette idée en spécification claire.

---

## Contexte

L’organisation dispose de :

- une base documentaire support ;
- un outil de ticketing ;
- des procédures RH, IT et administratives ;
- des utilisateurs de plusieurs départements ;
- des demandes sensibles possibles : RH, sécurité, finance, données personnelles.

La direction demande : “Nous voulons un agent autonome.”

Vous devez recadrer cette demande.

---

## Livrable attendu

Complétez les sections suivantes.

```markdown
# Spécification d’un agent de support interne

## 1. Objectif précis
...

## 2. Utilisateurs
...

## 3. Données autorisées
...

## 4. Données interdites ou sensibles
...

## 5. Outils nécessaires
...

## 6. Actions autorisées
...

## 7. Actions interdites
...

## 8. Validations humaines nécessaires
...

## 9. Logs et traçabilité
...

## 10. Risques principaux
...

## 11. Garde-fous
...

## 12. Métriques d’évaluation
...
```

---

## Contraintes

Votre agent ne doit pas :

- lire toutes les données internes ;
- envoyer une réponse externe sans validation ;
- modifier des droits utilisateurs ;
- traiter des dossiers RH sensibles sans escalade ;
- fermer un ticket automatiquement dans le pilote ;
- masquer ses sources ;
- agir sans journalisation.

---

## Ce que Ella va évaluer

Ella vérifiera si vous :

- formulez un objectif précis ;
- limitez le périmètre ;
- distinguez lecture et écriture ;
- définissez les outils ;
- limitez les permissions ;
- ajoutez une validation humaine ;
- prévoyez les logs ;
- identifiez les risques ;
- proposez des métriques réalistes.

---

## Indices

- Un outil de lecture n’a pas le même risque qu’un outil d’écriture.
- Un agent utile n’a pas besoin d’accéder à tout.
- Une réponse préparée peut rester un brouillon.
- Un premier pilote peut fonctionner en mode observation.
- Les demandes RH, sécurité ou finance doivent être escaladées.
