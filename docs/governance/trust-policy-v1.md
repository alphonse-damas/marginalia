# Marginalia Analytics Trust Policy v1

## Purpose

Marginalia Analytics evaluates whether analytical evidence supports a user’s question, claim, or decision.

The system must not treat model output as automatically trustworthy simply because metrics are present.

Marginalia evaluates:

1. Evidence coverage
2. Source traceability
3. Question-to-evidence alignment
4. Weak-context risk
5. Validation and deployment readiness
6. Refusal conditions

---

## Core Principle

No evidence means no trust.

Weak evidence means qualified interpretation.

Strong metrics do not automatically imply strong conclusions.

---

## Evidence Coverage

Evidence coverage measures how complete the submitted analytical evidence is.

### None

Use when:

- no usable model metrics are present
- no predictor evidence is present
- uploaded files are empty or near-empty
- required fields are structurally present but values are missing

Expected trust impact:

- Trust score should collapse
- Refusal recommended
- Human review required

### Low

Use when:

- some model-level metrics are present
- predictor-level evidence is missing
- ROC/AUC or validation evidence is missing
- target variable or observation count is missing

Expected trust impact:

- Trust should be weak or insufficient
- Human review required

### Partial

Use when:

- model-level metrics are present
- predictor-level evidence is present
- some performance evidence is present
- validation, calibration, or external testing is missing

Expected trust impact:

- Trust may be cautionary
- Interpretation allowed with caveats

### Strong

Use when:

- model-level metrics are present
- predictor-level metrics are present
- performance metrics are present
- confidence intervals or uncertainty estimates are present
- validation or holdout evidence is present
- no major required evidence is missing

Expected trust impact:

- Trust may be strong
- Still avoid unsupported causal or deployment claims

---

## Source Traceability

Source traceability measures how clearly Marginalia can connect each interpreted value back to submitted evidence.

### High

Use when:

- evidence comes from canonical CSV
- schema is validated
- required fields are explicitly mapped
- no LLM extraction is required

### Moderate

Use when:

- evidence comes from raw SAS or raw statistical output
- LLM extraction was used
- repair/canonicalization was required
- audit trail is available

### Low

Use when:

- evidence was inferred
- extraction source is unclear
- output format is ambiguous
- values cannot be traced to specific submitted evidence

---

## Question-to-Evidence Alignment

Marginalia must evaluate whether the evidence can answer the user’s actual question.

### Strong Fit

Use when:

- the question asks for interpretation supported by the supplied evidence
- the model type matches the question
- required metrics are present
- the requested claim does not exceed the evidence

Example:

Question:
Which factors predict admission?

Evidence:
Logistic regression with predictor estimates, p-values, odds ratios, confidence intervals, and AUC.

### Partial Fit

Use when:

- the evidence partially addresses the question
- some relevant metrics are missing
- the question asks for broader claims than the evidence fully supports

Example:

Question:
Can this model guide admissions decisions?

Evidence:
Model metrics are present, but validation and fairness evidence are missing.

### Weak Fit

Use when:

- the question is causal but the evidence is observational/predictive
- the question asks about deployment but validation is absent
- the question asks for generalization but no holdout/testing evidence is present

Example:

Question:
Does GPA cause admission?

Evidence:
Logistic regression association only.

### No Fit

Use when:

- no evidence supports the question
- the uploaded files are empty
- the model output does not relate to the question
- required evidence is absent

Expected behavior:

- refuse or strongly qualify interpretation

---

## Weak-Context Risk

Weak-context risk measures the danger that the system may overinterpret incomplete or unstable evidence.

### Low

Use when:

- evidence is structured
- schema is validated
- required metrics are present
- no major ambiguity exists

### Medium

Use when:

- some evidence is missing
- validation is absent
- raw output was parsed
- repair/canonicalization was required

### High

Use when:

- evidence is sparse
- values may be misassigned
- output is ambiguous
- no predictor evidence exists
- no target/outcome is identified
- uploaded files are empty or near-empty

---

## Refusal Conditions

Marginalia should recommend refusal when:

- no usable evidence is present
- uploaded files are empty or near-empty
- the user asks for causal conclusions from non-causal evidence
- the user asks for deployment approval without validation evidence
- the user asks for high-stakes use without validation, fairness, and calibration evidence
- the extracted evidence is contradictory or untraceable
- the system cannot identify target variable, model family, or observation count

Refusal does not mean no response.

Refusal means the system should say:

- what cannot be concluded
- what evidence is missing
- what would be needed to answer safely

---

## Trust Score Philosophy

The trust score is not a model performance score.

The trust score measures the reliability of Marginalia’s interpretation given the submitted evidence.

A model can have good AUC but low trust if:

- validation is missing
- the question is causal
- the evidence is incomplete
- source traceability is weak
- deployment is requested without governance evidence

---

## Trust Score Bands

### 0–24: Insufficient

Use when:

- evidence is absent or unusable
- uploaded files are empty or near-empty
- question cannot be answered
- refusal is recommended

### 25–49: Weak

Use when:

- minimal evidence is available
- major required evidence is missing
- interpretation is highly limited

### 50–74: Caution

Use when:

- evidence is partially adequate
- some important evidence is missing
- interpretation is possible but caveated

### 75–89: Strong

Use when:

- core evidence is present
- uncertainty is reported
- question fit is adequate
- remaining gaps do not invalidate interpretation

### 90–100: High Confidence

Use sparingly.

Requires:

- structured evidence
- model metrics
- predictor metrics
- uncertainty estimates
- validation evidence
- calibration or diagnostic evidence when relevant
- strong question fit
- low weak-context risk

---

## Deployment Governance

Marginalia should not support deployment when:

- validation evidence is missing
- model drift is not assessed
- calibration is not assessed
- fairness/subgroup performance is not assessed
- the use case is high-stakes
- monitoring plan is absent

Deployment support requires more evidence than interpretation support.

---

## Causal Governance

Predictive or associational model output does not prove causality.

If the user asks a causal question, Marginalia must require:

- causal design
- identification strategy
- confounder handling
- causal assumptions
- sensitivity checks

Without these, causal claims should be refused or heavily qualified.

---

## Required Fixes Identified

The current system must be updated so that:

1. Empty or near-empty CSV files produce Insufficient trust.
2. Missing predictor evidence produces a stronger penalty.
3. Missing ROC/AUC evidence produces a stronger penalty when predictive performance is relevant.
4. Validation absence should affect deployment support more strongly than interpretation support.
5. Question-to-evidence alignment must be explicitly evaluated.
6. Trust score should be derived from governance dimensions, not only missing-evidence count.
7. Evidence object count should reflect usable evidence, not merely uploaded files.
8. Key takeaways should not imply adequacy when evidence is sparse.
9. Raw SAS extraction should expose extraction uncertainty.
10. Canonical CSV should require schema validation before artifact generation.

---

## Current Product Interpretation

Marginalia should support two evidence modes:

### Raw SAS / Raw Output Mode

Purpose:
Flexible, interpretive ingestion for messy analytical evidence.

Trust posture:
Useful but lower confidence because extraction and formatting may introduce ambiguity.

### Canonical CSV Mode

Purpose:
Deterministic, governance-ready evidence intake.

Trust posture:
Higher confidence only when required fields are populated with usable values.

---

## Guiding Rule

Marginalia should always prefer a truthful weak answer over a confident unsupported answer.