# metric_parser.py
#
# Usage:
# python metric_parser.py prompt.txt rawData.txt

import sys
import json
from pathlib import Path
from datetime import datetime
from uuid import uuid4


def read_file(file_path: str) -> str:
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    return path.read_text(encoding="utf-8", errors="replace")


def make_pid() -> str:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = uuid4().hex[:8]
    return f"RUN_{timestamp}_{suffix}"


# ==========================================================
# SAS LOGISTIC PARSER
# ==========================================================

def parse_sas_logistic(text: str) -> list[dict]:
    metrics = []

    def add(name, value, section="SAS LOGISTIC"):
        metrics.append({
            "metric_name": name,
            "metric_value": value,
            "section": section,
            "source_type": "sas_logistic"
        })

    for line in text.splitlines():
        clean = line.strip()

        if not clean:
            continue

        if clean.startswith("Data Set"):
            add("Data Set", clean.replace("Data Set", "").strip(), "Model Information")

        elif clean.startswith("Response Variable"):
            add("Response Variable", clean.replace("Response Variable", "").strip(), "Model Information")

        elif clean.startswith("Number of Response Levels"):
            add("Number of Response Levels", clean.replace("Number of Response Levels", "").strip(), "Model Information")

        elif clean.startswith("Model                         "):
            add("Model", clean.replace("Model", "").strip(), "Model Information")

        elif clean.startswith("Optimization Technique"):
            add("Optimization Technique", clean.replace("Optimization Technique", "").strip(), "Model Information")

        elif clean.startswith("Number of Observations Read"):
            add("Number of Observations Read", clean.replace("Number of Observations Read", "").strip(), "Observations")

        elif clean.startswith("Number of Observations Used"):
            add("Number of Observations Used", clean.replace("Number of Observations Used", "").strip(), "Observations")

        elif clean.startswith("Probability modeled is"):
            add(
                "Probability modeled",
                clean.replace("Probability modeled is", "").replace(".", "").strip(),
                "Response Profile"
            )

        elif "Convergence criterion" in clean:
            add("Model Convergence Status", clean, "Convergence Status")

        elif clean.startswith("AIC"):
            parts = clean.split()
            if len(parts) >= 3:
                add("AIC Intercept Only", parts[1], "Model Fit Statistics")
                add("AIC Intercept and Covariates", parts[2], "Model Fit Statistics")

        elif clean.startswith("SC"):
            parts = clean.split()
            if len(parts) >= 3:
                add("SC Intercept Only", parts[1], "Model Fit Statistics")
                add("SC Intercept and Covariates", parts[2], "Model Fit Statistics")

        elif clean.startswith("-2 Log L"):
            parts = clean.split()
            if len(parts) >= 5:
                add("-2 Log L Intercept Only", parts[3], "Model Fit Statistics")
                add("-2 Log L Intercept and Covariates", parts[4], "Model Fit Statistics")

        elif clean.startswith("Likelihood Ratio"):
            parts = clean.split()
            if len(parts) >= 5:
                add("Likelihood Ratio Chi-Square", parts[2], "Global Null Hypothesis")
                add("Likelihood Ratio DF", parts[3], "Global Null Hypothesis")
                add("Likelihood Ratio Pr > ChiSq", parts[4], "Global Null Hypothesis")

        elif clean.startswith("Score"):
            parts = clean.split()
            if len(parts) >= 4:
                add("Score Chi-Square", parts[1], "Global Null Hypothesis")
                add("Score DF", parts[2], "Global Null Hypothesis")
                add("Score Pr > ChiSq", parts[3], "Global Null Hypothesis")

        elif clean.startswith("Wald"):
            parts = clean.split()
            if len(parts) >= 4:
                add("Wald Chi-Square", parts[1], "Global Null Hypothesis")
                add("Wald DF", parts[2], "Global Null Hypothesis")
                add("Wald Pr > ChiSq", parts[3], "Global Null Hypothesis")

    return metrics


# ==========================================================
# PYTHON / STATSMODELS LOGIT PARSER
# ==========================================================

def parse_python_statsmodels_logit(text: str) -> list[dict]:
    metrics = []

    def add(name, value, section="Statsmodels Logit"):
        metrics.append({
            "metric_name": name,
            "metric_value": value,
            "section": section,
            "source_type": "python_statsmodels_logit"
        })

    for line in text.splitlines():
        clean = line.strip()

        if not clean:
            continue

        if "Dep. Variable:" in clean and "No. Observations:" in clean:
            right = clean.split("Dep. Variable:")[1]
            add("Dependent Variable", right.split("No. Observations:")[0].strip(), "Model Summary")
            add("Number of Observations", right.split("No. Observations:")[1].strip(), "Model Summary")

        elif "Model:" in clean and "Df Residuals:" in clean:
            right = clean.split("Model:")[1]
            add("Model", right.split("Df Residuals:")[0].strip(), "Model Summary")
            add("Df Residuals", right.split("Df Residuals:")[1].strip(), "Model Summary")

        elif "Method:" in clean and "Df Model:" in clean:
            right = clean.split("Method:")[1]
            add("Method", right.split("Df Model:")[0].strip(), "Model Summary")
            add("Df Model", right.split("Df Model:")[1].strip(), "Model Summary")

        elif "Date:" in clean and "Pseudo R-squ.:" in clean:
            right = clean.split("Date:")[1]
            add("Date", right.split("Pseudo R-squ.:")[0].strip(), "Model Summary")
            add("Pseudo R-squared", right.split("Pseudo R-squ.:")[1].strip(), "Model Fit")

        elif "Time:" in clean and "Log-Likelihood:" in clean:
            right = clean.split("Time:")[1]
            add("Time", right.split("Log-Likelihood:")[0].strip(), "Model Summary")
            add("Log-Likelihood", right.split("Log-Likelihood:")[1].strip(), "Model Fit")

        elif "converged:" in clean and "LL-Null:" in clean:
            right = clean.split("converged:")[1]
            add("Converged", right.split("LL-Null:")[0].strip(), "Convergence")
            add("LL-Null", right.split("LL-Null:")[1].strip(), "Model Fit")

        elif "Covariance Type:" in clean and "LLR p-value:" in clean:
            right = clean.split("Covariance Type:")[1]
            add("Covariance Type", right.split("LLR p-value:")[0].strip(), "Model Summary")
            add("LLR p-value", right.split("LLR p-value:")[1].strip(), "Model Fit")

        elif clean.startswith("Intercept") or clean.startswith("mean_"):
            parts = clean.split()

            if len(parts) >= 7:
                variable = parts[0]
                section = f"Parameter Estimates: {variable}"

                add(f"{variable} coef", parts[1], section)
                add(f"{variable} std err", parts[2], section)
                add(f"{variable} z", parts[3], section)
                add(f"{variable} P>|z|", parts[4], section)
                add(f"{variable} 0.025 CI", parts[5], section)
                add(f"{variable} 0.975 CI", parts[6], section)

        elif "Possibly complete quasi-separation" in clean:
            add("Warning", "Possibly complete quasi-separation detected", "Warnings")

    return metrics


# ==========================================================
# ROUTER
# ==========================================================

def detect_source_type(raw_text: str) -> str:
    if "The LOGISTIC Procedure" in raw_text:
        return "sas_logistic"

    if "Logit Regression Results" in raw_text:
        return "python_statsmodels_logit"

    return "unknown"


def extract_metrics(raw_text: str) -> tuple[str, list[dict]]:
    source_type = detect_source_type(raw_text)

    if source_type == "sas_logistic":
        return source_type, parse_sas_logistic(raw_text)

    if source_type == "python_statsmodels_logit":
        return source_type, parse_python_statsmodels_logit(raw_text)

    return source_type, []


# ==========================================================
# APPEND JSON ARTIFACT STORE
# ==========================================================

def append_json_artifact(
    prompt_file: str,
    raw_data_file: str,
    instructions: str,
    source_type: str,
    metrics: list[dict],
    output_file: str = "metrics_artifact_store.json"
) -> str:

    pid = make_pid()

    run_artifact = {
        "pid": pid,
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "prompt_file": prompt_file,
        "raw_data_file": raw_data_file,
        "detected_source_type": source_type,
        "metric_count": len(metrics),
        "instructions_snapshot": instructions,
        "metrics": metrics
    }

    artifact_path = Path(output_file)

    if artifact_path.exists():
        existing_text = artifact_path.read_text(encoding="utf-8").strip()
        artifact_store = json.loads(existing_text) if existing_text else []
    else:
        artifact_store = []

    if not isinstance(artifact_store, list):
        raise ValueError("Existing artifact store must be a JSON list.")

    artifact_store.append(run_artifact)

    artifact_path.write_text(
        json.dumps(artifact_store, indent=2),
        encoding="utf-8"
    )

    return pid


# ==========================================================
# MAIN
# ==========================================================

def main() -> None:
    if len(sys.argv) < 3:
        print("Usage:")
        print("python metric_parser.py prompt.txt rawData.txt")
        sys.exit(1)

    prompt_file = sys.argv[1]
    raw_data_file = sys.argv[2]

    try:
        print("\n========================================")
        print("READING PROMPT FILE")
        print("========================================")

        instructions = read_file(prompt_file)
        print(f"Loaded prompt/rules from: {prompt_file}")

        print("\n========================================")
        print("READING RAW DATA FILE")
        print("========================================")

        raw_text = read_file(raw_data_file)
        print(f"Loaded raw data from: {raw_data_file}")

        source_type, metrics = extract_metrics(raw_text)

        print("\n========================================")
        print("DETECTED SOURCE TYPE")
        print("========================================\n")
        print(source_type)

        print("\n========================================")
        print("EXTRACTED METRICS")
        print("========================================\n")

        if not metrics:
            print("No supported metrics detected.")
        else:
            for metric in metrics:
                print(f"{metric['metric_name']}: {metric['metric_value']}")

        pid = append_json_artifact(
            prompt_file=prompt_file,
            raw_data_file=raw_data_file,
            instructions=instructions,
            source_type=source_type,
            metrics=metrics
        )

        print("\n========================================")
        print("JSON ARTIFACT APPENDED")
        print("========================================\n")

        print(f"PID: {pid}")
        print("Saved to: metrics_artifact_store.json")

    except Exception as e:
        print(f"\nERROR: {e}")


if __name__ == "__main__":
    main()