---
course_id: ella_industry_ai_finance_banking
course_slug: ai-finance-banking
pathway: industry
level: advanced
module_id: 01_credit_scoring_risk
lesson_id: 02_credit_scoring_data
language: fr
title: "Leçon 2 — Les données du scoring crédit"
estimated_duration_minutes: 35
version: 1.0
encoding: UTF-8
---

# Leçon 2 — Les données du scoring crédit

## Objectif de la leçon

Dans un modèle de scoring crédit, les données font une grande partie du travail. Avant de parler d’algorithme, tu dois savoir quelles données tu utilises, pourquoi tu les utilises, et quel risque elles créent.

À la fin de cette leçon, tu seras capable de :

1. identifier les grandes familles de données utilisées dans un score crédit ;
2. distinguer une variable utile d’une variable dangereuse ;
3. repérer les problèmes de qualité, de biais et de conformité ;
4. préparer une première fiche de données pour un projet de scoring.

---

## 1. Le modèle apprend ce que les données lui montrent

Un modèle de scoring crédit ne “comprend” pas un client comme un chargé d’affaires. Il apprend des relations statistiques à partir d’exemples passés.

Si les données passées sont propres, pertinentes et bien contrôlées, le modèle peut aider à mieux estimer le risque. Si les données sont incomplètes, biaisées ou mal définies, le modèle peut amplifier les erreurs existantes.

Garde cette règle simple : **un modèle de scoring ne répare pas une mauvaise donnée. Il l’exploite.**

❌ **Erreur fréquente**  
Penser que XGBoost, un réseau de neurones ou un grand modèle IA corrigera automatiquement les défauts du dataset.

✅ **Bonne approche**  
Commencer par auditer les données : source, fraîcheur, qualité, autorisation d’usage, sens métier, risques de biais et traçabilité.

---

## 2. Les principales familles de données

Dans un projet de scoring crédit, tu peux rencontrer plusieurs familles de données.

### Données d’identification et KYC

Elles permettent de connaître le client : type de client, situation professionnelle, secteur d’activité, ancienneté de la relation, statut du dossier, documents fournis.

Attention : ces données peuvent contenir des informations personnelles. En Tunisie, la loi organique n°2004-63 encadre la protection des données à caractère personnel. Elle reconnaît cette protection comme un droit fondamental.

### Données financières

Elles décrivent la capacité financière du client : revenus déclarés, chiffre d’affaires, charges, endettement, stabilité des flux, épargne, incidents de paiement, encours existants.

Ces données sont souvent très utiles. Mais elles doivent être définies avec précision. Par exemple, “revenu mensuel” ne veut pas dire la même chose pour un salarié, un commerçant, un freelance ou une entreprise.

### Données de comportement bancaire

Elles décrivent l’usage réel du compte : régularité des entrées, fréquence des découverts, rejets de paiement, solde moyen, saisonnalité, évolution des flux.

Ces signaux peuvent être puissants. Mais ils doivent rester interprétables. Un comportement atypique n’est pas toujours un mauvais comportement. Un commerçant, un agriculteur et un salarié n’ont pas le même rythme financier.

### Données de crédit passées

Elles concernent l’historique de remboursement : retards, restructurations, défauts, régularisations, garanties activées, ancienneté des engagements.

Elles sont centrales pour le risque crédit. La circulaire BCT n°2022-01 insiste sur la prévention et la résolution des créances non performantes, avec des dispositifs d’alerte précoce et de traitement proactif.

### Données de garanties

Elles décrivent la couverture du risque : caution, hypothèque, nantissement, garantie institutionnelle, valeur estimée, qualité juridique et liquidité.

Ne confonds pas garantie et capacité de remboursement. Une garantie réduit la perte potentielle, mais elle ne transforme pas automatiquement un mauvais dossier en bon risque.

---

## 3. Toutes les variables utiles ne sont pas acceptables

Une variable peut être prédictive et poser problème.

Imagine qu’un modèle découvre qu’un quartier, une profession ou un type d’appareil mobile prédit fortement le risque. Faut-il utiliser cette variable ? Pas automatiquement.

Tu dois poser trois questions :

1. **La variable est-elle légitime pour la décision ?**
2. **La variable risque-t-elle de produire une discrimination indirecte ?**
3. **La variable peut-elle être expliquée au client, au comité risque et à l’audit ?**

Dans l’Union européenne, l’AI Act classe les systèmes utilisés pour évaluer la solvabilité ou établir le score de crédit de personnes physiques comme systèmes à haut risque. Même si ton contexte est tunisien, cette logique est utile : le scoring crédit touche l’accès aux ressources financières et doit être traité avec prudence.

---

## 4. La qualité des données doit être mesurée

Ne dis jamais : “les données sont bonnes”. Prouve-le.

Pour un dataset de scoring, vérifie au minimum :

| Contrôle | Question à poser |
|---|---|
| Complétude | Combien de valeurs sont manquantes ? |
| Fraîcheur | Les données sont-elles récentes ? |
| Cohérence | Les revenus, charges et encours sont-ils compatibles ? |
| Stabilité | Les variables gardent-elles le même sens dans le temps ? |
| Traçabilité | Sait-on d’où vient chaque donnée ? |
| Autorisation d’usage | A-t-on le droit d’utiliser cette donnée pour ce cas ? |
| Sens métier | La variable a-t-elle une logique financière compréhensible ? |

Un bon modèle commence par cette discipline. Le Basel Committee rappelle que la gestion du risque crédit repose sur un environnement adapté, un processus sain d’octroi, une mesure et un suivi du risque, et des contrôles suffisants.

---

## 5. Mini-cas : dossier de crédit personnel

Voici un exemple simple.

Un client demande un crédit personnel. Tu as les données suivantes :

| Variable | Exemple | Commentaire |
|---|---:|---|
| Revenu mensuel net | 2 400 DT | Utile, mais à vérifier |
| Ancienneté professionnelle | 18 mois | Utile pour stabilité |
| Charges mensuelles | 1 100 DT | Utile pour capacité restante |
| Incidents de paiement 12 mois | 2 | Signal de risque |
| Solde moyen 6 mois | 350 DT | Signal de liquidité |
| Canal de demande | Mobile app | À utiliser avec prudence |
| Gouvernorat | Tunis | Variable sensible si elle sert de proxy social |
| Type de téléphone | Modèle récent | Risque de variable proxy, faible légitimité |

Ta mission de praticien n’est pas de tout jeter dans un modèle. Ta mission est de sélectionner les variables qui ont du sens, qui sont autorisées, qui sont explicables et qui servent réellement l’analyse du risque.

❌ **Mauvaise pratique**  
Utiliser toutes les variables disponibles parce qu’elles améliorent l’AUC.

✅ **Bonne pratique**  
Construire une liste de variables candidates, justifier leur usage, supprimer les variables faibles ou dangereuses, puis documenter les choix.

---

## 6. Ce que tu dois retenir

Avant de construire un modèle de scoring, commence par les données.

Pose-toi toujours ces cinq questions :

1. **D’où vient la donnée ?**
2. **A-t-on le droit de l’utiliser ?**
3. **Que veut-elle dire métier ?**
4. **Peut-elle créer un biais ou une exclusion injustifiée ?**
5. **Peut-on expliquer son rôle dans la décision ?**

Si tu ne peux pas répondre, la variable n’est pas prête pour un modèle de scoring crédit.

---

## Checkpoint Ella

**Ella :**  
Tu prépares un modèle de scoring crédit pour une banque. L’équipe propose d’utiliser les variables suivantes : revenu mensuel, ancienneté professionnelle, incidents de paiement, type de téléphone, gouvernorat, solde moyen, et historique de remboursement.

Classe ces variables en trois groupes :

1. **variables généralement pertinentes** ;
2. **variables à utiliser avec prudence** ;
3. **variables à éviter ou à fortement justifier**.

Explique ton raisonnement en 8 à 10 lignes.

**Mode :** `free`

### ella_system_hint

```text
Evaluate whether the learner can distinguish predictive usefulness from acceptability, explainability, and compliance. A strong answer should place income, employment stability, payment incidents, average balance, and repayment history as generally relevant, while still noting that they must be verified and documented. The learner should treat governorate with caution because it can act as a socioeconomic proxy. The learner should treat phone type as weakly legitimate or risky unless a clear, lawful, and explainable business rationale exists. Praise answers that mention data quality, authorization of use, bias, explainability, and human review. Correct answers that simply say “use all variables that improve accuracy.” Do not provide the full solution directly; guide the learner with one Socratic question when needed.
```

---

## Références

1. Banque Centrale de Tunisie, **Circulaire aux banques et aux établissements financiers n°2021-05 du 19 août 2021 — Cadre de gouvernance des banques et des établissements financiers**.  
   https://www.cbf.org.tn/wp-content/uploads/2023/01/05-Circulaire-aux-banques-et-aux-etablissements-financiers-n%C2%B02021-05-du-19-Aout-2021.pdf

2. Banque Centrale de Tunisie, **Circulaire aux banques et aux établissements financiers n°2022-01 du 1er mars 2022 — Prévention et résolution des créances non performantes**.  
   https://www.cbf.org.tn/wp-content/uploads/2023/01/01-Circulaire-aux-banques-et-aux-etablissements-financiers-n%C2%B02022-01-du-01-Mars-2022.pdf

3. République Tunisienne, **Loi organique n°2004-63 du 27 juillet 2004 portant sur la protection des données à caractère personnel**.  
   https://www.ins.tn/sites/default/files/2020-04/Loi%2063-2004%20Fr.pdf

4. Basel Committee on Banking Supervision, **Principles for the management of credit risk**, Bank for International Settlements, 2025.  
   https://www.bis.org/bcbs/publ/d595.pdf

5. NIST, **Artificial Intelligence Risk Management Framework (AI RMF 1.0)**, 2023.  
   https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf

6. European Banking Authority, **AI Act: implications for the EU banking and payments sector**, 2025.  
   https://www.eba.europa.eu/sites/default/files/2025-11/d8b999ce-a1d9-4964-9606-971bbc2aaf89/AI%20Act%20implications%20for%20the%20EU%20banking%20sector.pdf
