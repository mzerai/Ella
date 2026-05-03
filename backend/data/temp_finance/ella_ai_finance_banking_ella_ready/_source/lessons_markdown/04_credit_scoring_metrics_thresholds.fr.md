---
course_id: ella_industry_ai_finance_banking
course_slug: ai-finance-banking
pathway: industry
level: advanced
module_id: 01_credit_scoring_risk
lesson_id: 04_credit_scoring_metrics_thresholds
language: fr
title: "Leçon 4 — Évaluer un modèle de scoring crédit : métriques, seuils et coût métier"
estimated_duration_minutes: 45
version: 1.0
encoding: UTF-8
---

# Leçon 4 — Évaluer un modèle de scoring crédit : métriques, seuils et coût métier

## Objectif de la leçon

Tu as choisi un modèle. Maintenant, tu dois l’évaluer.

Ne te laisse pas piéger par une seule métrique. En scoring crédit, un modèle peut afficher une bonne performance globale et rester dangereux pour le métier. Il peut refuser trop de bons clients, accepter trop de dossiers risqués, mal estimer les probabilités, ou produire des alertes que les équipes ne peuvent pas traiter.

À la fin de cette leçon, tu seras capable de :

1. lire une matrice de confusion dans un contexte crédit ;
2. distinguer accuracy, precision, recall, F1 et AUC ;
3. comprendre pourquoi le seuil de décision est un choix métier ;
4. relier les erreurs du modèle à un coût financier, commercial et réglementaire ;
5. expliquer pourquoi la calibration compte pour une décision crédit.

---

## 1. Commence par la question métier

Avant de regarder les chiffres, pose la bonne question : **quelle erreur coûte le plus cher ?**

Dans un modèle de scoring crédit, tu peux avoir deux erreurs majeures.

| Erreur | Exemple | Risque métier |
|---|---|---|
| Faux positif | Le modèle classe un bon client comme risqué | Perte commerciale, frustration client, exclusion injustifiée |
| Faux négatif | Le modèle classe un client risqué comme acceptable | Défaut futur, perte financière, hausse des créances douteuses |

La deuxième erreur semble souvent plus grave. Mais attention : si tu refuses trop de bons clients, tu détruis aussi de la valeur. Tu dégrades la relation client. Tu peux créer un risque d’équité si certains profils sont refusés sans raison solide.

La BCT demande aux banques et établissements financiers de disposer de dispositifs solides de gouvernance, de contrôle interne et de gestion des risques [1]. Pour les créances non performantes, elle insiste aussi sur la prévention, les alertes précoces et le traitement proactif du risque [2]. Ton modèle doit donc être évalué comme un outil de gestion du risque, pas comme un simple exercice statistique.

❌ **Erreur fréquente**  
Dire : “Le modèle est bon, son accuracy est de 92 %.”

✅ **Bonne approche**  
Dire : “Le modèle semble performant, mais je dois vérifier quelles erreurs il commet, sur quels profils, avec quel coût métier et avec quel seuil de décision.”

---

## 2. La matrice de confusion : ton premier réflexe

La matrice de confusion compare la vérité connue avec la prédiction du modèle.

Dans notre cas, imaginons deux classes :

- **0 = dossier sain** ;
- **1 = risque élevé ou défaut futur**.

| | Prédit sain | Prédit risqué |
|---|---:|---:|
| Réel sain | Vrai négatif | Faux positif |
| Réel risqué | Faux négatif | Vrai positif |

Lis-la comme un responsable risque.

- **Vrai négatif** : le client est sain et le modèle l’accepte.
- **Vrai positif** : le client est risqué et le modèle le détecte.
- **Faux positif** : le client est sain, mais le modèle le bloque.
- **Faux négatif** : le client est risqué, mais le modèle le laisse passer.

Le faux négatif peut coûter cher en pertes futures. Le faux positif peut coûter cher en opportunités perdues. Tu dois donc regarder les deux.

---

## 3. Accuracy : utile, mais souvent trompeuse

L’accuracy mesure la proportion totale de bonnes prédictions.

Elle est simple. Elle est facile à comprendre. Mais elle peut mentir dans un cas déséquilibré.

Imagine 10 000 dossiers. Seulement 500 deviennent réellement problématiques. Si un modèle prédit “sain” pour tout le monde, il obtient déjà 95 % d’accuracy. Pourtant, il ne détecte aucun dossier risqué.

Dans le crédit, les événements négatifs peuvent être moins fréquents que les dossiers sains. Donc l’accuracy ne suffit pas.

**Règle pratique**  
Si une classe est rare, ne t’arrête jamais à l’accuracy.

---

## 4. Precision et recall : deux angles différents

La **precision** répond à cette question : parmi les dossiers que le modèle classe comme risqués, combien sont réellement risqués ?

Le **recall** répond à cette question : parmi tous les dossiers réellement risqués, combien le modèle détecte-t-il ?

Scikit-learn définit la precision comme `tp / (tp + fp)` et le recall comme `tp / (tp + fn)` [6]. Cette définition paraît technique, mais le sens métier est simple.

| Métrique | Question métier | Si elle est faible |
|---|---|---|
| Precision | Les alertes risque sont-elles fiables ? | Trop de bons clients sont bloqués |
| Recall | Le modèle détecte-t-il les dossiers risqués ? | Trop de dossiers risqués passent |

Tu ne peux pas maximiser les deux sans arbitrage. Si tu baisses le seuil pour détecter plus de dossiers risqués, tu augmentes souvent les faux positifs. Si tu montes le seuil pour éviter de bloquer de bons clients, tu risques de laisser passer plus de dossiers risqués.

C’est ici que le métier entre dans la décision.

---

## 5. F1-score : pratique, mais pas toujours adapté au crédit

Le F1-score combine precision et recall. Il peut servir de résumé quand tu veux équilibrer les deux.

Mais en scoring crédit, les deux erreurs n’ont pas toujours le même coût. Un faux négatif peut coûter des milliers de dinars. Un faux positif peut coûter une relation client ou une opportunité commerciale. Les coûts ne sont pas symétriques.

Donc le F1-score peut t’aider à comparer, mais il ne doit pas remplacer une analyse de coût métier.

❌ **Erreur fréquente**  
Choisir le modèle qui a le meilleur F1-score sans analyser le coût des erreurs.

✅ **Bonne approche**  
Comparer precision, recall, AUC, calibration, stabilité et coût métier par seuil.

---

## 6. AUC : utile pour classer, insuffisante pour décider

L’AUC mesure la capacité du modèle à mieux classer les dossiers risqués que les dossiers sains. Scikit-learn décrit le ROC AUC comme l’aire sous la courbe ROC calculée à partir des scores de prédiction [5].

Une bonne AUC indique que le modèle ordonne plutôt bien les dossiers selon le risque. C’est utile.

Mais l’AUC ne te dit pas directement :

- quel seuil utiliser ;
- combien de dossiers seront acceptés ;
- combien partiront en revue humaine ;
- combien de bons clients seront refusés ;
- combien de dossiers risqués passeront ;
- si les probabilités sont bien calibrées.

Donc, ne vends jamais un modèle de scoring à un comité avec une AUC seule. Utilise l’AUC comme indicateur de classement, puis passe à la décision métier.

---

## 7. Le seuil de décision est une politique, pas une formule magique

Un modèle peut produire une probabilité de défaut. Par exemple : 7 %, 18 %, 35 %.

Mais la décision vient du seuil. Tu peux décider :

| Score de risque | Décision possible |
|---:|---|
| 0 % à 10 % | Acceptation possible |
| 10 % à 25 % | Revue humaine |
| Plus de 25 % | Refus ou demande de garanties |

Ces seuils ne viennent pas seulement des mathématiques. Ils viennent de la politique de risque, du produit, de la marge, du coût du défaut, de la stratégie commerciale, des contraintes de conformité et de la capacité des équipes à traiter les dossiers en revue humaine.

Un seuil trop strict protège contre le défaut, mais il peut refuser trop de clients solvables. Un seuil trop souple soutient la croissance commerciale, mais il peut augmenter le risque de pertes.

Ta mission n’est pas de trouver “le seuil parfait”. Ta mission est de proposer un seuil défendable.

---

## 8. Calibration : quand 20 % doit vouloir dire 20 %

Un modèle de scoring ne doit pas seulement classer les dossiers. Il doit aussi produire des probabilités crédibles.

Si le modèle dit que 1 000 dossiers ont un risque de défaut autour de 20 %, tu t’attends à ce qu’environ 200 dossiers posent problème dans ce groupe. Si seulement 50 ou 450 posent problème, la probabilité est mal calibrée.

Scikit-learn présente les courbes de calibration comme un moyen de comparer les probabilités prédites avec les fréquences observées [7].

Pourquoi c’est important ? Parce que les seuils, les provisions, les revues humaines et les arbitrages métier dépendent du niveau de risque annoncé.

Un modèle peut avoir une bonne AUC et une mauvaise calibration. Il classe bien, mais il donne de mauvaises probabilités. Dans le crédit, c’est dangereux.

---

## 9. Relie les métriques au coût métier

Voici une façon simple de passer des métriques au métier.

| Question | Métrique utile | Lecture métier |
|---|---|---|
| Le modèle classe-t-il bien les dossiers ? | AUC | Qualité générale du classement |
| Les alertes risque sont-elles fiables ? | Precision | Charge inutile et clients bloqués |
| Détecte-t-on assez de dossiers risqués ? | Recall | Risque de pertes futures |
| Les probabilités sont-elles crédibles ? | Calibration | Décision par seuil et pilotage du risque |
| Le seuil est-il acceptable ? | Matrice par seuil | Arbitrage risque, revenu et revue humaine |

Dans un comité, ne dis pas seulement : “Le modèle a une AUC de 0,86.”

Dis plutôt : “Avec ce seuil, 18 % des dossiers partent en revue humaine. Le modèle détecte 72 % des dossiers risqués. Il bloque 9 % de dossiers finalement sains. La calibration reste acceptable sur les segments principaux, mais le segment jeunes actifs doit être surveillé.”

Là, tu parles le langage du risque.

---

## 10. Mini-cas : deux modèles, un choix métier

Tu compares deux modèles pour un crédit consommation.

| Indicateur | Modèle A | Modèle B |
|---|---:|---:|
| AUC | 0,84 | 0,88 |
| Precision | 0,62 | 0,48 |
| Recall | 0,58 | 0,76 |
| Dossiers en revue humaine | 12 % | 28 % |
| Calibration | Bonne | Moyenne |

Le modèle B a la meilleure AUC et détecte plus de dossiers risqués. Mais il génère plus de revue humaine, plus de faux positifs et une calibration moins bonne.

Le bon choix dépend du contexte.

- Si la banque vient de subir une hausse des défauts, le modèle B peut être utile en pilote renforcé.
- Si la banque veut accélérer l’octroi et réduire la charge opérationnelle, le modèle A peut être plus réaliste.
- Si le modèle B est retenu, il faut corriger la calibration, analyser les faux positifs et vérifier la capacité des équipes à traiter les dossiers.

Tu vois le point : **le meilleur modèle statistique n’est pas toujours le meilleur modèle opérationnel.**

---

## 11. Ce que tu dois retenir

Retiens ces règles.

1. L’accuracy seule peut tromper, surtout si les défauts sont rares.
2. La precision mesure la fiabilité des alertes risque.
3. Le recall mesure la capacité à détecter les dossiers risqués.
4. L’AUC mesure la qualité du classement, pas la décision finale.
5. Le seuil de décision est un choix métier.
6. La calibration est indispensable si tu utilises des probabilités.
7. Le comité risque a besoin d’un scénario de décision, pas d’une métrique isolée.

Dans le cadre européen, l’usage de l’IA pour évaluer la solvabilité ou établir un score de crédit pour des personnes physiques est traité comme un usage à haut risque [8]. Même si tu travailles dans le contexte tunisien, retiens l’esprit : un scoring crédit doit être mesuré, documenté, contrôlé et expliqué.

---

## Checkpoint Ella

**Ella :**  
Tu présentes un modèle de scoring crédit à un comité risque. Le modèle a une AUC de 0,89. Un participant dit : “C’est excellent, on peut valider.”

Réponds en 8 à 10 lignes. Explique pourquoi l’AUC seule ne suffit pas. Mentionne au moins trois éléments à vérifier avant validation.

**Mode :** `free`

### ella_system_hint

```text
Evaluate whether the learner understands that AUC alone is insufficient for credit scoring validation. A strong answer should mention threshold choice, confusion matrix, precision, recall, false positives, false negatives, cost of errors, calibration, segment-level performance, human review capacity, documentation, and risk/compliance approval. Accept simple wording if the learner connects metrics to business and regulatory consequences. Praise answers that distinguish ranking quality from operational decision quality. Correct answers that say “high AUC means deploy” or that ignore threshold and calibration. Do not provide the full answer directly. Ask one Socratic follow-up if the answer misses business cost, compliance, or human oversight.
```

---

## Références

[1] Banque Centrale de Tunisie. *Circulaire aux banques et aux établissements financiers n°2021-05 du 19 août 2021 relative au cadre de gouvernance des banques et des établissements financiers*.  
https://www.cbf.org.tn/wp-content/uploads/2023/01/05-Circulaire-aux-banques-et-aux-etablissements-financiers-n%C2%B02021-05-du-19-Aout-2021.pdf

[2] Banque Centrale de Tunisie. *Circulaire aux banques et aux établissements financiers n°2022-01 du 1er mars 2022 relative à la prévention et la résolution des créances non performantes*.  
https://www.cbf.org.tn/wp-content/uploads/2023/01/01-Circulaire-aux-banques-et-aux-etablissements-financiers-n%C2%B02022-01-du-01-Mars-2022.pdf

[3] Basel Committee on Banking Supervision. *Principles for the Management of Credit Risk*. Bank for International Settlements, 2000.  
https://www.bis.org/publ/bcbs75.pdf

[4] Basel Committee on Banking Supervision. *2025 Principles for the management of credit risk*. Bank for International Settlements, 2025.  
https://www.bis.org/bcbs/publ/d595.pdf

[5] scikit-learn. *roc_auc_score — Compute Area Under the Receiver Operating Characteristic Curve*.  
https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_auc_score.html

[6] scikit-learn. *precision_recall_fscore_support — Precision, recall, F-measure and support*.  
https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_fscore_support.html

[7] scikit-learn. *calibration_curve — Probability calibration curves*.  
https://scikit-learn.org/stable/modules/generated/sklearn.calibration.calibration_curve.html

[8] European Commission. *AI Act — Regulatory framework for artificial intelligence*.  
https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
