---
course_id: ella_industry_ai_finance_banking
course_slug: ai-finance-banking
pathway: industry
level: advanced
module_id: 01_credit_scoring_risk
lesson_id: 03_credit_scoring_models
language: en
title: "Lesson 3 — Choosing the Right Credit Scoring Model"
estimated_duration_minutes: 40
version: 1.0
encoding: UTF-8
---

# Lesson 3 — Choosing the Right Credit Scoring Model

## Lesson objective

You have seen that data does a large part of the work. Now you need to choose the model.

Keep one simple reflex: **do not look for the most impressive model. Look for the model that is useful, controllable, and defensible for credit decision-making.**

By the end of this lesson, you will be able to:

1. distinguish the main model families used in credit scoring;
2. choose between a simple model, a tree-based model, and a more complex model;
3. understand why a probability must be calibrated;
4. prepare a model-choice justification for a risk or compliance team.

---

## 1. The model does not decide for you

A credit scoring model estimates a level of risk. It should not replace the whole decision.

In a financial environment, a credit decision affects the customer, the institution, default risk, the commercial relationship, and compliance. That is why the model must be connected to a credit policy, thresholds, human review, and a control framework.

BCT Circular No. 2021-05 stresses governance, risk culture, and control mechanisms for banks and financial institutions [1]. The Basel Committee also states that credit risk management should rely on sound credit-granting, risk measurement, monitoring, and control processes [3].

❌ **Common mistake**  
Saying: “The model returned 0.82, so the credit request is rejected.”

✅ **Better approach**  
Saying: “The model estimates high risk. We need to review the explanatory factors, the decision threshold, collateral, internal rules, and the possible need for human review.”

---

## 2. The baseline model: logistic regression

Logistic regression remains a strong starting point for credit scoring.

It estimates the probability of belonging to a class. In our case, the class may be “default”, “significant delay”, or “high risk”. Libraries such as scikit-learn provide a regularized version by default, which helps limit some overfitting issues [6].

Its main advantage is readability. You can explain that a variable increases or decreases risk, all else equal. This is useful for risk, audit, and compliance teams.

But it has a limit: it may capture complex relationships poorly if the variables are not prepared with care.

**When should you use it?**

| Situation | Why it fits |
|---|---|
| First prototype | It gives a clear baseline. |
| Strong explainability need | Coefficients are easier to discuss. |
| Moderate dataset | It works well with clean structured data. |
| Strict risk committee | It is easier to defend than an opaque model. |

---

## 3. Decision trees: easy to read, sometimes unstable

A decision tree splits the population into segments. For example: income below a threshold, recent incidents, low employment stability, low average balance.

It is intuitive. You can show a decision path. But a single tree can be unstable: a small change in the data can change the structure of the tree.

Use it often as a teaching or exploratory tool. For serious production, teams often prefer tree ensembles, which are better controlled and better evaluated.

❌ **Common mistake**  
Believing that a readable tree is automatically reliable.

✅ **Better approach**  
Test its stability, verify its out-of-sample performance, and compare it with a simple baseline.

---

## 4. Random Forest and Gradient Boosting: more powerful, more demanding

Tree ensemble models can capture interactions between variables more effectively.

A **Random Forest** combines many trees. It often reduces the instability of a single tree.

**Gradient Boosting** builds trees sequentially. Each new tree corrects part of the previous errors. Scikit-learn describes Gradient Boosting as an additive model built in a forward stage-wise manner to optimize a differentiable loss function [7].

These models can perform well in scoring. But their use requires more discipline: validation, explainability, calibration, documentation, monitoring, and drift control.

In finance, the question is not: “Which model gives the best AUC?”  
The real question is: **“Which model gives sufficient performance with an acceptable level of explainability, stability, and governance?”**

---

## 5. The complex-model trap

A complex model can improve technical results. It can also create three problems.

### Problem 1 — It is harder to explain

If the risk team does not understand why the model classifies an application as risky, the decision becomes harder to defend.

### Problem 2 — It can capture dangerous signals

A powerful model can use proxy variables: geographic area, digital channel, device type, atypical behavior. These signals may be predictive but may raise fairness and acceptability issues.

### Problem 3 — It can be harder to monitor

A model that performs well at launch can degrade if customer profiles, the economy, products, or internal policies change.

The NIST AI RMF gives a useful logic here: govern, map risks, measure them, and manage them across the AI system lifecycle [4].

---

## 6. A probability is not always a good probability

In credit scoring, the model often produces a score or an estimated probability.

But be careful: a predicted probability is not always well calibrated. If a model assigns 20% risk to 1,000 applications, you expect about 200 applications in that group to actually become problematic. If this is not the case, the model is poorly calibrated.

Calibration matters because decision thresholds depend on risk levels. Scikit-learn notes that, in classification, you may want a probability associated with the prediction, but some models give poor probability estimates and need calibration [8].

**Simple example**

| Application | Estimated default probability | Possible decision |
|---|---:|---|
| A | 3% | Possible approval |
| B | 18% | Human review |
| C | 42% | Rejection or request for collateral |

The threshold is not a mathematical truth. It is a business choice. It depends on the risk policy, product, customer segment, cost of default, cost of unfair rejection, and internal requirements.

---

## 7. How to choose your model in practice

Use this sequence.

### Step 1 — Build a simple baseline

Start with logistic regression or a simple tree. You get a comparison point.

### Step 2 — Test a more powerful model

Try Random Forest or Gradient Boosting. Compare performance, but also check stability, explainability, and calibration.

### Step 3 — Compare with business criteria

Do not compare AUC only. Ask: how many good customers are rejected? How many risky files pass? How many applications go to human review?

### Step 4 — Document the choice

Explain why you keep this model. Explain why you reject the others.

### Step 5 — Plan monitoring

A scoring model must be monitored: performance, data drift, score drift, default-rate evolution, variable stability, and business alerts.

---

## 8. Mini-case: choosing a model for a consumer loan

You work in a bank. The team wants to launch a scoring model for a consumer loan.

You have:

| Element | Situation |
|---|---|
| Dataset | 25,000 past applications |
| Variables | income, expenses, incidents, employment stability, repayment history, average balance |
| Objective | estimate 12-month default risk |
| Constraints | strict risk committee, need for customer explanation, possible human review |
| Project timeline | 8 weeks for a pilot |

A reasonable choice:

1. build a logistic regression baseline;
2. test Gradient Boosting for comparison;
3. check metrics, calibration, and explanations;
4. propose an approval threshold, a rejection threshold, and a human-review zone;
5. document limitations before any production launch.

You see the idea: you do not choose a model because it is “more AI”. You choose a model because it fits a complete decision framework.

---

## 9. What you should remember

For credit scoring, remember this:

1. **A simple, well-controlled model is better than a complex model with weak governance.**
2. **Technical performance is not enough.**
3. **The probability must be understood, calibrated, and linked to a business threshold.**
4. **Every model choice must be documented.**
5. **The model must be monitored after deployment.**

In the European Union, AI systems used to evaluate the creditworthiness of natural persons or establish their credit score are classified as high-risk systems, with specific exceptions such as some financial-fraud detection uses [5]. Even if your local context is Tunisia, this classification gives you a useful benchmark: credit scoring is not a lightweight experimentation field.

---

## Ella checkpoint

**Ella:**  
Your team wants to use a Gradient Boosting model directly for credit scoring because it gives the best AUC on the test set. The risk manager asks you: “Why not put it into production right now?”

Write a short answer, in 8 to 10 lines. Explain why the best AUC is not enough and which controls must be performed before making a decision.

**Mode:** `free`

### ella_system_hint

```text
Evaluate whether the learner understands that model selection in credit scoring cannot rely only on AUC or predictive performance. A strong answer should mention explainability, calibration, threshold policy, data quality, bias or proxy variables, validation on out-of-sample data, human review, documentation, monitoring, and risk/compliance approval. Accept simple wording if the reasoning is sound. Praise answers that connect model choice to banking governance and credit risk controls. Correct answers that say “deploy it because it performs best” or focus only on technical accuracy. Do not provide the full answer directly; ask one Socratic follow-up if the response misses risk, compliance, or calibration.
```

---

## References

1. Banque Centrale de Tunisie, **Circular to banks and financial institutions No. 2021-05 of 19 August 2021 — Governance framework for banks and financial institutions**.  
   https://www.cbf.org.tn/wp-content/uploads/2023/01/05-Circulaire-aux-banques-et-aux-etablissements-financiers-n%C2%B02021-05-du-19-Aout-2021.pdf

2. Banque Centrale de Tunisie, **Circular to banks and financial institutions No. 2022-01 of 1 March 2022 — Prevention and resolution of non-performing loans**.  
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
