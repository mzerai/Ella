---
course_id: ella_industry_ai_finance_banking
course_slug: ai-finance-banking
pathway: industry
level: advanced
module_id: 01_credit_scoring_risk
lesson_id: 03_credit_scoring_models
language: fr
title: "Leçon 3 — Choisir le bon modèle de scoring crédit"
estimated_duration_minutes: 40
version: 1.0
encoding: UTF-8
---

# Leçon 3 — Choisir le bon modèle de scoring crédit

## Objectif de la leçon

Tu as vu que les données font une grande partie du travail. Maintenant, tu vas choisir le modèle.

Ton réflexe doit rester simple : **ne cherche pas le modèle le plus impressionnant. Cherche le modèle le plus utile, contrôlable et défendable pour la décision crédit.**

À la fin de cette leçon, tu seras capable de :

1. distinguer les familles de modèles utiles en scoring crédit ;
2. choisir entre modèle simple, modèle d’arbres et modèle plus complexe ;
3. comprendre pourquoi une probabilité doit être calibrée ;
4. préparer une justification de choix modèle pour une équipe risque ou conformité.

---

## 1. Le modèle ne décide pas à ta place

Un modèle de scoring crédit estime un niveau de risque. Il ne doit pas remplacer toute la décision.

Dans un environnement financier, une décision crédit engage le client, l’institution, le risque de défaut, la relation commerciale et la conformité. C’est pour cela que le modèle doit être relié à une politique d’octroi, à des seuils, à une revue humaine et à un dispositif de contrôle.

La circulaire BCT n°2021-05 insiste sur la gouvernance, la culture du risque et les dispositifs de contrôle dans les banques et établissements financiers [1]. Le Basel Committee rappelle aussi que la gestion du risque crédit doit reposer sur un processus sain d’octroi, de mesure, de suivi et de contrôle du risque [3].

❌ **Erreur fréquente**  
Dire : “Le modèle a donné 0,82, donc le crédit est refusé.”

✅ **Bonne approche**  
Dire : “Le modèle estime un risque élevé. Nous devons regarder les facteurs explicatifs, le seuil de décision, les garanties, les règles internes et le besoin éventuel de revue humaine.”

---

## 2. Le modèle de référence : la régression logistique

La régression logistique reste un excellent point de départ pour le scoring crédit.

Elle estime une probabilité d’appartenance à une classe. Dans notre cas, la classe peut être “défaut”, “retard significatif” ou “risque élevé”. Les bibliothèques comme scikit-learn proposent une version régularisée par défaut, ce qui aide à limiter certains problèmes de surapprentissage [6].

Son avantage principal est sa lisibilité. Tu peux expliquer qu’une variable augmente ou diminue le risque, toutes choses égales par ailleurs. Cela parle aux équipes risque, audit et conformité.

Mais elle a une limite : elle capte moins bien les relations complexes si tu ne prépares pas les variables avec soin.

**Quand l’utiliser ?**

| Situation | Pourquoi elle convient |
|---|---|
| Premier prototype | Elle donne une baseline claire. |
| Besoin d’explicabilité forte | Les coefficients sont plus faciles à discuter. |
| Dataset modéré | Elle fonctionne bien avec des données structurées propres. |
| Comité risque exigeant | Elle se défend plus simplement qu’un modèle opaque. |

---

## 3. Les arbres de décision : simples à lire, parfois instables

Un arbre de décision découpe la population en segments. Par exemple : revenu inférieur à un seuil, incidents récents, ancienneté faible, solde moyen bas.

C’est intuitif. Tu peux montrer un chemin de décision. Mais un arbre seul peut devenir instable : une petite variation dans les données peut changer la structure de l’arbre.

Utilise-le souvent comme outil pédagogique ou exploratoire. Pour une production sérieuse, on préfère souvent des ensembles d’arbres, mieux contrôlés et mieux évalués.

❌ **Erreur fréquente**  
Croire qu’un arbre lisible est automatiquement fiable.

✅ **Bonne approche**  
Tester sa stabilité, vérifier ses performances sur données hors échantillon, et comparer avec une baseline simple.

---

## 4. Random Forest et Gradient Boosting : plus puissants, plus exigeants

Les modèles à base d’arbres en ensemble captent mieux les interactions entre variables.

Une **Random Forest** combine plusieurs arbres. Elle réduit souvent l’instabilité d’un arbre seul.

Le **Gradient Boosting** construit les arbres de manière séquentielle. Chaque nouvel arbre corrige une partie des erreurs précédentes. Scikit-learn décrit le Gradient Boosting comme un modèle additif construit étape par étape pour optimiser une fonction de perte différentiable [7].

Ces modèles peuvent être très performants en scoring. Mais leur usage demande plus de discipline : validation, explicabilité, calibration, documentation, monitoring et contrôle de dérive.

Dans la finance, la question n’est pas : “Quel modèle donne la meilleure AUC ?”  
La vraie question est : **“Quel modèle donne une performance suffisante avec un niveau d’explicabilité, de stabilité et de gouvernance acceptable ?”**

---

## 5. Le piège du modèle complexe

Un modèle complexe peut améliorer les résultats techniques. Mais il peut aussi créer trois problèmes.

### Problème 1 — Il est plus difficile à expliquer

Si l’équipe risque ne comprend pas pourquoi le modèle classe un dossier comme risqué, la décision devient difficile à défendre.

### Problème 2 — Il peut capter des signaux dangereux

Un modèle puissant peut exploiter des variables proxy : zone géographique, canal digital, type d’appareil, comportement atypique. Ces signaux peuvent être prédictifs mais poser des risques d’équité et d’acceptabilité.

### Problème 3 — Il peut être plus difficile à surveiller

Un modèle performant au lancement peut se dégrader si le profil des clients, l’économie, les produits ou les politiques internes changent.

Le NIST AI RMF propose une logique utile ici : gouverner, cartographier les risques, les mesurer, puis les gérer tout au long du cycle de vie du système IA [4].

---

## 6. Une probabilité n’est pas toujours une bonne probabilité

En scoring crédit, le modèle produit souvent un score ou une probabilité estimée.

Mais attention : une probabilité prédite n’est pas toujours bien calibrée. Si un modèle attribue 20 % de risque à 1 000 dossiers, tu t’attends à ce qu’environ 200 dossiers posent effectivement problème dans ce groupe. Si ce n’est pas le cas, le modèle est mal calibré.

La calibration est importante parce que les seuils de décision dépendent du niveau de risque. Scikit-learn rappelle qu’en classification, on veut parfois obtenir une probabilité associée à la prédiction, mais certains modèles donnent de mauvaises estimations de probabilité et doivent être calibrés [8].

**Exemple simple**

| Dossier | Probabilité de défaut estimée | Décision possible |
|---|---:|---|
| A | 3 % | Acceptation possible |
| B | 18 % | Revue humaine |
| C | 42 % | Refus ou demande de garanties |

Le seuil n’est pas une vérité mathématique. C’est un choix métier. Il dépend de la politique de risque, du produit, du segment client, du coût du défaut, du coût du refus injustifié et des exigences internes.

---

## 7. Comment choisir ton modèle en pratique

Utilise cette séquence.

### Étape 1 — Construis une baseline simple

Commence par une régression logistique ou un arbre simple. Tu obtiens un point de comparaison.

### Étape 2 — Teste un modèle plus puissant

Essaie Random Forest ou Gradient Boosting. Compare les performances, mais regarde aussi la stabilité, l’explicabilité et la calibration.

### Étape 3 — Compare avec des critères métier

Ne compare pas seulement l’AUC. Demande : combien de bons clients sont refusés ? Combien de dossiers risqués passent ? Combien de dossiers partent en revue humaine ?

### Étape 4 — Documente le choix

Explique pourquoi tu gardes ce modèle. Explique aussi pourquoi tu rejettes les autres.

### Étape 5 — Prévois le monitoring

Un modèle de scoring doit être surveillé : performance, dérive des données, dérive des scores, évolution du taux de défaut, stabilité des variables et alertes métier.

---

## 8. Mini-cas : choisir un modèle pour un crédit consommation

Tu travailles dans une banque. L’équipe veut lancer un modèle de scoring pour un crédit consommation.

Tu as :

| Élément | Situation |
|---|---|
| Dataset | 25 000 anciens dossiers |
| Variables | revenus, charges, incidents, ancienneté, historique de remboursement, solde moyen |
| Objectif | estimer le risque de défaut à 12 mois |
| Contraintes | comité risque exigeant, besoin d’explication client, revue humaine possible |
| Temps projet | 8 semaines pour un pilote |

Ton choix raisonnable :

1. construire une baseline en régression logistique ;
2. tester un Gradient Boosting en comparaison ;
3. vérifier les métriques, la calibration et les explications ;
4. proposer un seuil d’acceptation, un seuil de refus et une zone de revue humaine ;
5. documenter les limites avant tout passage en production.

Tu vois l’idée : tu ne choisis pas un modèle parce qu’il est “plus IA”. Tu choisis un modèle parce qu’il tient dans un dispositif complet de décision.

---

## 9. Ce que tu dois retenir

Pour le scoring crédit, retiens ceci :

1. **Un modèle simple et bien contrôlé vaut mieux qu’un modèle complexe mal gouverné.**
2. **La performance technique ne suffit pas.**
3. **La probabilité doit être comprise, calibrée et reliée à un seuil métier.**
4. **Chaque choix modèle doit être documenté.**
5. **Le modèle doit rester surveillé après son déploiement.**

Dans l’Union européenne, les systèmes IA utilisés pour évaluer la solvabilité ou établir un score de crédit de personnes physiques sont classés comme systèmes à haut risque, sauf exceptions prévues pour certains usages comme la détection de fraude financière [5]. Même si ton cadre local est tunisien, cette classification te donne un repère utile : le scoring crédit n’est pas un terrain d’expérimentation légère.

---

## Checkpoint Ella

**Ella :**  
Ton équipe propose d’utiliser directement un modèle de Gradient Boosting pour le scoring crédit parce qu’il donne la meilleure AUC sur le jeu de test. Le responsable risque te demande : “Pourquoi ne pas le mettre tout de suite en production ?”

Rédige une réponse courte, en 8 à 10 lignes. Tu dois expliquer pourquoi la meilleure AUC ne suffit pas et quels contrôles doivent être faits avant une décision.

**Mode :** `free`

### ella_system_hint

```text
Evaluate whether the learner understands that model selection in credit scoring cannot rely only on AUC or predictive performance. A strong answer should mention explainability, calibration, threshold policy, data quality, bias or proxy variables, validation on out-of-sample data, human review, documentation, monitoring, and risk/compliance approval. Accept simple wording if the reasoning is sound. Praise answers that connect model choice to banking governance and credit risk controls. Correct answers that say “deploy it because it performs best” or focus only on technical accuracy. Do not provide the full answer directly; ask one Socratic follow-up if the response misses risk, compliance, or calibration.
```

---

## Références

1. Banque Centrale de Tunisie, **Circulaire aux banques et aux établissements financiers n°2021-05 du 19 août 2021 — Cadre de gouvernance des banques et des établissements financiers**.  
   https://www.cbf.org.tn/wp-content/uploads/2023/01/05-Circulaire-aux-banques-et-aux-etablissements-financiers-n%C2%B02021-05-du-19-Aout-2021.pdf

2. Banque Centrale de Tunisie, **Circulaire aux banques et aux établissements financiers n°2022-01 du 1er mars 2022 — Prévention et résolution des créances non performantes**.  
   https://www.cbf.org.tn/wp-content/uploads/2023/01/01-Circulaire-aux-banques-et-aux-etablissements-financiers-n%C2%B02022-01-du-01-Mars-2022.pdf

3. Basel Committee on Banking Supervision, **Principles for the management of credit risk**, Bank for International Settlements, 2025.  
   https://www.bis.org/bcbs/publ/d595.pdf

4. NIST, **Artificial Intelligence Risk Management Framework (AI RMF 1.0)**, 2023.  
   https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf

5. European Union, **Artificial Intelligence Act — Annex III, high-risk AI systems**, creditworthiness and credit scoring.  
   https://artificialintelligenceact.eu/annex/3/

6. scikit-learn, **LogisticRegression documentation**.  
   https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html

7. scikit-learn, **GradientBoostingClassifier documentation**.  
   https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.GradientBoostingClassifier.html

8. scikit-learn, **Probability calibration — User Guide**.  
   https://scikit-learn.org/stable/modules/calibration.html
