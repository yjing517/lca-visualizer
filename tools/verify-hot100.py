"""Read-only verification: rerun snippets and compare every snapshot to the published data."""

import importlib.util, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("builder", ROOT / "tools/build-hot100.py")
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)
count = 0
for p in (ROOT / "dist/problems").glob("hot100-*/data.json"):
    data = json.loads(p.read_text(encoding="utf8"))
    text = (p.parent / "app.js").read_text(encoding="utf8")
    snippets = json.loads(text[len("const snippets=") : text.index(";\nwindow")])
    for case in data["cases"]:
        fixture = {k: v for k, v in case.items() if k in ["input", "expected", "boundary"]}
        actual = b.trace(
            data["number"], "\n".join(snippets["Python"]), fixture, "\n".join(snippets["Java"])
        )
        assert actual == case, (data["number"], case["input"])
        count += 1
print("Passed:", count, "Python results and complete reproducible state snapshots.")
