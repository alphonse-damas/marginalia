# Governance MVP Freeze v1

Branch: phase-iii-governance  
Commit: 9744ba3  
Tag: governance-mvp-freeze-v1  
Build Status: Passed  
Freeze Date: 2026-05-29  

## Summary

This freeze captures the first coherent Governance Interpretation MVP baseline for Marginalia Analytics.

The platform now supports two evidence intake modes:

1. Canonical CSV evidence
2. Raw SAS output evidence

Both paths produce an analytical artifact that can be interpreted, scored, inspected, and governed.

## Core Capability Frozen

Marginalia now demonstrates:

- evidence intake
- artifact generation
- interpretation rendering
- interpretation reliability scoring
- governance inspection
- evidence coverage assessment
- source traceability assessment
- weak-context risk assessment
- missing evidence detection
- improvement recommendations
- reasoning trace visibility
- explainable score panels

## Key Architectural Distinction

Marginalia separates:

### Interpretation Reliability

This asks:

Can Marginalia reliably interpret the submitted evidence?

### Governance Trust

This asks:

Is the evidence sufficient to support operational, deployment, or higher-stakes claims?

This separation is central to the platform.

## Current Evidence Paths

### Canonical CSV

Strengths:

- deterministic
- structured
- reproducible
- more traceable
- lower ambiguity

Limitations:

- still requires validation evidence
- still lacks calibration/fairness/drift evidence unless supplied

### Raw SAS

Strengths:

- accepts real-world analytical output
- supports exploratory ingestion
- allows interpretation of non-canonical text evidence

Limitations:

- extraction-dependent
- parser ambiguity risk
- weaker governance traceability
- requires human review more often

## Frozen UI Concepts

The MVP currently includes:

- Evidence Intake column
- Interpretation column
- Interpretation Reliability panel
- Evidence Objects panel
- Reasoning Trace panel
- Governance Inspection panel
- Score Breakdown
- Missing Evidence
- Governance Warnings
- Improvement Recommendations

## Frozen Governance Concepts

The governance layer currently evaluates:

- evidence coverage
- source traceability
- question fit
- weak-context risk
- missing required evidence
- missing recommended evidence
- refusal recommendation
- human review requirement
- deployment support

## Known Limitations

This freeze does not yet include:

- full type normalization
- complete removal of `any`
- full test coverage
- UI tab refactor
- calibration evidence ingestion
- fairness evidence ingestion
- drift evidence ingestion
- policy profiles
- model-risk tiers
- cross-framework adapters

## Next Stabilization Priorities

1. Normalize `AnalysisArtifact` typing.
2. Stabilize component prop contracts.
3. Create regression fixtures.
4. Refactor right-column trust/governance UI into tabs or accordions.
5. Add tests for canonical CSV, raw SAS, and sparse evidence cases.
6. Only then expand to statsmodels, sklearn, R glm, XGBoost, survival, SEM, IRT, and mixed models.

## Product Positioning Insight

Marginalia Analytics is not merely an analytics dashboard.

It is evolving into a governed analytical interpretation layer that evaluates whether evidence is sufficient to support interpretation.

The core question is not only:

What does the model output say?

The core question is:

What can safely be claimed from this evidence?