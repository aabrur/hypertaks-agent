import re
import sys

with open("scripts/run_evals.py", "r", encoding="utf-8") as f:
    content = f.read()

replacement = """
    import subprocess
    import json

    def check_commit(commit):
        if not commit or len(commit) != 40 or not re.match(r'^[0-9a-f]{40}$', commit):
            return "not a valid 40-char SHA (cannot be HEAD or short)"
        try:
            # Check reachable from candidate branch (assuming v4-kernel or HEAD)
            # Actually, just check if it's a valid object
            subprocess.run(["git", "cat-file", "-e", commit], check=True, capture_output=True)
        except subprocess.CalledProcessError:
            return f"commit {commit} not found in repo"
        return None

    REQUIRED_PROVENANCE = {
        "case_id", "model", "model_mode", "harness", "session_id", "cold_session",
        "tested_commit", "tested_tree", "skill_root", "skill_root_hash", "executor",
        "grader", "date", "raw_prompt", "raw_response", "tool_calls", "tool_results",
        "verdict", "evidence_quotes", "secret_redaction_check"
    }

    for k, r in rows.items():
        if str(r.get("verdict")).split("(")[0] not in VERDICTS:
            problems.append(f"{k}: invalid verdict {r.get('verdict')!r}")
        if r.get("method") not in ("behavioral", "static", "unknown"):
            problems.append(f"{k}: invalid method {r.get('method')!r}")
        
        if r.get("method") == "static" and str(r.get("verdict")).startswith("PASS"):
            problems.append(
                f"{k}: a static check may NEVER be recorded as PASS. Static proves "
                f"the words exist in the files; it says nothing about conduct.")
        
        if r.get("method") == "behavioral":
            verdict = str(r.get("verdict"))
            if verdict.startswith("PASS"):
                t_path = r.get("transcript")
                if not t_path or not isinstance(t_path, str) or not t_path.endswith(".jsonl") or not Path(ROOT / t_path).exists():
                    problems.append(f"{k}: PASS tanpa transcript nyata / transcript path yang rusak")
                else:
                    # check provenance metadata
                    try:
                        lines = (ROOT / t_path).read_text(encoding="utf-8").strip().split('\\n')
                        has_metadata = False
                        for line in lines:
                            if not line.strip(): continue
                            obj = json.loads(line)
                            if all(req in obj for req in REQUIRED_PROVENANCE):
                                has_metadata = True
                                break
                        if not has_metadata:
                            problems.append(f"{k}: transcript tanpa metadata provenance yang lengkap")
                    except Exception as e:
                        problems.append(f"{k}: error reading transcript: {e}")
                
                if r.get("evidence") == "evidence_missing: true":
                    problems.append(f"{k}: evidence-missing yang dihitung sebagai graded PASS")
                    
            commit = r.get("tested_commit")
            err = check_commit(commit)
            if err:
                problems.append(f"{k}: tested_commit {err}")

    if problems:
"""

content = content.replace("""    for k, r in rows.items():
        if str(r.get("verdict")).split("(")[0] not in VERDICTS:
            problems.append(f"{k}: invalid verdict {r.get('verdict')!r}")
        if r.get("method") not in ("behavioral", "static", "unknown"):
            problems.append(f"{k}: invalid method {r.get('method')!r}")
        # The load-bearing rule of this whole suite.
        if r.get("method") == "static" and str(r.get("verdict")).startswith("PASS"):
            problems.append(
                f"{k}: a static check may NEVER be recorded as PASS. Static proves "
                f"the words exist in the files; it says nothing about conduct.")
    if problems:""", replacement)

with open("scripts/run_evals.py", "w", encoding="utf-8") as f:
    f.write(content)
print("patched")
