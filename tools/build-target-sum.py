"""Build 494 teaching snapshots by tracing the displayed Python implementation."""
from pathlib import Path
import builtins
import functools
import hashlib
import itertools
import json
import sys
import types

ROOT = Path(__file__).resolve().parents[1]
PYTHON = '''from functools import cache
from typing import List
class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        target += sum(nums)
        if target < 0 or target % 2:
            return 0
        target //= 2
        n = len(nums)
        @cache
        def dfs(i, c):
            if i < 0:
                return 1 if c == 0 else 0
            if c < nums[i]:
                return dfs(i - 1, c)
            return dfs(i - 1, c) + dfs(i - 1, c - nums[i])
        return dfs(n - 1, target)'''
JAVA = '''import java.util.HashMap;
import java.util.Map;
class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        int total = 0;
        for (int x : nums) total += x;
        target += total;
        if (target < 0 || target % 2 != 0) {
            return 0;
        }
        target /= 2;
        int n = nums.length;
        Map<String, Integer> memo = new HashMap<>();
        return dfs(n - 1, target, nums, memo);
    }
    private int dfs(int i, int c, int[] nums, Map<String, Integer> memo) {
        String key = i + "," + c;
        if (memo.containsKey(key)) {
            return memo.get(key);
        }
        int ways;
        if (i < 0) {
            ways = c == 0 ? 1 : 0;
        } else if (c < nums[i]) {
            ways = dfs(i - 1, c, nums, memo);
        } else {
            ways = dfs(i - 1, c, nums, memo) + dfs(i - 1, c - nums[i], nums, memo);
        }
        memo.put(key, ways);
        return ways;
    }
}'''
CASES = [
    ('official', '截图示例：五个 1，目标 3 → 5', [1, 1, 1, 1, 1], 3, 5),
    ('single', '单元素：[1]，目标 1 → 1', [1], 1, 1),
    ('negative', '负目标：[1]，目标 −1 → 1', [1], -1, 1),
    ('zeros', '零也有两种符号：[0,0,1]，目标 1 → 4', [0, 0, 1], 1, 4),
    ('all-zero', '全零：[0,0,0]，目标 0 → 8', [0, 0, 0], 0, 8),
    ('odd', '奇偶不符：[1,2]，目标 0 → 0', [1, 2], 0, 0),
    ('too-negative', '负容量：[1,2]，目标 −5 → 0', [1, 2], -5, 0),
    ('too-large', '容量超过总和：[1,2]，目标 7 → 0', [1, 2], 7, 0),
    ('skip-only', '有时只能不选：[2,3]，目标 −1 → 1', [2, 3], -1, 1),
]
FILENAME = '<target-sum-demo>'

def signature(source):
    return hashlib.sha256(source.encode('utf-8')).hexdigest()

def read_mapping():
    mapping = json.loads((ROOT / 'tools/target-sum-line-maps.json').read_text(encoding='utf-8'))
    assert mapping['pythonSha256'] == signature(PYTHON), 'Review Python changes and line mappings first'
    assert mapping['javaSha256'] == signature(JAVA), 'Review Java changes and line mappings first'
    return mapping

def trace_case(nums, target, mapping):
    events, memo = [], {}
    calls = hits = 0
    def stack_for(frame):
        stack = []
        while frame:
            if frame.f_code.co_filename == FILENAME and frame.f_code.co_name == 'dfs':
                stack.append([frame.f_locals['i'], frame.f_locals['c']])
            frame = frame.f_back
        return stack[::-1]
    def emit(line, kind, frame, value=None, extra_stack=None):
        local = frame.f_locals if frame else {}
        state = {key: local[key] for key in ('target', 'n', 'i', 'c') if key in local}
        events.append(dict(line=line, javaLine=mapping['cacheHitJava'] if kind == 'hit' else mapping['lines'][str(line)],
                           kind=kind, stack=stack_for(frame) + (extra_stack or []), state=state,
                           memo=dict(memo), calls=calls, hits=hits, value=value))
    def teaching_cache(function):
        cached = functools.cache(function)
        def wrapped(i, c):
            nonlocal hits
            key = f'{i},{c}'
            hit = key in memo
            result = cached(i, c)
            if hit:
                hits += 1
                emit(9, 'hit', sys._getframe(1), result, [[i, c]])
            return result
        return wrapped
    def importer(name, *args, **kwargs):
        if name == 'functools':
            return types.SimpleNamespace(cache=teaching_cache)
        return builtins.__import__(name, *args, **kwargs)
    namespace = {'__builtins__': dict(vars(builtins), __import__=importer)}
    exec(compile(PYTHON, FILENAME, 'exec'), namespace)
    def tracer(frame, event, arg):
        nonlocal calls
        if frame.f_code.co_filename != FILENAME or frame.f_code.co_name not in ('dfs', 'findTargetSumWays'):
            return tracer
        if event == 'call' and frame.f_code.co_name == 'dfs':
            calls += 1
            emit(10, 'call', frame)
        elif event == 'line':
            # CPython versions emit different decorator/definition bookkeeping lines.
            if frame.f_code.co_name != 'findTargetSumWays' or frame.f_lineno - 1 not in (9, 10):
                emit(frame.f_lineno - 1, 'line', frame)
        elif event == 'return':
            if frame.f_code.co_name == 'dfs':
                memo[f"{frame.f_locals['i']},{frame.f_locals['c']}"] = arg
                emit(frame.f_lineno - 1, 'return', frame, arg)
            else:
                emit(frame.f_lineno - 1, 'done', frame, arg)
        return tracer
    previous = sys.gettrace()
    try:
        sys.settrace(tracer)
        answer = namespace['Solution']().findTargetSumWays(nums[:], target)
    finally:
        sys.settrace(previous)
    return answer, events

def render_outputs():
    mapping = read_mapping()
    cases = []
    for key, label, nums, target, expected in CASES:
        answer, events = trace_case(nums, target, mapping)
        assert answer == expected, (key, answer, expected)
        combined = sum(nums) + target
        solutions = [' '.join(('+' if sign == 1 else '−') + str(x) for sign, x in zip(signs, nums)) + f' = {target}' for signs in itertools.product((1, -1), repeat=len(nums)) if sum(sign*x for sign, x in zip(signs, nums)) == target]
        assert len(solutions) == answer
        cases.append(dict(solutions=solutions, id=key, label=label, nums=nums, target=target, total=sum(nums), combined=combined,
                          capacity=combined//2 if combined >= 0 and combined % 2 == 0 else None,
                          answer=answer, events=events))
    data = dict(cases=cases)
    snippets = dict(Python=PYTHON.splitlines(), Java=JAVA.splitlines())
    return {
        'dist/problems/target-sum/app.js': '// Generated by tools/build-target-sum.py.\nconst snippets=' + json.dumps(snippets, ensure_ascii=False, indent=2) + ';\nif(typeof module!=="undefined")module.exports={snippets};\n',
        'dist/problems/target-sum/data.js': '// Actual execution of the displayed Python code; do not edit.\nwindow.TARGET_SUM_DATA=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n',
        'tools/traces/target-sum.json': json.dumps(data, ensure_ascii=False, indent=2) + '\n',
    }

if __name__ == '__main__':
    for name, content in render_outputs().items():
        path = ROOT / name
        if '--check' in sys.argv:
            assert path.read_text(encoding='utf-8') == content, f'Stale output: {name}'
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding='utf-8', newline='\n')
    print('Passed: 494 code signatures, 9 real Python execution traces and generated output consistency.')
