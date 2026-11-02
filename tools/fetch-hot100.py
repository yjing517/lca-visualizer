import urllib.request, urllib.parse, re, json, pathlib, concurrent.futures

ROOT = pathlib.Path(__file__).resolve().parents[1]


def get(url):
    return urllib.request.urlopen(url, timeout=45).read().decode()


if __name__ == "__main__":
    h = get("https://leetcode.cn/studyplan/top-100-liked/")
    m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', h)
    d = json.loads(m.group(1))
    plan = next(
        q["state"]["data"]["studyPlanV2Detail"]
        for q in d["props"]["pageProps"]["dehydratedState"]["queries"]
        if "studyPlanV2Detail" in q["state"].get("data", {})
    )
    items = [dict(q, category=g["name"]) for g in plan["planSubGroups"] for q in g["questions"]]
    assert len(items) == 100 and len({q["questionFrontendId"] for q in items}) == 100
    (ROOT / "tools/hot100.json").write_text(
        json.dumps(items, ensure_ascii=False, indent=2), encoding="utf8"
    )

    def fetch(q):
        n = int(q["questionFrontendId"])
        base = (
            f"https://raw.githubusercontent.com/doocs/leetcode/main/solution/{n//100*100:04d}-{n//100*100+99:04d}/"
            + urllib.parse.quote(f'{n:04d}.{q["title"]}')
            + "/"
        )
        dest = ROOT / "tools/upstream" / str(n)
        dest.mkdir(parents=True, exist_ok=True)
        for name in ["Solution.py", "Solution.java", "README.md"]:
            p = dest / name
            if not p.exists():
                try:
                    p.write_text(get(base + name), encoding="utf8")
                except Exception as e:
                    print(n, name, str(e))
        return n

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        print("Fetched", len(list(pool.map(fetch, items))), "officially listed problems")
    (ROOT / "tools/upstream/LICENSE").write_text(
        get("https://raw.githubusercontent.com/doocs/leetcode/main/LICENSE"), encoding="utf8"
    )
