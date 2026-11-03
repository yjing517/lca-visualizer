"""Read-only verification: rerun snippets and compare every snapshot to the checked-in trace data."""

import importlib.util, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
TRACES = ROOT / "tools/traces"
spec = importlib.util.spec_from_file_location("builder", ROOT / "tools/build-hot100.py")
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)
count = 0
for p in sorted(TRACES.glob("hot100-*.json")):
    data = json.loads(p.read_text(encoding="utf8"))
    number = data["number"]
    variant = p.stem[len(f"hot100-{number}"):].lstrip("-")
    # 矩阵扩展轨迹由 check-matrix-zeroes.py 单独验证，这里只重放主题的代码。
    if variant:
        continue
    folder = ROOT / "dist/problems" / f"hot100-{number}"
    text = (folder / "app.js").read_text(encoding="utf8")
    snippets = json.loads(text[len("const snippets=") : text.index(";\nwindow")])
    for case in data["cases"]:
        fixture = {k: v for k, v in case.items() if k in ["input", "expected", "boundary"]}
        actual = b.trace(
            data["number"], "\n".join(snippets["Python"]), fixture, "\n".join(snippets["Java"])
        )
        assert actual == case, (data["number"], case["input"])
        count += 1
print("Passed:", count, "Python results and complete reproducible state snapshots.")
