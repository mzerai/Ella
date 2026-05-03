---
course_id: ella_industry_ai_finance_banking
course_title: Intelligence artificielle appliquée aux services financiers
pathway: Industry
module_id: 01_credit_scoring_risk
module_title: IA pour le scoring crédit et l'analyse de risque
lesson_id: 01_credit_scoring_intro
lesson_title: Du scoring traditionnel au scoring augmenté par l'IA
language: fr
level: avancé
estimated_duration_self_paced: 35-45 min
checkpoint_mode: free
references_included: true
encoding: UTF-8
---

# Leçon 1 — Du scoring traditionnel au scoring augmenté par l'IA

## Ce que tu vas maîtriser dans cette leçon

À la fin de cette leçon, tu dois pouvoir expliquer ce qu'un modèle de scoring crédit apporte, ce qu'il ne doit jamais décider seul, et pourquoi le risque crédit reste un sujet de gouvernance avant d'être un sujet technique.

Tu vas apprendre à distinguer trois choses :

1. **le score**, qui estime un niveau de risque ;
2. **la décision**, qui applique une politique crédit ;
3. **le contrôle**, qui vérifie que le système reste fiable, explicable et conforme.

Garde cette idée en tête : dans la finance, un modèle peut aider à décider. Il ne remplace pas la responsabilité de l'institution.

---

## 1. Pourquoi le scoring crédit existe

Une banque ou une institution financière accorde du crédit sous incertitude. Elle ne sait jamais avec certitude si un client remboursera demain. Elle observe donc des signaux : revenus, stabilité professionnelle, historique de remboursement, incidents, garanties, endettement, ancienneté de la relation et comportement bancaire.

Le scoring crédit sert à transformer ces signaux en estimation structurée du risque. Il permet de comparer des dossiers, d'accélérer certaines décisions et de mieux prioriser les dossiers qui demandent une revue humaine.

Mais attention : un score n'est pas une vérité. C'est une estimation produite à partir de données passées. Si les données sont incomplètes, biaisées ou mal interprétées, le score peut donner une impression de rigueur alors qu'il cache un risque réel.

**À retenir**  
Un score crédit ne dit pas : “ce client va faire défaut”. Il dit plutôt : “dans les données et selon ce modèle, ce profil présente un niveau de risque estimé”.

---

## 2. Le scoring traditionnel : clair, mais parfois limité

Le scoring traditionnel repose souvent sur des règles ou des modèles statistiques simples. Par exemple :

```text
Si le taux d'endettement dépasse 40 %, alors le dossier passe en revue renforcée.
Si le client a plusieurs incidents récents, alors le score de risque augmente.
Si le revenu est stable et documenté, alors le risque estimé baisse.
```

Cette approche a un avantage : elle est lisible. Un analyste crédit peut expliquer pourquoi le dossier est accepté, refusé ou envoyé en revue.

Mais elle a aussi des limites. Elle peut manquer des relations plus complexes entre les variables. Elle peut traiter deux profils différents comme s'ils étaient identiques. Elle peut aussi devenir rigide si les comportements des clients changent.

Le scoring traditionnel reste utile. L'IA ne l'efface pas. Elle l'étend.

---

## 3. Ce que l'IA change

Avec l'IA, le modèle apprend à partir d'un historique de dossiers. Il cherche des relations entre les caractéristiques d'un client et les résultats observés : remboursement normal, retard, restructuration, défaut, contentieux.

Un modèle de Machine Learning peut détecter des combinaisons que des règles simples captent mal. Par exemple, un même niveau d'endettement peut avoir un sens différent selon la stabilité du revenu, l'ancienneté bancaire, la structure des charges et l'historique de remboursement.

Dans un contexte bancaire, les modèles fréquents incluent la régression logistique, les arbres de décision, les random forests, le gradient boosting et XGBoost. Le choix dépend du besoin : simplicité, performance, explicabilité, robustesse, disponibilité des données et exigences de contrôle.

Mais tu dois rester lucide. Plus le modèle est complexe, plus tu dois renforcer l'explicabilité, la validation et le suivi.

---

## 4. Le bon schéma mental

Ne pense pas :

```text
Données → Modèle → Décision automatique
```

Pense plutôt :

```text
Données → Modèle → Score → Politique crédit → Décision → Suivi → Révision
```

Le modèle produit un score. La politique crédit définit les seuils, les règles de revue, les exceptions et les niveaux d'escalade. Le suivi vérifie si le modèle reste fiable dans le temps.

C'est ce suivi qui protège l'institution. Un modèle peut bien fonctionner pendant quelques mois, puis perdre en qualité si le marché change, si les profils clients évoluent ou si les données d'entrée changent.

Dans le langage du risque, on parle souvent de **dérive**. La dérive apparaît quand la relation entre les données et le risque réel change. Elle peut venir d'un choc économique, d'une nouvelle politique commerciale, d'un changement de clientèle ou d'une modification dans la collecte des données.

---

## 5. Pourquoi le crédit est sensible

Le scoring crédit touche directement les clients. Il peut influencer l'accès au financement, le taux proposé, la limite accordée, le besoin de garantie ou l'envoi du dossier vers une revue humaine.

C'est pour cela que le scoring IA ne peut pas être traité comme une simple optimisation. Il soulève des questions de justice, d'explicabilité, de protection des données et de contrôle humain.

Dans le contexte européen, les systèmes d'IA utilisés pour évaluer la solvabilité ou établir un score de crédit pour des personnes physiques sont classés comme systèmes à haut risque par l'AI Act. Cette référence est utile pour comprendre la tendance internationale, même si le cours se place dans un contexte tunisien.

Dans le contexte tunisien, la logique de gouvernance bancaire est déjà centrale. La circulaire BCT n°2021-05 pose un cadre de gouvernance pour les banques et établissements financiers. La circulaire BCT n°2022-01 traite la prévention et la résolution des créances non performantes. Cela rend le scoring IA directement lié à la gouvernance, au risque et au contrôle interne.

---

## 6. Exemple rapide : mauvais usage et bon usage

❌ **Erreur fréquente**  
“Le modèle donne 91 % de précision, donc on peut automatiser les décisions de crédit.”

Pourquoi c'est dangereux :

- la précision globale peut masquer de mauvais résultats sur certains profils ;
- les faux refus peuvent exclure des clients solvables ;
- les faux accords peuvent augmenter les créances à risque ;
- le modèle peut être difficile à expliquer ;
- les données utilisées peuvent contenir des biais.

✅ **Bonne approche**  
“Le modèle aide à produire un score de risque. La décision finale suit une politique crédit documentée, avec seuils, explication, revue humaine pour les cas sensibles et suivi de performance dans le temps.”

Ici, le modèle reste utile. Mais il est placé dans un système de décision contrôlé.

---

## 7. Mini-cas pour te préparer au lab

Imagine une banque qui veut accélérer le traitement des demandes de crédit à la consommation.

Elle dispose de données historiques : âge, revenu, situation professionnelle, ancienneté client, incidents de paiement, montant demandé, durée du crédit, taux d'endettement et résultat final du dossier.

Elle veut entraîner un modèle qui classe les dossiers en trois zones :

| Zone | Interprétation | Action recommandée |
|---|---|---|
| Risque faible | Le dossier ressemble à des profils historiquement bien remboursés | Traitement accéléré possible |
| Risque moyen | Le dossier contient des signaux mixtes | Revue humaine obligatoire |
| Risque élevé | Le dossier présente plusieurs signaux de défaut | Revue renforcée ou refus motivé |

La bonne question n'est pas : “Quel modèle donne le meilleur score ?”  
La bonne question est : “Quel système de décision réduit le risque sans créer d'injustice, d'opacité ou de non-conformité ?”

---

## Ce que tu dois retenir

- Le scoring crédit estime un risque. Il ne remplace pas la politique crédit.
- L'IA peut améliorer la détection de profils complexes, mais elle augmente le besoin d'explicabilité.
- Un score doit être relié à une décision, une justification et un mécanisme de contrôle.
- Dans la finance, la performance seule ne suffit pas. Le modèle doit être contrôlé, documenté et suivi.
- Le contexte tunisien exige de penser le scoring IA avec gouvernance, gestion des risques, conformité et protection des données.

---

## Checkpoint Ella

**Ella :**  
Explique avec tes mots la différence entre **un score crédit**, **une décision crédit** et **un contrôle de risque**.

Réponds en 6 à 10 lignes. Utilise un exemple simple si tu veux.

**Mode :** `free`

**Ce que j'attends de toi :**

Je veux voir que tu ne confonds pas le modèle avec la décision. Un bon raisonnement doit montrer que le modèle produit une estimation, que la politique crédit transforme cette estimation en action, et que le contrôle vérifie la qualité, la conformité et les effets du système.

**ella_system_hint :**

```text
Evaluate whether the learner distinguishes between credit score, credit decision, and risk control. A strong answer should explain that the score is an estimated risk level, the decision applies credit policy and thresholds, and risk control checks explainability, compliance, bias, drift, and human oversight. Accept practical examples. Praise clear separation between model output and institutional responsibility. Correct answers that present the model score as the final decision. Do not provide the full answer directly. Ask one focused follow-up question if the learner misses one of the three elements.
```

---

## Références

[R1] Banque Centrale de Tunisie / Conseil Bancaire et Financier. **Circulaire aux banques et aux établissements financiers n°2021-05 du 19 août 2021 — Cadre de gouvernance des banques et des établissements financiers.**  
https://www.cbf.org.tn/wp-content/uploads/2023/01/05-Circulaire-aux-banques-et-aux-etablissements-financiers-n%C2%B02021-05-du-19-Aout-2021.pdf

[R2] Banque Centrale de Tunisie / Conseil Bancaire et Financier. **Circulaire aux banques et aux établissements financiers n°2022-01 du 1er mars 2022 — Prévention et résolution des créances non performantes.**  
https://www.cbf.org.tn/wp-content/uploads/2023/01/01-Circulaire-aux-banques-et-aux-etablissements-financiers-n%C2%B02022-01-du-01-Mars-2022.pdf

[R3] Basel Committee on Banking Supervision. **Principles for the Management of Credit Risk.** Bank for International Settlements, 2000.  
https://www.bis.org/publ/bcbs75.pdf

[R4] NIST. **Artificial Intelligence Risk Management Framework — AI RMF 1.0.** 2023.  
https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf

[R5] European Union. **AI Act — Annex III, High-risk AI systems, creditworthiness and credit scoring.**  
https://artificialintelligenceact.eu/annex/3/
