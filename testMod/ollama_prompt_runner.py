# ollama_prompt_runner.py
#
# Purpose:
# Parse SAS LOGISTIC output and extract metrics cleanly.
#
# Usage:
# python ollama_prompt_runner.py prompt.txt

import sys
from pathlib import Path


def read_prompt_file(file_path: str) -> str:
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Prompt file not found: {file_path}")

    return path.read_text(encoding="utf-8", errors="replace")


def extract_metrics(text: str) -> list[str]:
    metrics = []

    lines = text.splitlines()

    for line in lines:
        clean = line.strip()

        if not clean:
            continue

        # --------------------------------------------------
        # BASIC MODEL INFO
        # --------------------------------------------------

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

        # --------------------------------------------------
        # MODEL FIT STATISTICS
        # --------------------------------------------------

        elif clean.startswith("AIC"):
            parts = clean.split()

            if len(parts) >= 3:
                metrics.append(
                    f"AIC Intercept Only: {parts[1]}"
                )

                metrics.append(
                    f"AIC Intercept and Covariates: {parts[2]}"
                )

        elif clean.startswith("SC"):
            parts = clean.split()

            if len(parts) >= 3:
                metrics.append(
                    f"SC Intercept Only: {parts[1]}"
                )

                metrics.append(
                    f"SC Intercept and Covariates: {parts[2]}"
                )

        elif clean.startswith("-2 Log L"):
            parts = clean.split()

            if len(parts) >= 5:
                metrics.append(
                    f"-2 Log L Intercept Only: {parts[3]}"
                )

                metrics.append(
                    f"-2 Log L Intercept and Covariates: {parts[4]}"
                )

        # --------------------------------------------------
        # GLOBAL NULL HYPOTHESIS TESTS
        # --------------------------------------------------

        elif clean.startswith("Likelihood Ratio"):
            parts = clean.split()

            if len(parts) >= 5:
                metrics.append(
                    f"Likelihood Ratio Chi-Square: {parts[2]}"
                )

                metrics.append(
                    f"Likelihood Ratio DF: {parts[3]}"
                )

                metrics.append(
                    f"Likelihood Ratio Pr > ChiSq: {parts[4]}"
                )

        elif clean.startswith("Score"):
            parts = clean.split()

            if len(parts) >= 4:
                metrics.append(
                    f"Score Chi-Square: {parts[1]}"
                )

                metrics.append(
                    f"Score DF: {parts[2]}"
                )

                metrics.append(
                    f"Score Pr > ChiSq: {parts[3]}"
                )

        elif clean.startswith("Wald"):
            parts = clean.split()

            if len(parts) >= 4:
                metrics.append(
                    f"Wald Chi-Square: {parts[1]}"
                )

                metrics.append(
                    f"Wald DF: {parts[2]}"
                )

                metrics.append(
                    f"Wald Pr > ChiSq: {parts[3]}"
                )

    return metrics


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