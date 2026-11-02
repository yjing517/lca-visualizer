"""Small seeded differential checks against exhaustive/reference definitions."""

import collections, copy, functools, importlib.util, itertools, json, math, pathlib, random

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("builder", ROOT / "tools/build-hot100.py")
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)
rng = random.Random(100)
solutions = {}
checks = 0


def run(n, *args):
    if n not in solutions:
        text = (ROOT / f"dist/problems/hot100-{n}/app.js").read_text(encoding="utf8")
        snips = json.loads(text[len("const snippets=") : text.index(";\nwindow")])
        env = {"ListNode": b.ListNode, "TreeNode": b.TreeNode, "Node": b.Node}
        exec("\n".join(snips["Python"]), env)
        solutions[n] = env["Solution"]
    obj = solutions[n]()
    method = next(getattr(obj, k) for k in vars(solutions[n]) if not k.startswith("_"))
    values = copy.deepcopy(args)
    result = method(*values)
    return values[0] if n in [31, 75] else result


def eq(n, args, expected):
    global checks
    actual = run(n, *args)
    assert actual == expected, (n, args, actual, expected)
    checks += 1


for _ in range(35):
    a = [rng.randrange(-3, 5) for _ in range(rng.randrange(1, 8))]
    n = len(a)
    eq(41, (a,), next(x for x in range(1, n + 2) if x not in a))
    eq(53, (a,), max(sum(a[i:j]) for i in range(n) for j in range(i + 1, n + 1)))
    eq(152, (a,), max(math.prod(a[i:j]) for i in range(n) for j in range(i + 1, n + 1)))
    eq(238, (a,), [math.prod(a[:i] + a[i + 1 :]) for i in range(n)])
    k = rng.randrange(-3, 5)
    eq(560, (a, k), sum(sum(a[i:j]) == k for i in range(n) for j in range(i + 1, n + 1)))
    unique = set(a)
    eq(
        128,
        (a,),
        max(
            [
                sum(
                    all(x + t in unique for t in range(length))
                    for length in range(1, len(unique) + 1)
                )
                for x in unique
            ]
            or [0]
        ),
    )
    expected = sorted(
        {
            tuple(sorted(a[i] for i in inds))
            for inds in itertools.combinations(range(n), 3)
            if sum(a[i] for i in inds) == 0
        }
    )
    assert sorted(tuple(x) for x in run(15, a)) == expected
    checks += 1
    colors = [rng.randrange(3) for _ in range(n)]
    eq(75, (colors,), sorted(colors))
    h = [rng.randrange(5) for _ in range(n)]
    eq(84, (h,), max(min(h[i:j]) * (j - i) for i in range(n) for j in range(i + 1, n + 1)))
    eq(42, (h,), sum(min(max(h[: i + 1]), max(h[i:])) - h[i] for i in range(n)))
    s = "".join(rng.choice("abca") for _ in range(rng.randrange(8)))
    eq(
        3,
        (s,),
        max(
            [
                j - i
                for i in range(len(s) + 1)
                for j in range(i, len(s) + 1)
                if len(set(s[i:j])) == j - i
            ]
            or [0]
        ),
    )
    p = [rng.randrange(3) for _ in range(rng.randrange(1, 6))]
    perms = sorted(set(itertools.permutations(p)))
    idx = perms.index(tuple(p))
    eq(31, (p,), list(perms[(idx + 1) % len(perms)]))
    size = rng.randrange(1, 7)
    values = list(range(1, size + 1)) + [rng.randrange(1, size + 1)]
    rng.shuffle(values)
    eq(287, (values,), next(v for v, c in collections.Counter(values).items() if c == 2))
    nums = [rng.randrange(1, 7) for _ in range(rng.randrange(1, 8))]
    target = sum(nums) / 2
    eq(
        416,
        (nums,),
        any(
            sum(nums[i] for i in range(len(nums)) if mask >> i & 1) == target
            for mask in range(1 << len(nums))
        ),
    )
    # A breadth-first amount graph is independent of the solution's complete-knapsack table.
    coins = sorted(set(rng.randrange(1, 6) for _ in range(3)))
    amount = rng.randrange(15)
    q = collections.deque([(0, 0)])
    seen = {0}
    answer = -1
    while q:
        total, steps = q.popleft()
        if total == amount:
            answer = steps
            break
        for coin in coins:
            nxt = total + coin
            if nxt <= amount and nxt not in seen:
                seen.add(nxt)
                q.append((nxt, steps + 1))
    eq(322, (coins, amount), answer)

print(
    "Passed:",
    checks,
    "seeded differential checks: arrays, windows, selection, counting, subset sum and coin change.",
)
