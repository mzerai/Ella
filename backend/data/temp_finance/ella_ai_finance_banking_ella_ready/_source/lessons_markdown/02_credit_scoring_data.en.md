---
course_id: ella_industry_ai_finance_banking
course_slug: ai-finance-banking
pathway: industry
level: advanced
module_id: 01_credit_scoring_risk
lesson_id: 02_credit_scoring_data
language: en
title: "Lesson 2 — Credit Scoring Data"
estimated_duration_minutes: 35
version: 1.0
encoding: UTF-8
---

# Lesson 2 — Credit Scoring Data

## Lesson objective

In a credit scoring model, data does much of the work. Before you talk about algorithms, you need to know which data you use, why you use it, and what risk it creates.

By the end of this lesson, you will be able to:

1. identify the main data families used in credit scoring;
2. distinguish a useful variable from a risky variable;
3. detect data quality, bias, and compliance issues;
4. prepare a first data sheet for a scoring project.

---

## 1. The model learns what the data shows

A credit scoring model does not “understand” a customer the way a relationship manager does. It learns statistical relationships from past examples.

If past data is clean, relevant, and controlled, the model can help estimate risk. If the data is incomplete, biased, or poorly defined, the model can amplify existing errors.

Keep this rule in mind: **a scoring model does not fix bad data. It uses it.**

❌ **Common mistake**  
Assuming that XGBoost, a neural network, or a large AI model will automatically correct dataset weaknesses.

✅ **Better approach**  
Start by auditing the data: source, freshness, quality, authorization of use, business meaning, bias risks, and traceability.

---

## 2. The main data families

In a credit scoring project, you may encounter several data families.

### Identification and KYC data

This data helps identify the customer: customer type, professional situation, business sector, relationship history, file status, and documents provided.

Be careful: this data may contain personal information. In Tunisia, Organic Law No. 2004-63 governs the protection of personal data and recognizes it as a fundamental right.

### Financial data

This data describes the customer’s financial capacity: declared income, turnover, expenses, debt level, cash-flow stability, savings, payment incidents, and current exposures.

This data is often useful. But it must be defined with precision. For example, “monthly income” does not mean the same thing for an employee, a shop owner, a freelancer, or a company.

### Banking behavior data

This data describes actual account usage: regularity of inflows, frequency of overdrafts, rejected payments, average balance, seasonality, and cash-flow evolution.

These signals can be powerful. But they must remain interpretable. Unusual behavior is not always bad behavior. A shop owner, a farmer, and an employee do not have the same financial rhythm.

### Past credit data

This data concerns repayment history: delays, restructurings, defaults, regularizations, guarantees used, and exposure history.

It is central to credit risk. BCT Circular No. 2022-01 emphasizes the prevention and resolution of non-performing loans through early warning systems and proactive treatment.

### Collateral data

This data describes risk coverage: guarantee, mortgage, pledge, institutional guarantee, estimated value, legal quality, and liquidity.

Do not confuse collateral with repayment capacity. Collateral can reduce potential loss, but it does not automatically turn a weak credit file into a good risk.

---

## 3. Not every useful variable is acceptable

A variable can be predictive and still problematic.

Imagine that a model discovers that a district, a profession, or a mobile-phone type strongly predicts risk. Should you use that variable? Not automatically.

Ask three questions:

1. **Is the variable legitimate for the decision?**
2. **Could it create indirect discrimination?**
3. **Can it be explained to the customer, the risk committee, and audit?**

In the European Union, the AI Act treats systems used to evaluate the creditworthiness or credit score of natural persons as high-risk AI systems. Even in a Tunisian context, this logic is useful: credit scoring affects access to financial resources and must be treated with care.

---

## 4. Data quality must be measured

Never say: “the data is good.” Prove it.

For a scoring dataset, check at least:

| Control | Question to ask |
|---|---|
| Completeness | How many values are missing? |
| Freshness | Is the data recent? |
| Consistency | Are income, expenses, and exposures compatible? |
| Stability | Do variables keep the same meaning over time? |
| Traceability | Do we know where each data point comes from? |
| Authorization of use | Are we allowed to use this data for this case? |
| Business meaning | Does the variable make financial sense? |

A good model starts with this discipline. The Basel Committee states that credit risk management relies on a sound credit risk environment, a sound credit-granting process, appropriate risk measurement and monitoring, and adequate controls.

---

## 5. Mini-case: personal loan application

Here is a simple example.

A customer applies for a personal loan. You have the following data:

| Variable | Example | Comment |
|---|---:|---|
| Net monthly income | 2,400 TND | Useful, but must be verified |
| Employment seniority | 18 months | Useful for stability |
| Monthly expenses | 1,100 TND | Useful for remaining capacity |
| Payment incidents in 12 months | 2 | Risk signal |
| Average balance over 6 months | 350 TND | Liquidity signal |
| Application channel | Mobile app | Use with caution |
| Governorate | Tunis | Sensitive if used as a social proxy |
| Phone type | Recent model | Proxy risk, weak legitimacy |

Your job as a practitioner is not to throw everything into a model. Your job is to select variables that make sense, are authorized, are explainable, and truly support risk analysis.

❌ **Poor practice**  
Using every available variable because it improves AUC.

✅ **Good practice**  
Build a list of candidate variables, justify their use, remove weak or risky variables, then document your choices.

---

## 6. What you should remember

Before building a scoring model, start with the data.

Always ask these five questions:

1. **Where does the data come from?**
2. **Are we allowed to use it?**
3. **What does it mean in business terms?**
4. **Could it create bias or unfair exclusion?**
5. **Can its role in the decision be explained?**

If you cannot answer, the variable is not ready for a credit scoring model.

---

## Ella checkpoint

**Ella:**  
You are preparing a credit scoring model for a bank. The team proposes using the following variables: monthly income, employment seniority, payment incidents, phone type, governorate, average balance, and repayment history.

Classify these variables into three groups:

1. **generally relevant variables**;
2. **variables to use with caution**;
3. **variables to avoid or strongly justify**.

Explain your reasoning in 8 to 10 lines.

**Mode:** `free`

### ella_system_hint

```text
Evaluate whether the learner can distinguish predictive usefulness from acceptability, explainability, and compliance. A strong answer should place income, employment stability, payment incidents, average balance, and repayment history as generally relevant, while still noting that they must be verified and documented. The learner should treat governorate with caution because it can act as a socioeconomic proxy. The learner should treat phone type as weakly legitimate or risky unless a clear, lawful, and explainable business rationale exists. Praise answers that mention data quality, authorization of use, bias, explainability, and human review. Correct answers that simply say “use all variables that improve accuracy.” Do not provide the full solution directly; guide the learner with one Socratic question when needed.
```

---

## References

1. Central Bank of Tunisia, **Circular to Banks and Financial Institutions No. 2021-05 of 19 August 2021 — Governance framework for banks and financial institutions**.  
   https://www.cbf.org.tn/wp-content/uploads/2023/01/05-Circulaire-aux-banques-et-aux-etablissements-financiers-n%C2%B02021-05-du-19-Aout-2021.pdf

2. Central Bank of Tunisia, **Circular to Banks and Financial Institutions No. 2022-01 of 1 March 2022 — Prevention and resolution of non-performing loans**.  
   https://www.cbf.org.tn/wp-content/uploads/2023/01/01-Circulaire-aux-banques-et-aux-etablissements-financiers-n%C2%B02022-01-du-01-Mars-2022.pdf

3. Republic of Tunisia, **Organic Law No. 2004-63 of 27 July 2004 on the protection of personal data**.  
   https://www.ins.tn/sites/default/files/2020-04/Loi%2063-2004%20Fr.pdf

4. Basel Committee on Banking Supervision, **Principles for the management of credit risk**, Bank for International Settlements, 2025.  
   https://www.bis.org/bcbs/publ/d595.pdf

5. NIST, **Artificial Intelligence Risk Management Framework (AI RMF 1.0)**, 2023.  
   https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf

6. European Banking Authority, **AI Act: implications for the EU banking and payments sector**, 2025.  
   https://www.eba.europa.eu/sites/default/files/2025-11/d8b999ce-a1d9-4964-9606-971bbc2aaf89/AI%20Act%20implications%20for%20the%20EU%20banking%20sector.pdf
