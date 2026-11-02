"""Compile and run every new Java solution against the independently checked fixtures."""

import concurrent.futures, json, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import importlib.util

spec = importlib.util.spec_from_file_location("builder", ROOT / "tools/build-hot100.py")
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)
SUPPORT = r"""
class ListNode { int val; ListNode next; ListNode(){} ListNode(int v){val=v;} ListNode(int v,ListNode n){val=v;next=n;} }
class TreeNode { int val; TreeNode left,right; TreeNode(){} TreeNode(int v){val=v;} TreeNode(int v,TreeNode l,TreeNode r){val=v;left=l;right=r;} }
class Node { int val; Node next,random; Node(int v){val=v;} }
"""
HELPERS = r"""
static ListNode list(int[] a){ListNode d=new ListNode(),p=d;for(int x:a){p.next=new ListNode(x);p=p.next;}return d.next;}
static ListNode at(ListNode h,int i){while(i-->0)h=h.next;return h;}
static TreeNode tree(Integer[] a){if(a.length==0||a[0]==null)return null;TreeNode r=new TreeNode(a[0]);Queue<TreeNode>q=new ArrayDeque<>();q.add(r);int i=1;while(i<a.length){TreeNode p=q.poll();if(a[i]!=null){p.left=new TreeNode(a[i]);q.add(p.left);}i++;if(i<a.length){if(a[i]!=null){p.right=new TreeNode(a[i]);q.add(p.right);}i++;}}return r;}
static List<Object> treeOut(TreeNode root){List<Object>a=new ArrayList<>();List<TreeNode>q=new ArrayList<>();q.add(root);for(int i=0;i<q.size();i++){TreeNode p=q.get(i);a.add(p==null?null:p.val);if(p!=null){q.add(p.left);q.add(p.right);}}while(!a.isEmpty()&&a.get(a.size()-1)==null)a.remove(a.size()-1);return a;}
static String json(Object o){if(o==null)return "null";if(o instanceof String)return "\""+((String)o).replace("\\","\\\\").replace("\"","\\\"")+"\"";if(o instanceof Character)return json(o.toString());if(o instanceof TreeNode)return json(treeOut((TreeNode)o));if(o instanceof ListNode){List<Object>a=new ArrayList<>();for(ListNode p=(ListNode)o;p!=null;p=p.next){if(a.size()>1000)throw new RuntimeException("cycle");a.add(p.val);}return json(a);}if(o instanceof Collection){List<String>a=new ArrayList<>();for(Object x:(Collection<?>)o)a.add(json(x));return "["+String.join(",",a)+"]";}if(o.getClass().isArray()){List<String>a=new ArrayList<>();for(int i=0;i<java.lang.reflect.Array.getLength(o);i++)a.add(json(java.lang.reflect.Array.get(o,i)));return "["+String.join(",",a)+"]";}return o.toString();}
"""


def lit(x, t):
    if t.startswith("List<"):
        return "Arrays.asList(" + ",".join(lit(a, "String") for a in x) + ")"
    if t in ["ListNode", "TreeNode"]:
        return (
            ("list(" + lit(x, "int[]") + ")")
            if t == "ListNode"
            else "tree(" + lit(x, "Integer[]") + ")"
        )
    if t == "ListNode[]":
        return "new ListNode[]{" + ",".join(lit(a, "ListNode") for a in x) + "}"
    if t.endswith("[]"):
        return "new " + t + "{" + ",".join(lit(a, t[:-2]) for a in x) + "}"
    if t == "char":
        return "'" + str(x) + "'"
    return json.dumps(x, ensure_ascii=False)


def check(dest):
    n = int(dest.name.split("-")[-1])
    data = json.loads((dest / "data.json").read_text(encoding="utf8"))
    js = (dest / "app.js").read_text(encoding="utf8")
    snippets = json.loads(js[len("const snippets=") : js.index(";\nwindow")])
    java = "\n".join(snippets["Java"])
    code = [java.replace("public class Solution", "class Solution")]
    support = SUPPORT
    if n == 146:
        support = re.sub(r"class Node \{.*?\}\n", "", support)
    code.extend([support, "class Main {", HELPERS, "public static void main(String[] args) {"])
    if n not in [146, 155, 208, 295]:
        m = re.search(r"public\s+([\w<>\[\], ]+?)\s+(\w+)\(([^)]*)\)", java)
        assert m, (n, "method")
        ret, name, params = m.groups()
        types = [p.strip().rsplit(" ", 1)[0] for p in params.split(",") if p.strip()]
        names = [p.strip().rsplit(" ", 1)[1] for p in params.split(",") if p.strip()]
    for case in data["cases"]:
        d = case["input"]
        code.append("{")
        if "operations" in d:
            c = d["operations"][0]
            code.append(
                c
                + " s = new "
                + c
                + "("
                + ",".join(lit(v, "int") for v in d["arguments"][0])
                + "); List<Object> out = new ArrayList<>();out.add(null);"
            )
            for op, a in zip(d["operations"][1:], d["arguments"][1:]):
                call = (
                    "s."
                    + op
                    + "("
                    + ",".join(lit(v, "String" if isinstance(v, str) else "int") for v in a)
                    + ")"
                )
                code.append(
                    call + ";out.add(null);"
                    if op in ["put", "push", "pop", "insert", "addNum"]
                    else "out.add(" + call + ");"
                )
            code.append("System.out.println(json(out));")
        else:
            vals = list(d.values())
            for i, (t, p) in enumerate(zip(types, names)):
                if n == 160:
                    v = d["listA"] if i == 0 else d["listB"]
                elif n == 138:
                    v = d["head"]
                    code.append("Node[] nodes = new Node[" + str(len(v)) + "];")
                    for j, a in enumerate(v):
                        code.append(f"nodes[{j}] = new Node({a[0]});")
                    for j, a in enumerate(v):
                        if j + 1 < len(v):
                            code.append(f"nodes[{j}].next=nodes[{j+1}];")
                        if a[1] is not None:
                            code.append(f"nodes[{j}].random=nodes[{a[1]}];")
                    code.append("Node " + p + " = " + ("nodes[0]" if v else "null") + ";")
                    continue
                else:
                    v = d.get(p, vals[i])
                code.append(t + " " + p + " = " + lit(v, t) + ";")
            if n in [141, 142] and d["pos"] >= 0:
                code.append(f'at(head,{len(d["head"])-1}).next=at(head,{d["pos"]});')
            if n == 160 and d["intersectVal"]:
                if d["skipB"]:
                    code.append(f'at({names[1]},{d["skipB"]-1}).next=at({names[0]},{d["skipA"]});')
                else:
                    code.append(f'{names[1]}=at({names[0]},{d["skipA"]});')
            call = "new Solution()." + name + "(" + ",".join(names) + ")"
            if ret.strip() == "void":
                code.append(call + ";Object result=" + names[0] + ";")
            else:
                code.append("Object result=" + call + ";")
            if n == 142:
                code.append(
                    "Integer index=null;ListNode p=head;for(int i=0;i<"
                    + str(len(d["head"]))
                    + ";i++,p=p.next)if(p==result){index=i;break;}System.out.println(json(index));"
                )
            elif n == 160:
                code.append(
                    "if(result != "
                    + (f'at({names[0]},{d["skipA"]})' if d["intersectVal"] else "null")
                    + ')throw new RuntimeException("identity");System.out.println(result==null?"null":json(((ListNode)result).val));'
                )
            elif n == 138:
                code.append(
                    "List<Node> ns=new ArrayList<>();for(Node p=(Node)result;p!=null;p=p.next)ns.add(p);List<Object> out=new ArrayList<>();for(Node p:ns)out.add(Arrays.asList(p.val,p.random==null?null:ns.indexOf(p.random)));System.out.println(json(out));"
                )
            else:
                code.append("System.out.println(json(result));")
        code.append("}")
    code.append("}}")
    wd = ROOT / "test-results/java" / str(n)
    wd.mkdir(parents=True, exist_ok=True)
    (wd / "Main.java").write_text("\n".join(code), encoding="utf8")
    c = subprocess.run(
        ["javac", "-encoding", "UTF-8", "-g", "Main.java"],
        cwd=wd,
        capture_output=True,
        text=True,
        timeout=45,
    )
    assert c.returncode == 0, (n, c.stderr)
    r = subprocess.run(["java", "-cp", str(wd), "Main"], capture_output=True, text=True, timeout=15)
    assert r.returncode == 0, (n, r.stderr)
    results = [json.loads(x) for x in r.stdout.splitlines()]
    assert len(results) == len(data["cases"])
    for out, case in zip(results, data["cases"]):
        expected = case["expected"]
        if out is None and expected == []:
            out = []
        if n == 5:
            assert len(out) == len(expected) and out == out[::-1] and out in case["input"]["s"]
        elif n == 108:
            root = b.tree(out)

            def walk(p):
                return walk(p.left) + [p.val] + walk(p.right) if p else []

            assert walk(root) == case["input"]["nums"]

            def height(p):
                if not p:
                    return 0
                l, r = height(p.left), height(p.right)
                assert abs(l - r) <= 1
                return 1 + max(l, r)

            height(root)
        else:
            assert b.normalized(n, out) == b.normalized(n, expected), (n, out, expected)
    return n, len(results)


if __name__ == "__main__":
    failures = []
    passed = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        tasks = {
            pool.submit(check, p): p
            for p in (ROOT / "dist/problems").glob("hot100-*")
            if p.is_dir()
        }
        for future in concurrent.futures.as_completed(tasks):
            try:
                passed.append(future.result())
            except Exception as e:
                failures.append((tasks[future].name, str(e)))
                print("FAIL", failures[-1])
    (ROOT / "test-results/java-results.json").write_text(
        json.dumps({"passed": passed, "failures": failures}, ensure_ascii=False, indent=2),
        encoding="utf8",
    )
    print(
        "Java:",
        len(passed),
        "problems,",
        sum(x[1] for x in passed),
        "cases; failures:",
        len(failures),
    )
    if failures:
        sys.exit(1)
