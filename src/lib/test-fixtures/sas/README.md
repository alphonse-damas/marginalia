# SAS Test Fixtures

This folder stores raw SAS analytical output used to test Marginalia ingestion and normalization.

Each fixture should contain raw output only.

Do not add metadata, labels, JSON wrappers, or TypeScript exports inside raw fixture files.

Recommended naming:

- sas_logistic_no_predictors_01.txt
- sas_logistic_with_predictors_01.txt
- sas_logistic_with_roc_01.txt
- sas_logistic_failed_convergence_01.txt
- sas_reg_linear_01.txt