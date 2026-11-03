"""Rebuild deterministic teaching traces from checked-in Python solutions and examples.

Reference implementations: doocs/leetcode (CC BY-SA 4.0; see upstream/LICENSE).
No network is used by this builder or by the published demos.
"""

import hashlib
import ast, collections, copy, html, inspect, json, math, pathlib, re, sys, runpy

ROOT = pathlib.Path(__file__).resolve().parents[1]
UP = ROOT / "tools/upstream"
TRACES = ROOT / "tools/traces"
TEACHING = runpy.run_path(str(ROOT / "tools/teaching-overrides.py"))
IMPORTS = """from typing import List, Optional
from collections import Counter, defaultdict, deque
from functools import cache, reduce
from itertools import pairwise, accumulate
from bisect import bisect_left, bisect_right
from heapq import heapify, heappush, heappop, heappushpop
from math import inf, isqrt, sqrt
from operator import xor
"""


class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right


class Node:
    def __init__(self, x=0, next=None, random=None):
        self.val, self.next, self.random = x, next, random


def tree(a):
    if not a or a[0] is None:
        return None
    root = TreeNode(a[0])
    q = collections.deque([root])
    i = 1
    while q and i < len(a):
        p = q.popleft()
        for side in ["left", "right"]:
            if i < len(a) and a[i] is not None:
                n = TreeNode(a[i])
                setattr(p, side, n)
                q.append(n)
            i += 1
    return root


def linked(a):
    ns = [ListNode(x) for x in a]
    for x, y in zip(ns, ns[1:]):
        x.next = y
    return (ns[0] if ns else None), ns


def plain(s):
    return html.unescape(re.sub("<[^>]+>", "", s)).replace("\xa0", " ").strip()


def literal(s):
    return ast.literal_eval(
        re.sub(
            r"\b(null|true|false)\b",
            lambda m: {"null": "None", "true": "True", "false": "False"}[m[0]],
            s.strip(),
        )
    )


def examples(doc):
    desc = doc.split("<!-- description:start -->")[1].split("<!-- description:end -->")[0]
    # Preserve block boundaries so examples in both <pre> and modern example-block work.
    text = plain(re.sub(r"</(?:p|pre|li|div)>", "\n", desc))
    pairs = re.findall(
        r"输入\s*[：:]\s*(.*?)\s*输出\s*[：:]\s*(.*?)(?=解释\s*[：:]?|示例\s*\d|提示\s*[：:]?|$)",
        text,
        re.S,
    )
    out = []
    for inp, exp in pairs:
        exp = exp.strip().split("\n")[0].strip()
        try:
            matches = list(re.finditer(r"(\w+)\s*=\s*", inp))
            if matches:
                d = {}
                if inp[: matches[0].start()].strip().rstrip(",").strip():
                    d["_raw"] = literal(inp[: matches[0].start()].strip().rstrip(",").strip())
                d.update(
                    {
                        m[1]: literal(
                            inp[
                                m.end() : (
                                    matches[i + 1].start() if i + 1 < len(matches) else len(inp)
                                )
                            ]
                            .strip()
                            .rstrip(",")
                            .strip()
                        )
                        for i, m in enumerate(matches)
                    }
                )
            else:
                d = {"_raw": literal(inp)}
            out.append({"input": d, "expected": literal(exp)})
        except (ValueError, SyntaxError):
            pass
    return out


SPECIAL = {
    141: [({"head": [3, 2, 0, -4], "pos": 1}, True), ({"head": [1], "pos": -1}, False)],
    142: [({"head": [3, 2, 0, -4], "pos": 1}, 1), ({"head": [1], "pos": -1}, None)],
    160: [
        (
            {
                "listA": [4, 1, 8, 4, 5],
                "listB": [5, 6, 1, 8, 4, 5],
                "skipA": 2,
                "skipB": 3,
                "intersectVal": 8,
            },
            8,
        ),
        ({"listA": [2, 6, 4], "listB": [1, 5], "skipA": 3, "skipB": 2, "intersectVal": 0}, None),
    ],
    146: [
        (
            {
                "operations": [
                    "LRUCache",
                    "put",
                    "put",
                    "get",
                    "put",
                    "get",
                    "put",
                    "get",
                    "get",
                    "get",
                ],
                "arguments": [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
            },
            [None, None, None, 1, None, -1, None, -1, 3, 4],
        ),
        (
            {
                "operations": ["LRUCache", "put", "put", "get", "get"],
                "arguments": [[1], [1, 1], [2, 2], [1], [2]],
            },
            [None, None, None, -1, 2],
        ),
    ],
    155: [
        (
            {
                "operations": [
                    "MinStack",
                    "push",
                    "push",
                    "push",
                    "getMin",
                    "pop",
                    "top",
                    "getMin",
                ],
                "arguments": [[], [-2], [0], [-3], [], [], [], []],
            },
            [None, None, None, None, -3, None, 0, -2],
        ),
        (
            {
                "operations": ["MinStack", "push", "push", "pop", "getMin"],
                "arguments": [[], [2], [2], [], []],
            },
            [None, None, None, None, 2],
        ),
    ],
    208: [
        (
            {
                "operations": [
                    "Trie",
                    "insert",
                    "search",
                    "search",
                    "startsWith",
                    "insert",
                    "search",
                ],
                "arguments": [[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]],
            },
            [None, None, True, False, True, None, True],
        ),
        (
            {
                "operations": ["Trie", "startsWith", "insert", "search", "search"],
                "arguments": [[], ["z"], ["a"], ["a"], ["b"]],
            },
            [None, False, None, True, False],
        ),
    ],
    295: [
        (
            {
                "operations": [
                    "MedianFinder",
                    "addNum",
                    "addNum",
                    "findMedian",
                    "addNum",
                    "findMedian",
                ],
                "arguments": [[], [1], [2], [], [3], []],
            },
            [None, None, None, 1.5, None, 2.0],
        ),
        (
            {
                "operations": ["MedianFinder", "addNum", "addNum", "findMedian"],
                "arguments": [[], [-1], [-1], []],
            },
            [None, None, None, -1.0],
        ),
    ],
}


def prepare(n, d, method):
    d = copy.deepcopy(d)
    refs = {}
    if n == 160:
        a, ns = linked(d["listA"])
        b, ms = linked(d["listB"])
        if d["intersectVal"]:
            if d["skipB"]:
                ms[d["skipB"] - 1].next = ns[d["skipA"]]
            else:
                b = ns[d["skipA"]]
        refs["intersection"] = ns[d["skipA"]] if d["intersectVal"] else None
        return [a, b], refs
    params = list(inspect.signature(method).parameters)
    vals = list(d.values())
    if n in [141, 142]:
        head, ns = linked(d["head"])
        refs["cycleNodes"] = ns
        if ns and d["pos"] >= 0:
            ns[-1].next = ns[d["pos"]]
        return [head], refs
    args = []
    for i, p in enumerate(params):
        v = d.get(p, vals[i] if i < len(vals) else None)
        if p in ["head", "l1", "l2", "list1", "list2", "headA", "headB"]:
            if n == 138:
                ns = [Node(x[0]) for x in v]
                for j, node in enumerate(ns):
                    node.next = ns[j + 1] if j + 1 < len(ns) else None
                    node.random = ns[v[j][1]] if v[j][1] is not None else None
                v = ns[0] if ns else None
            else:
                v = linked(v)[0]
        elif p == "root":
            v = tree(v)
        elif p == "lists":
            v = [linked(x)[0] for x in v]
        args.append(v)
    return args, refs


def output(n, result, args, refs):
    if result is None and n in [283, 189, 73, 48, 114, 75, 31]:
        result = args[0]
    if result is None and n in [206, 21, 19, 24, 25, 138, 148, 23, 226, 114, 105, 108]:
        return []
    if n == 142:
        return refs["cycleNodes"].index(result) if result else None
    if n == 160:
        assert result is refs["intersection"]
        return result.val if result else None
    if n == 138:
        ns = []
        cur = result
        while cur:
            ns.append(cur)
            cur = cur.next
        originals = []
        cur = args[0]
        while cur:
            originals.append(cur)
            cur = cur.next
        assert not set(ns) & set(originals), "The copy must not reuse original nodes"
        assert all(
            x.random is None or x.random in ns for x in ns
        ), "Random pointers must stay inside the copied list"
        return [[x.val, ns.index(x.random) if x.random else None] for x in ns]
    if isinstance(result, TreeNode):
        q = collections.deque([result])
        a = []
        while q:
            p = q.popleft()
            a.append(p.val if p else None)
            if p:
                q.extend([p.left, p.right])
        while a and a[-1] is None:
            a.pop()
        return a
    if isinstance(result, ListNode):
        a = []
        while result:
            assert len(a) < 1000
            a.append(result.val)
            result = result.next
        return a
    return result


def normalized(n, x):
    if n in [49, 15, 39]:
        return sorted([sorted(a) for a in x], key=repr)
    if n == 347:
        return sorted(x)
    return x


def line_map(py, java, n):
    # Source hashes make edits fail closed: review the correspondence before rebuilding.
    mapping = json.loads((ROOT / "tools/hot100-line-maps.json").read_text(encoding="utf8"))[str(n)]
    for language, source in [("python", py), ("java", java)]:
        digest = hashlib.sha256("\n".join(source.splitlines()).encode()).hexdigest()
        assert digest == mapping[language + "Sha256"], (
            n,
            language,
            "Code changed; review and update the explicit line map",
        )
    return {int(line): target for line, target in mapping["lines"].items()}


def trace(n, code, case, java):
    env = {"ListNode": ListNode, "TreeNode": TreeNode, "Node": Node}
    filename = f"hot100-{n}.py"
    exec(compile(code, filename, "exec"), env)
    snapshots = []
    ids = {}
    objects = {}
    mapping = line_map(code, java, n)
    statements = {
        node.lineno: node for node in ast.walk(ast.parse(code)) if isinstance(node, ast.stmt)
    }

    def action(line, phase):
        node = statements.get(line)
        text = code.splitlines()[line - 1].strip()
        if phase == "返回":
            return "返回上一层", "当前调用结束，控制权交还给调用它的上一层；父调用会从调用点继续。"
        if isinstance(node, ast.FunctionDef):
            return "准备子过程", "定义一个子过程。这里只定义函数，后面的调用语句才会进入函数体。"
        if isinstance(node, ast.Return):
            return "准备返回", "计算本次调用的返回值；这会结束当前调用，不会直接结束其他调用。"
        if isinstance(node, ast.If):
            return "判断分支", "根据当前状态判断条件，决定进入分支还是继续执行后面的语句。"
        if isinstance(node, (ast.For, ast.While)):
            return "推进循环", "检查还有没有需要处理的候选；满足循环条件时，进入这一轮。"
        if isinstance(node, ast.Break):
            return "离开循环", "结束当前这一层循环；继续执行循环之后的语句。"
        if isinstance(node, ast.Continue):
            return "跳过当前候选", "当前候选无需继续处理，回到循环检查下一个候选。"
        if "t.pop()" in text and n == 39:
            return (
                "撤销选择",
                "弹出本层刚选入的数字，恢复进入本层之前的路径，才能继续探索其他候选。",
            )
        if "ans.append" in text:
            return "收集结果", "把当前已经确定的结果加入答案；观察答案容器怎样增加。"
        if (
            re.search(r"\b(?:dfs|quick_sort|reverse)\(", text)
            or "self." in text
            and "(" in text
            and not text.startswith("self.")
        ):
            return (
                "调用子过程",
                "把当前子问题交给下一次调用。调用栈会保留本层状态，子过程返回后再继续。",
            )
        if "popleft" in text or "heappop" in text or ".pop(" in text:
            return "取出元素", "从当前容器取出下一项；队列、栈或堆分别遵循自己的取出顺序。"
        if ".append(" in text or "heappush" in text:
            return "加入候选", "将当前元素放入待处理容器；下一步查看容器顺序和大小的变化。"
        if isinstance(node, (ast.Assign, ast.AugAssign)):
            return "更新状态", "按照这条语句更新变量或连接。绿色边框标出相较上一个快照的变化。"
        return "执行当前操作", "执行高亮的算法操作，并观察下一步的数据结构变化。"

    def value(x, depth=0):
        if x is None or isinstance(x, (bool, int, str)):
            return x
        if isinstance(x, float):
            return x if math.isfinite(x) else str(x)
        if depth > 8:
            return "…"
        if isinstance(x, (list, tuple, collections.deque, set)):
            seq = (
                sorted(x, key=lambda v: (type(v).__name__, str(getattr(v, "val", v))))
                if isinstance(x, set)
                else list(x)
            )
            return [value(v, depth + 1) for v in seq[:80]]
        if isinstance(x, dict):
            result = {}
            for k, v in list(x.items())[:80]:
                key = value(k, depth + 1)
                result[key["ref"] if isinstance(key, dict) and "ref" in key else str(key)] = value(
                    v, depth + 1
                )
            return result
        if hasattr(x, "__dict__") and not isinstance(x, type):
            key = id(x)
            if key not in ids:
                ids[key] = "n" + str(len(ids))
                objects[key] = x
            return {"ref": ids[key]}
        return None

    def snap(frame, line, phase):
        if len(snapshots) > 8000:
            raise RuntimeError("Trace too large; use a smaller teaching example")
        frames = []
        f = frame
        while f:
            if f.f_code.co_filename == filename and not f.f_code.co_name.startswith("<"):
                frames.append(
                    {
                        "name": f.f_code.co_name,
                        "vars": {
                            k: value(v)
                            for k, v in f.f_locals.items()
                            if not callable(v) and not k.startswith("__")
                        },
                    }
                )
            f = f.f_back
        nodes = {}
        seen = set()
        while len(seen) < len(objects):
            for key in list(objects):
                if key in seen:
                    continue
                seen.add(key)
                o = objects[key]
                nodes[ids[key]] = {
                    k: value(v) for k, v in vars(o).items() if not k.startswith("__")
                }
            if len(seen) > 300:
                raise RuntimeError("Node snapshot too large")
        title, message = action(line, phase)
        snapshots.append(
            {
                "line": line - 1,
                "javaLine": mapping.get(line - 1, 0),
                "stack": list(reversed(frames)),
                "nodes": nodes,
                "phase": phase,
                "action": title,
                "explanation": message,
            }
        )

    def hook(f, event, arg):
        if f.f_code.co_filename == filename and not f.f_code.co_name.startswith("<"):
            if event == "line":
                snap(f, f.f_lineno, "执行前")
            elif event == "return":
                snap(f, f.f_lineno, "返回")
        return hook

    d = case["input"]
    if "operations" in d:
        obj = None
        result = []
        args = []
        refs = {}
        sys.settrace(hook)
        try:
            for i, (op, params) in enumerate(zip(d["operations"], d["arguments"])):
                if i == 0:
                    obj = env[op](*params)
                    result.append(None)
                else:
                    result.append(getattr(obj, op)(*params))
        finally:
            sys.settrace(None)
    else:
        obj = env["Solution"]()
        method = next(getattr(obj, k) for k in vars(env["Solution"]) if not k.startswith("_"))
        args, refs = prepare(n, d, method)
        sys.settrace(hook)
        try:
            result = method(*args)
        finally:
            sys.settrace(None)
        result = output(n, result, args, refs)
    expected = case["expected"]
    if n == 5:
        assert (
            result == result[::-1]
            and result in list(d.values())[0]
            and len(result) == len(expected)
        )
    elif n == 108:

        def inorder(p):
            return inorder(p.left) + [p.val] + inorder(p.right) if p else []

        root = env["Solution"]().sortedArrayToBST(list(d.values())[0])
        assert inorder(root) == list(d.values())[0]

        def height(p):
            if not p:
                return 0
            a, b = height(p.left), height(p.right)
            assert abs(a - b) <= 1
            return 1 + max(a, b)

        height(root)
    else:
        assert normalized(n, result) == normalized(n, expected), (n, d, result, expected)
    assert snapshots, n
    snapshots[-1]["phase"] = "完成"
    snapshots[-1]["result"] = result
    return dict(case, result=result, events=snapshots)


def build():
    qs = json.loads((ROOT / "tools/hot100.json").read_text(encoding="utf8"))
    # Existing entries are maintained independently; never regenerate their demonstrations.
    old = {236, 513, 17, 78, 77, 46, 131, 239, 198, 1143, 300, 216, 22, 51}
    new = []
    fails = []
    for q in qs:
        n = int(q["questionFrontendId"])
        if n in old:
            continue
        try:
            doc = (UP / str(n) / "README.md").read_text(encoding="utf8")
            cases = (
                [{"input": a, "expected": b} for a, b in SPECIAL[n]]
                if n in SPECIAL
                else examples(doc)
            )
            assert len(cases) >= 2, ("Missing cases", n, cases)
            if n in TEACHING["EDGES"]:
                a, b = TEACHING["EDGES"][n]
                cases = cases[:2] + [{"input": a, "expected": b, "boundary": True}]
            else:
                cases = cases[:2]
                cases[-1]["boundary"] = True
            if n == 146:
                cases.append(
                    {
                        "input": {
                            "operations": ["LRUCache", "put", "put", "get", "put", "get", "get"],
                            "arguments": [[1], [1, 1], [1, 9], [1], [2, 2], [1], [2]],
                        },
                        "expected": [None, None, None, 9, None, -1, 2],
                        "boundary": True,
                    }
                )
            raw = TEACHING["SOLUTIONS"].get(
                n, (UP / str(n) / "Solution.py").read_text(encoding="utf8")
            )
            parsed = ast.parse(raw)
            for node in ast.walk(parsed):
                if hasattr(node, "body") and isinstance(node.body, list):
                    node.body[:] = [
                        a
                        for a in node.body
                        if not (
                            isinstance(a, ast.Expr)
                            and isinstance(a.value, ast.Constant)
                            and isinstance(a.value.value, str)
                        )
                    ]
            raw = ast.unparse(parsed) + "\n"
            used = {a.id for a in ast.walk(ast.parse(raw)) if isinstance(a, ast.Name)}
            imports = []
            for line in IMPORTS.splitlines():
                mod, names = line.split(" import ")
                selected = [x for x in names.split(", ") if x in used]
                if selected:
                    imports.append(mod + " import " + ", ".join(selected))
            py = "\n".join(imports) + "\n\n" + raw
            java = (
                "import java.util.*;\n"
                + re.sub(
                    r"/\*.*?\*/",
                    "",
                    (UP / str(n) / "Solution.java").read_text(encoding="utf8"),
                    flags=re.S,
                ).strip()
                + "\n"
            )
            for case in cases:
                if "_raw" in case["input"]:
                    solution = next(
                        node
                        for node in parsed.body
                        if isinstance(node, ast.ClassDef) and node.name == "Solution"
                    )
                    method = next(
                        node for node in solution.body if isinstance(node, ast.FunctionDef)
                    )
                    parameter = method.args.args[1].arg
                    case["input"] = {
                        parameter if key == "_raw" else key: value
                        for key, value in case["input"].items()
                    }
            traces = [trace(n, py, c, java) for c in cases]
            out = ROOT / "dist/problems" / f"hot100-{n}"
            out.mkdir(parents=True, exist_ok=True)
            view = json.loads((ROOT / "tools/hot100-views.json").read_text(encoding="utf8"))[str(n)]
            trace_file = TRACES / f"hot100-{n}.json"
            trace_file.parent.mkdir(parents=True, exist_ok=True)
            trace_file.write_text(
                json.dumps(
                    {
                        "number": n,
                        "title": q["translatedTitle"],
                        "category": q["category"],
                        "focus": view[0].split(","),
                        "cursors": json.loads(
                            (ROOT / "tools/hot100-cursors.json").read_text(encoding="utf8")
                        ).get(str(n), {}),
                        "meaning": view[1],
                        "cases": traces,
                    },
                    ensure_ascii=False,
                    separators=(",", ":"),
                ),
                encoding="utf8",
            )
            (out / "app.js").write_text(
                "const snippets="
                + json.dumps(
                    {"Python": py.splitlines(), "Java": java.splitlines()}, ensure_ascii=False
                )
                + ";\nwindow.HOT100_SNIPPETS=snippets;\n",
                encoding="utf8",
            )
            new.append((q, doc, out))
            print(n, "OK", len(traces), sum(len(t["events"]) for t in traces))
        except Exception as e:
            import traceback

            fails.append(n)
            print(n, "FAILED", repr(e))
            traceback.print_exc(limit=2)
    if not fails:
        register(new, qs)
    print("Built", len(new), "failed", fails)
    return new, fails


def prose(s):
    s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    s = re.sub(r"!\[[^]]*\]\([^)]*\)", "", s)
    s = re.sub(r"\[([^]]+)\]\([^)]*\)", r"\1", s)
    s = re.sub(r"\\(?:textit|text|mathrm|operatorname)\{([^}]+)\}", r"\1", s)
    for k, v in {
        "\\times": "×",
        "\\cdot": "·",
        "\\leq": "≤",
        "\\le": "≤",
        "\\geq": "≥",
        "\\ge": "≥",
        "\\neq": "≠",
        "\\infty": "∞",
        "\\log": "log",
        "\\sqrt": "√",
    }.items():
        s = s.replace(k, v)
    return re.sub(
        r"\s+",
        " ",
        plain(s)
        .replace("$", "")
        .replace("`", "")
        .replace("**", "")
        .replace("\\", "")
        .replace("> **思考**", ""),
    ).strip()


def register(new, qs):
    hints = json.loads((ROOT / "tools/hot100-hints.json").read_text(encoding="utf8"))
    entries = []
    for q, doc, out in new:
        n = int(q["questionFrontendId"])
        hint = hints[str(n)]
        description = doc.split("<!-- description:start -->")[1].split("<!-- description:end -->")[
            0
        ]
        intro = description.split("示例")[0]
        intro = re.sub(r"<img[^>]*>", "", intro)
        statement = prose(intro).rstrip("：: ")[:850]
        method = doc.split("### 方法一", 1)[1].split("<!-- tabs:start -->")[0].lstrip("：")
        methodTitle = method.splitlines()[0].strip() or "双栈解码"
        thinking = re.search(r"<!-- thinking:start -->(.*?)<!-- thinking:end -->", method, re.S)
        explanation = thinking[1] if thinking else method[len(methodTitle) :]
        explanation = re.sub(r"(?m)^>[ \t]?", "", explanation)
        paras = [prose(p.strip().lstrip("> ")) for p in re.split(r"\n\s*\n", explanation)]
        paras = [
            p
            for p in paras
            if len(p) > 30 and not p.startswith(("时间复杂度", "空间复杂度", "|", "思考"))
        ]
        complexity = " ".join(
            prose(p)
            for p in method.splitlines()
            if "复杂度" in p and not p.lstrip().startswith(">")
        )
        if n == 347:
            complexity = "时间 O(n + u log k)，额外空间 O(u + k)。u 是不同元素数量；使用频次表和大小至多 k 的小根堆。"
        if n == 136:
            complexity = "时间 O(n)，额外空间 O(1)。"
        if n == 287:
            complexity = "时间 O(n log n)，额外空间 O(1)。每次值域二分遍历数组统计数量。"
        if n == 230:
            complexity = "时间 O(h+k)，最坏 O(n)；辅助栈空间 O(h)，h 为树高。"
        if n == 394:
            complexity = "设输入长度为 n，展开结果长度为 L。字符串拼接与重复会复制字符，保守时间上界 O(n·L)，空间 O(n+L)，包含栈与构造中的字符串。"
        complexity = json.loads(
            (ROOT / "tools/hot100-complexities.json").read_text(encoding="utf8")
        ).get(str(n), complexity)
        assert complexity, (n, "complexity")
        tags = [
            {"深度优先搜索": "DFS", "广度优先搜索": "BFS", "哈希表": "哈希"}.get(
                t["nameTranslated"] or t["name"], t["nameTranslated"] or t["name"]
            )
            for t in q["topicTags"]
        ]
        category = {
            "多维动态规划": "动态规划",
            "子串": "滑动窗口",
            "普通数组": "数组",
            "技巧": "数组",
        }.get(q["category"], q["category"])
        meaning = json.loads((ROOT / "tools/hot100-views.json").read_text(encoding="utf8"))[str(n)][
            1
        ]
        pitfalls = [hint]
        if n in [94, 104, 226, 101, 543, 98, 105, 437, 124, 21]:
            pitfalls.append(
                "递归辅助空间取决于实际调用深度。退化为很长的单链时，Python 或 Java 的系统调用栈可能先达到限制；这类输入应改用显式栈。"
            )
        if n in [283, 189, 41, 73, 48, 234, 114, 200, 215, 75, 31]:
            pitfalls.append(
                "此实现会改变输入数组、网格或节点连接。对照多种方法时要先复制原始输入；演示中的回退由独立快照实现。"
            )
        entries.append(
            dict(
                id=f"leetcode-{n}",
                number=str(n),
                title=q["translatedTitle"],
                difficulty={"EASY": "简单", "MEDIUM": "中等", "HARD": "困难"}[q["difficulty"]],
                category=category,
                tags=list(dict.fromkeys(["Hot 100"] + tags)),
                addedAt="2026-11-03",
                source=f'https://leetcode.cn/problems/{q["titleSlug"]}/',
                summary=hint,
                statement=statement,
                demo=f"problems/hot100-{n}/index.html",
                principles=[
                    {"title": methodTitle, "text": paras[0] if paras else hint},
                    {"title": "状态表示什么", "text": meaning},
                    {
                        "title": "为什么可以这样做",
                        "text": " ".join(paras[1:3]) if len(paras) > 1 else hint,
                    },
                ],
                pitfalls=pitfalls,
                complexity=complexity,
            )
        )
        reference = f"https://github.com/doocs/leetcode/tree/main/solution/{n//100*100:04d}-{n//100*100+99:04d}/" + __import__(
            "urllib.parse", fromlist=["quote"]
        ).quote(
            f'{n:04d}.{q["title"]}'
        )
        page = (
            """<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>"""
            + html.escape(q["translatedTitle"])
            + """ · 算法拾遗</title><link rel="stylesheet" href="../bottom-left/style.css"><link rel="stylesheet" href="../hot100-player.css"></head><body><header><div class="brand">◈ 算法放映室</div><div class="tag" id="topic"></div></header><main><div class="eyebrow">HOT 100 · 看懂每一步</div><h1 class="trace-title" id="title"></h1><p class="sub">"""
            + html.escape(hint)
            + '''</p><div class="toolbar"><label>示例 <select id="example" aria-label="选择示例"></select></label><label>语言 <select id="lang" aria-label="代码语言"><option value="Python">Python</option><option value="Java">Java</option></select></label></div><details><summary>查看当前输入</summary><pre class="trace-input" id="input"></pre></details><div class="trace-layout"><section class="card"><div class="cardhead">01 / 状态与数据结构</div><div class="trace-state"><div id="frames" class="stack-list" aria-label="调用栈"></div><div id="state"></div></div><div class="trace-explain" aria-live="polite"><b id="phase"></b><p id="message"></p></div></section><section class="card"><div class="cardhead">02 / 代码与当前逻辑</div><div id="code" class="trace-code code"></div></section></div><div class="trace-actions"><div class="controls"><button id="reset">↺ 重置</button><button id="prev">← 上一步</button><button id="play" class="primary">▶ 自动播放</button><button id="next">下一步 →</button><input id="seek" class="progress" type="range" min="0" value="0" aria-label="执行进度"><span id="counter" class="counter"></span><select id="speed" aria-label="播放速度"><option value="1500">慢速</option><option value="850" selected>正常</option><option value="350">快速</option></select></div></div><div class="trace-result" id="result" aria-live="polite"></div><p class="trace-note">绿色边框表示相较上一步发生变化；橙色标出当前下标或被变量引用的节点。状态采用 Python 变量命名，Java 高亮对应逻辑；库操作和复合表达式可能对应多条语句。单步显示语句执行前的完整快照，返回事件显示调用结束时的状态。示例经过实际执行验证；返回或切换语言不会重新运行算法。</p><p class="trace-note">双语言实现与讲解参考 <a href="'''
            + reference
            + """" target="_blank" rel="noopener">doocs/leetcode</a>，按 <a href="../hot100-LICENSE.txt">CC BY-SA 4.0</a> 保留署名与许可；部分实现为便于逐步教学已展开。节点类型由题目平台提供。轨迹缓存和图形副本不计入算法空间复杂度。</p></main><script src="data.js"></script><script src="app.js"></script><script src="../hot100-player.js"></script></body></html>"""
        )
        if n == 73:
            page = page.replace('<div class="toolbar">', '<p class="matrix-extension"><a href="optimizations.html">扩展：对照三种优化方案 →</a></p><div class="toolbar">', 1)
        (out / "index.html").write_text(page, encoding="utf8")
        (out / "data.js").write_text(
            "window.HOT100_DATA=" + (TRACES / f"hot100-{n}.json").read_text(encoding="utf8") + ";\n",
            encoding="utf8",
        )
    p = ROOT / "dist/catalog.js"
    original = p.read_text(encoding="utf8").split("// BEGIN GENERATED HOT100")[0].rstrip()
    ids = [f'leetcode-{q["questionFrontendId"]}' for q in qs]
    p.write_text(
        original
        + "\n\n// BEGIN GENERATED HOT100 — regenerate with python tools/build-hot100.py\n"
        + "window.PROBLEMS.push(..."
        + json.dumps(entries, ensure_ascii=False, indent=2)
        + ");\n"
        + "for (const problem of window.PROBLEMS) {\n  if ("
        + json.dumps(ids)
        + '.includes(problem.id) && !problem.tags.includes("Hot 100")) problem.tags.push("Hot 100");\n}\n',
        encoding="utf8",
    )
    (ROOT / "dist/problems/hot100-LICENSE.txt").write_text(
        (UP / "LICENSE").read_text(encoding="utf8"), encoding="utf8"
    )


if __name__ == "__main__":
    _, fails = build()
    if fails:
        sys.exit(1)
    runpy.run_path(str(ROOT / "tools/build-matrix-zeroes.py"), run_name="__main__")
