# .claude/hooks/session_context.py

import subprocess

try:
    branch = subprocess.check_output(
        ["git", "branch", "--show-current"],
        text=True
    ).strip()

    commit = subprocess.check_output(
        ["git", "log", "--oneline", "-1"],
        text=True
    ).strip()

    print(f"Current Branch: {branch}")
    print(f"Latest Commit: {commit}")

except Exception as e:
    print(f"Could not get git info: {e}")