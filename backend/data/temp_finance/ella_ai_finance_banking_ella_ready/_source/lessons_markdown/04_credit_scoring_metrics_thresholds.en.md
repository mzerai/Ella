---
course_id: ella_industry_ai_finance_banking
course_slug: ai-finance-banking
pathway: industry
level: advanced
module_id: 01_credit_scoring_risk
lesson_id: 04_credit_scoring_metrics_thresholds
language: en
title: "Lesson 4 — Evaluating a Credit Scoring Model: Metrics, Thresholds, and Business Cost"
estimated_duration_minutes: 45
version: 1.0
encoding: UTF-8
---

# Lesson 4 — Evaluating a Credit Scoring Model: Metrics, Thresholds, and Business Cost

## Lesson objective

You have selected a model. Now you need to evaluate it.

Do not let one metric impress you. In credit scoring, a model can look strong on paper and still create business risk. It can reject too many good customers, accept too many risky files, estimate probabilities poorly, or create alerts that teams cannot process.

By the end of this lesson, you will be able to:

1. read a confusion matrix in a credit-risk context;
2. distinguish accuracy, precision, recall, F1-score, and AUC;
3. understand why the decision threshold is a business choice;
4. connect model errors to financial, commercial, and regulatory cost;
5. explain why calibration matters in credit decisions.

---

## 1. Start with the business question

Before you look at the numbers, ask the right question: **which error costs more?**

In credit scoring, there are two major errors.

| Error | Example | Business risk |
|---|---|---|
| False positive | The model classifies a good customer as risky | Lost revenue, customer frustration, unfair exclusion |
| False negative | The model classifies a risky customer as acceptable | Future default, financial loss, higher non-performing loans |

The second error often looks more serious. But be careful: if you reject too many good customers, you also destroy value. You damage the customer relationship. You may create fairness risk if some profiles are rejected without a solid reason.

The Central Bank of Tunisia requires banks and financial institutions to have sound governance, internal control, and risk-management arrangements [1]. For non-performing loans, it also emphasizes prevention, early warning systems, and proactive risk treatment [2]. So your model must be evaluated as a risk-management tool, not as a pure statistics exercise.

❌ **Common mistake**  
Saying: “The model is good. Its accuracy is 92%.”

✅ **Better approach**  
Saying: “The model looks strong, but I need to check what errors it makes, on which profiles, with what business cost, and with which decision threshold.”

---

## 2. The confusion matrix: your first reflex

The confusion matrix compares the known truth with the model prediction.

In this case, imagine two classes:

- **0 = healthy file**;
- **1 = high-risk file or future default**.

| | Predicted healthy | Predicted risky |
|---|---:|---:|
| Actually healthy | True negative | False positive |
| Actually risky | False negative | True positive |

Read it like a risk manager.

- **True negative**: the customer is healthy and the model accepts the file.
- **True positive**: the customer is risky and the model detects it.
- **False positive**: the customer is healthy, but the model blocks the file.
- **False negative**: the customer is risky, but the model lets the file pass.

A false negative can create future losses. A false positive can create lost opportunities. You need to look at both.

---

## 3. Accuracy: useful, but often misleading

Accuracy measures the total share of correct predictions.

It is simple. It is easy to explain. But it can mislead you when classes are imbalanced.

Imagine 10,000 credit files. Only 500 become problematic. If a model predicts “healthy” for everyone, it already reaches 95% accuracy. Yet it detects none of the risky files.

In credit, negative events can be less frequent than healthy files. So accuracy is not enough.

**Practical rule**  
If one class is rare, never stop at accuracy.

---

## 4. Precision and recall: two different angles

**Precision** answers this question: among the files classified as risky by the model, how many are actually risky?

**Recall** answers this question: among all actually risky files, how many does the model detect?

Scikit-learn defines precision as `tp / (tp + fp)` and recall as `tp / (tp + fn)` [6]. The formula looks technical, but the business meaning is simple.

| Metric | Business question | If it is low |
|---|---|---|
| Precision | Are risk alerts reliable? | Too many good customers are blocked |
| Recall | Does the model detect enough risky files? | Too many risky files pass |

You cannot maximize both without trade-offs. If you lower the threshold to detect more risky files, you often increase false positives. If you raise the threshold to avoid blocking good customers, you may let more risky files pass.

This is where the business decision begins.

---

## 5. F1-score: useful, but not always enough for credit

The F1-score combines precision and recall. It can summarize performance when you want to balance both.

But in credit scoring, the two errors do not always have the same cost. A false negative can cost thousands of dinars. A false positive can cost a customer relationship or a commercial opportunity. The costs are not symmetric.

So the F1-score can help you compare models, but it must not replace a business-cost analysis.

❌ **Common mistake**  
Selecting the model with the best F1-score without analyzing error costs.

✅ **Better approach**  
Compare precision, recall, AUC, calibration, stability, and business cost by threshold.

---

## 6. AUC: useful for ranking, insufficient for decisions

AUC measures the model’s ability to rank risky files above healthy files. Scikit-learn describes ROC AUC as the area under the ROC curve computed from prediction scores [5].

A good AUC means the model ranks files reasonably well by risk. That is useful.

But AUC does not directly tell you:

- which threshold to use;
- how many files will be accepted;
- how many files will go to human review;
- how many good customers will be rejected;
- how many risky files will pass;
- whether probabilities are well calibrated.

So never sell a credit-scoring model to a committee with AUC alone. Use AUC as a ranking indicator, then move to the business decision.

---

## 7. The decision threshold is a policy, not a magic formula

A model can produce a default probability. For example: 7%, 18%, 35%.

But the decision comes from the threshold. You may decide:

| Risk score | Possible decision |
|---:|---|
| 0% to 10% | Possible approval |
| 10% to 25% | Human review |
| Above 25% | Rejection or additional guarantees |

These thresholds do not come from mathematics alone. They come from risk policy, product economics, margin, cost of default, commercial strategy, compliance constraints, and the capacity of teams to process files under human review.

A strict threshold protects against default, but it can reject too many solvent customers. A loose threshold supports commercial growth, but it can increase losses.

Your job is not to find “the perfect threshold.” Your job is to propose a defensible threshold.

---

## 8. Calibration: when 20% must mean 20%

A scoring model should not only rank files. It should also produce credible probabilities.

If the model says that 1,000 files have a default risk around 20%, you expect around 200 of them to become problematic. If only 50 or 450 become problematic, the probability is poorly calibrated.

Scikit-learn presents calibration curves as a way to compare predicted probabilities with observed frequencies [7].

Why does this matter? Because thresholds, provisions, human review, and business decisions depend on the announced risk level.

A model can have good AUC and poor calibration. It ranks well, but it gives poor probabilities. In credit, that is dangerous.

---

## 9. Connect metrics to business cost

Here is a simple way to move from metrics to business.

| Question | Useful metric | Business reading |
|---|---|---|
| Does the model rank files well? | AUC | General ranking quality |
| Are risk alerts reliable? | Precision | Unnecessary workload and blocked customers |
| Are enough risky files detected? | Recall | Future loss risk |
| Are probabilities credible? | Calibration | Threshold-based decision and risk steering |
| Is the threshold acceptable? | Matrix by threshold | Risk, revenue, and human-review trade-off |

In a committee, do not say only: “The model has an AUC of 0.86.”

Say instead: “At this threshold, 18% of files go to human review. The model detects 72% of risky files. It blocks 9% of files that later prove healthy. Calibration is acceptable on the main segments, but the young-professional segment must be monitored.”

Now you are speaking the language of risk.

---

## 10. Mini case: two models, one business decision

You compare two models for consumer credit.

| Indicator | Model A | Model B |
|---|---:|---:|
| AUC | 0.84 | 0.88 |
| Precision | 0.62 | 0.48 |
| Recall | 0.58 | 0.76 |
| Files under human review | 12% | 28% |
| Calibration | Good | Medium |

Model B has the better AUC and detects more risky files. But it generates more human review, more false positives, and weaker calibration.

The right choice depends on the context.

- If the bank has just seen defaults rise, Model B may be useful under a reinforced pilot.
- If the bank wants faster credit approval and lower operational workload, Model A may be more realistic.
- If Model B is selected, you must correct calibration, analyze false positives, and check whether teams can process the review queue.

Here is the point: **the best statistical model is not always the best operational model.**

---

## 11. What you must remember

Keep these rules.

1. Accuracy alone can mislead you, especially when defaults are rare.
2. Precision measures the reliability of risk alerts.
3. Recall measures the ability to detect risky files.
4. AUC measures ranking quality, not the final decision.
5. The decision threshold is a business choice.
6. Calibration is essential when you use probabilities.
7. The risk committee needs a decision scenario, not an isolated metric.

In the European framework, AI used to assess creditworthiness or establish credit scores for natural persons is treated as a high-risk use case [8]. Even if you work in Tunisia, keep the spirit: credit scoring must be measured, documented, controlled, and explained.

---

## Ella Checkpoint

**Ella:**  
You present a credit-scoring model to a risk committee. The model has an AUC of 0.89. One participant says: “That is excellent. We can approve it.”

Write an 8 to 10 line answer. Explain why AUC alone is not enough. Mention at least three elements to check before approval.

**Mode:** `free`

### ella_system_hint

```text
Evaluate whether the learner understands that AUC alone is insufficient for credit scoring validation. A strong answer should mention threshold choice, confusion matrix, precision, recall, false positives, false negatives, cost of errors, calibration, segment-level performance, human review capacity, documentation, and risk/compliance approval. Accept simple wording if the learner connects metrics to business and regulatory consequences. Praise answers that distinguish ranking quality from operational decision quality. Correct answers that say “high AUC means deploy” or that ignore threshold and calibration. Do not provide the full answer directly. Ask one Socratic follow-up if the answer misses business cost, compliance, or human oversight.
```

---

## References

[1] Central Bank of Tunisia. *Circular to banks and financial institutions No. 2021-05 of August 19, 2021 on the governance framework for banks and financial institutions*.  
https://www.cbf.org.tn/wp-content/uploads/2023/01/05-Circulaire-aux-banques-et-aux-etablissements-financiers-n%C2%B02021-05-du-19-Aout-2021.pdf

[2] Central Bank of Tunisia. *Circular to banks and financial institutions No. 2022-01 of March 1, 2022 on prevention and resolution of non-performing loans*.  
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
