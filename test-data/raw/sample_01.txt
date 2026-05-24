The LOGISTIC Procedure

              Model Information
Data Set                      WORK.LOGIT
Response Variable             honcomp
Number of Response Levels     2
Model                         binary logit
Optimization Technique        Fisher's scoring

Number of Observations Read         200
Number of Observations Used         200

          Response Profile
 Ordered                      Total
   Value      honcomp     Frequency
       1            1            53
       2            0           147
Probability modeled is honcomp=1.

                    Model Convergence Status
         Convergence criterion (GCONV=1E-8) satisfied.

         Model Fit Statistics
                             Intercept
              Intercept            and
Criterion          Only     Covariates
AIC             233.289        168.236
SC              236.587        181.430
-2 Log L        231.289        160.236

        Testing Global Null Hypothesis: BETA=0
Test                 Chi-Square       DF     Pr > ChiSq
Likelihood Ratio        71.0525        3          <.0001
Score                   61.7721        3          <.0001
Wald                    41.8176        3          <.0001