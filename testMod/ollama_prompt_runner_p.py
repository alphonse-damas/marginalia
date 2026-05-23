# ollama_prompt_runner.py

import sys
from pathlib import Path


def read_prompt_file(file_path: str) -> str:
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Prompt file not found: {file_path}")

    return path.read_text(encoding="utf-8", errors="replace")


# ==========================================================
# SAS PARSER
# ==========================================================

def parse_sas_logistic(text: str) -> list[str]:

    metrics = []
    lines = text.splitlines()

    for line in lines:

        clean = line.strip()

        if not clean:
            continue

        if clean.startswith("Data Set"):
            metrics.append(
                "Data Set: " +
                clean.replace("Data Set", "").strip()
            )

        elif clean.startswith("Response Variable"):
            metrics.append(
                "Response Variable: " +
                clean.replace("Response Variable", "").strip()
            )

        elif clean.startswith("Number of Response Levels"):
            metrics.append(
                "Number of Response Levels: " +
                clean.replace("Number of Response Levels", "").strip()
            )

        elif clean.startswith("Model                         "):
            metrics.append(
                "Model: " +
                clean.replace("Model", "").strip()
            )

        elif clean.startswith("Optimization Technique"):
            metrics.append(
                "Optimization Technique: " +
                clean.replace("Optimization Technique", "").strip()
            )

        elif clean.startswith("Number of Observations Read"):
            metrics.append(
                "Number of Observations Read: " +
                clean.replace("Number of Observations Read", "").strip()
            )

        elif clean.startswith("Number of Observations Used"):
            metrics.append(
                "Number of Observations Used: " +
                clean.replace("Number of Observations Used", "").strip()
            )

        elif clean.startswith("Probability modeled is"):
            metrics.append(
                "Probability modeled: " +
                clean.replace("Probability modeled is", "")
                     .replace(".", "")
                     .strip()
            )

        elif "Convergence criterion" in clean:
            metrics.append(
                "Model Convergence Status: " + clean
            )

        elif clean.startswith("AIC"):
            parts = clean.split()

            if len(parts) >= 3:
                metrics.append(f"AIC Intercept Only: {parts[1]}")
                metrics.append(f"AIC Intercept and Covariates: {parts[2]}")

        elif clean.startswith("SC"):
            parts = clean.split()

            if len(parts) >= 3:
                metrics.append(f"SC Intercept Only: {parts[1]}")
                metrics.append(f"SC Intercept and Covariates: {parts[2]}")

        elif clean.startswith("-2 Log L"):
            parts = clean.split()

            if len(parts) >= 5:
                metrics.append(f"-2 Log L Intercept Only: {parts[3]}")
                metrics.append(f"-2 Log L Intercept and Covariates: {parts[4]}")

        elif clean.startswith("Likelihood Ratio"):
            parts = clean.split()

            if len(parts) >= 5:
                metrics.append(f"Likelihood Ratio Chi-Square: {parts[2]}")
                metrics.append(f"Likelihood Ratio DF: {parts[3]}")
                metrics.append(f"Likelihood Ratio Pr > ChiSq: {parts[4]}")

        elif clean.startswith("Score"):
            parts = clean.split()

            if len(parts) >= 4:
                metrics.append(f"Score Chi-Square: {parts[1]}")
                metrics.append(f"Score DF: {parts[2]}")
                metrics.append(f"Score Pr > ChiSq: {parts[3]}")

        elif clean.startswith("Wald"):
            parts = clean.split()

            if len(parts) >= 4:
                metrics.append(f"Wald Chi-Square: {parts[1]}")
                metrics.append(f"Wald DF: {parts[2]}")
                metrics.append(f"Wald Pr > ChiSq: {parts[3]}")

    return metrics


# ==========================================================
# PYTHON / STATSMODELS PARSER
# ==========================================================

def parse_python_logit(text: str) -> list[str]:

    metrics = []

    lines = text.splitlines()

    for line in lines:

        clean = line.strip()

        if not clean:
            continue

        # --------------------------------------------------
        # HEADER METRICS
        # --------------------------------------------------

        if "Dep. Variable:" in clean:
            parts = clean.split("Dep. Variable:")
            right = parts[1]

            dep_var = right.split("No. Observations:")[0].strip()
            obs = right.split("No. Observations:")[1].strip()

            metrics.append(f"Dependent Variable: {dep_var}")
            metrics.append(f"Number of Observations: {obs}")

        elif "Model:" in clean and "Df Residuals:" in clean:
            parts = clean.split("Model:")
            right = parts[1]

            model = right.split("Df Residuals:")[0].strip()
            df_resid = right.split("Df Residuals:")[1].strip()

            metrics.append(f"Model: {model}")
            metrics.append(f"Df Residuals: {df_resid}")

        elif "Method:" in clean and "Df Model:" in clean:
            parts = clean.split("Method:")
            right = parts[1]

            method = right.split("Df Model:")[0].strip()
            df_model = right.split("Df Model:")[1].strip()

            metrics.append(f"Method: {method}")
            metrics.append(f"Df Model: {df_model}")

        elif "Pseudo R-squ.:" in clean:
            metrics.append(
                "Pseudo R-squared: " +
                clean.split("Pseudo R-squ.:")[1].strip()
            )

        elif "Log-Likelihood:" in clean:
            metrics.append(
                "Log-Likelihood: " +
                clean.split("Log-Likelihood:")[1].strip()
            )

        elif "LL-Null:" in clean:
            metrics.append(
                "LL-Null: " +
                clean.split("LL-Null:")[1].strip()
            )

        elif "LLR p-value:" in clean:
            metrics.append(
                "LLR p-value: " +
                clean.split("LLR p-value:")[1].strip()
            )

        elif clean.startswith("converged:"):
            metrics.append(
                "Converged: " +
                clean.replace("converged:", "").strip()
            )

        elif clean.startswith("Covariance Type:"):
            metrics.append(
                "Covariance Type: " +
                clean.replace("Covariance Type:", "").strip()
            )

        # --------------------------------------------------
        # COEFFICIENT TABLE
        # --------------------------------------------------

        elif (
            clean.startswith("Intercept")
            or clean.startswith("mean_")
        ):

            parts = clean.split()

            if len(parts) >= 7:

                variable = parts[0]

                metrics.append(f"{variable} coef: {parts[1]}")
                metrics.append(f"{variable} std err: {parts[2]}")
                metrics.append(f"{variable} z: {parts[3]}")
                metrics.append(f"{variable} P>|z|: {parts[4]}")
                metrics.append(f"{variable} 0.025 CI: {parts[5]}")
                metrics.append(f"{variable} 0.975 CI: {parts[6]}")

        # --------------------------------------------------
        # WARNINGS
        # --------------------------------------------------

        elif "Possibly complete quasi-separation" in clean:
            metrics.append(
                "Warning: Possibly complete quasi-separation detected"
            )

    return metrics


# ==========================================================
# ROUTER
# ==========================================================

def extract_metrics(text: str) -> list[str]:

    if "The LOGISTIC Procedure" in text:
        return parse_sas_logistic(text)

    elif "Logit Regression Results" in text:
        return parse_python_logit(text)

    else:
        return ["No supported output format detected."]


# ==========================================================
# MAIN
# ==========================================================

def main():

    if len(sys.argv) < 2:
        print("Usage:")
        print("python ollama_prompt_runner.py prompt.txt")
        sys.exit(1)

    prompt_file = sys.argv[1]

    try:

        print("\n========================================")
        print("READING PROMPT FILE")
        print("========================================")

        text = read_prompt_file(prompt_file)

        print(f"Loaded prompt from: {prompt_file}")

        metrics = extract_metrics(text)

        print("\n========================================")
        print("EXTRACTED METRICS")
        print("========================================\n")

        for metric in metrics:
            print(metric)

    except Exception as e:
        print(f"\nERROR: {e}")


if __name__ == "__main__":
    main()