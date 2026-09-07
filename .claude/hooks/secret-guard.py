

# with open("HOOK_RAN.txt", "w") as f:
#     f.write("Hook executed")

#!/usr/bin/env python3

import json
import re
import sys

PATTERNS = [
    ("Anthropic Key", r"sk-ant-[A-Za-z0-9_-]{20,}"),
    ("OpenAI Key", r"sk-[A-Za-z0-9]{20,}"),
    ("GitHub Token", r"ghp_[A-Za-z0-9]{30,}"),
    ("AWS Secret", r"(?i)aws.{0,20}secret.{0,20}[A-Za-z0-9/+]{20,}"),
    ("Password", r"(?i)password\s*[:=]\s*[\"']?.+[\"']?")
]

try:
    data = json.load(sys.stdin)

    text = json.dumps(data)

    for name, pattern in PATTERNS:
        if re.search(pattern, text):
            print(
                json.dumps(
                    {
                        "decision": "block",
                        "reason": f"Potential secret detected: {name}"
                    }
                )
            )
            sys.exit(0)

    print(json.dumps({"decision": "allow"}))

except Exception as e:
    print(
        json.dumps(
            {
                "decision": "allow",
                "note": str(e)
            }
        )
    )