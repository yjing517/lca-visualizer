"""Additional 73 teaching solutions: actual Python traces, explicit Java line maps.

Keep the existing row/column-array solution intact. Run this after build-hot100.py.
"""
import copy
import itertools
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist/problems/hot100-73'

COPY = '''from typing import List

class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        m, n = len(matrix), len(matrix[0])
        original = [row[:] for row in matrix]
        for i in range(m):
            if 0 in original[i]:
                for j in range(n):
                    matrix[i][j] = 0
        for j in range(n):
            if any(original[i][j] == 0 for i in range(m)):
                for i in range(m):
                    matrix[i][j] = 0
'''
COPY_JAVA = '''class Solution {
    public void setZeroes(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        int[][] original = new int[m][];
        for (int r = 0; r < m; r++) original[r] = matrix[r].clone();
        for (int i = 0; i < m; i++) {
            boolean zero = false;
            for (int j = 0; j < n; j++) {
                if (original[i][j] == 0) zero = true;
            }
            if (zero) {
                for (int j = 0; j < n; j++) matrix[i][j] = 0;
            }
        }
        for (int j = 0; j < n; j++) {
            boolean zero = false;
            for (int i = 0; i < m; i++) {
                if (original[i][j] == 0) zero = true;
            }
            if (zero) {
                for (int i = 0; i < m; i++) matrix[i][j] = 0;
            }
        }
    }
}'''
CONSTANT = '''from typing import List

class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        m, n = len(matrix), len(matrix[0])
        first_row_zero = False
        first_col_zero = False
        for j in range(n):
            if matrix[0][j] == 0:
                first_row_zero = True
        for i in range(m):
            if matrix[i][0] == 0:
                first_col_zero = True
        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][j] == 0:
                    matrix[i][0] = 0
                    matrix[0][j] = 0
        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][0] == 0 or matrix[0][j] == 0:
                    matrix[i][j] = 0
        if first_row_zero:
            for j in range(n):
                matrix[0][j] = 0
        if first_col_zero:
            for i in range(m):
                matrix[i][0] = 0
'''
CONSTANT_JAVA = '''class Solution {
    public void setZeroes(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        boolean first_row_zero = false;
        boolean first_col_zero = false;
        for (int j = 0; j < n; j++) {
            if (matrix[0][j] == 0) first_row_zero = true;
        }
        for (int i = 0; i < m; i++) {
            if (matrix[i][0] == 0) first_col_zero = true;
        }
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][j] == 0) {
                    matrix[i][0] = 0;
                    matrix[0][j] = 0;
                }
            }
        }
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][0] == 0 || matrix[0][j] == 0) {
                    matrix[i][j] = 0;
                }
            }
        }
        if (first_row_zero) {
            for (int j = 0; j < n; j++) matrix[0][j] = 0;
        }
        if (first_col_zero) {
            for (int i = 0; i < m; i++) matrix[i][0] = 0;
        }
    }
}'''

# Zero-based Python line -> zero-based Java logical line, manually reviewed.
SPECS = {
    'copy': (COPY, COPY_JAVA, [2, 4, 5, 8, 11, 11, 14, 17, 20, 20],
             '复制原矩阵', 'original 始终不变，只根据原始零修改 matrix；新写入的零不会成为依据。'),
    'constant': (CONSTANT, CONSTANT_JAVA,
        [2,3,4,5,6,6,8,9,9,11,12,13,14,15,19,20,21,22,26,27,27,29,30,30],
        '首行首列标记 · 常量空间', '首列 matrix[i][0] 标记第 i 行，首行 matrix[0][j] 标记第 j 列。两个布尔量只保存首行、首列原本是否有零；最后再清理它们。'),
}
CASES = [
    [[1,1,1],[1,0,1],[1,1,1]],
    [[0,1,2,0],[3,4,5,2],[1,3,1,5]],
    [[1,0,3],[4,5,6],[7,8,9]],
    [[1,2,3],[0,5,6],[7,8,9]],
    [[1,0,3]], [[1],[0],[3]], [[0]], [[1,2],[3,4]],
    [[0,0],[0,0]], [[-2147483648,1],[2,2147483647]],
]

def oracle(a):
    rows = {i for i,row in enumerate(a) if 0 in row}
    cols = {j for row in a for j,x in enumerate(row) if x == 0}
    return [[0 if i in rows or j in cols else x for j,x in enumerate(row)] for i,row in enumerate(a)]

def explanation(key, line):
    if key == 'copy':
        if line <= 5: return '逐行复制列表；original 和 matrix 的每一行都独立，后续写入不会改变原矩阵副本。'
        if line <= 9: return '扫描原始行：0 in original[i] 检查这一行是否含零，若含零则清空 matrix 的同一行。'
        return '逐列检查原始副本。any(...) 表示只要该列至少一个原始值为零，就清空 matrix 的这一列；生成器不会创建列表。'
    if line <= 12: return '阶段 1：保存首行、首列原本是否有零。此时还没有向矩阵写入标记。'
    if line <= 17: return '阶段 2：只扫描内部区域。遇到原始零，把对应首列格和首行格写零作为行列标记。'
    if line <= 21: return '阶段 3：根据首行、首列标记清理内部。内部写零不会破坏边界标记。'
    return '阶段 4：内部已经处理完，再根据两个布尔量清理首行、首列。不可提前清空标记。'

def execute(key, a, trace=False):
    py, java, mapping, title, meaning = SPECS[key]
    filename = f'<matrix-{key}>'
    scope = {}
    exec(compile(py, filename, 'exec'), scope)
    matrix = copy.deepcopy(a)
    events = []
    def record(frame, kind, arg):
        if frame.f_code.co_filename != filename or frame.f_code.co_name != 'setZeroes': return record
        if kind == 'line':
            line = frame.f_lineno-1
            vars_ = copy.deepcopy({k:v for k,v in frame.f_locals.items() if k != 'self'})
            events.append(dict(line=line, javaLine=mapping[line-4], stack=[dict(name='setZeroes',vars=vars_)],nodes={},phase='执行前',action=('读取原始副本' if key == 'copy' else explanation(key,line).split('：')[0]),explanation=explanation(key,line)))
        return record
    old = sys.gettrace()
    try:
        if trace: sys.settrace(record)
        scope['Solution']().setZeroes(matrix)
    finally: sys.settrace(old)
    assert matrix == oracle(a), (key,a,matrix)
    if trace:
        end = copy.deepcopy(events[-1])
        end.update(phase='完成',result=matrix)
        end['stack'][0]['vars']['matrix'] = matrix
        events.append(end)
    return matrix,events

def build():
    template = (OUT/'index.html').read_text(encoding='utf8')
    # Do not copy the baseline's extension link back into every child demo.
    template = template.replace('<p class="matrix-extension"><a href="optimizations.html">扩展：对照三种优化方案 →</a></p>', '')
    for key,(py,java,mapping,title,meaning) in SPECS.items():
        assert len(mapping) == len(py.splitlines())-4
        assert all(0 <= x < len(java.splitlines()) for x in mapping)
        dest = OUT/key
        dest.mkdir(exist_ok=True)
        data = dict(number=73,title='矩阵置零 · '+title,category='矩阵',focus=['matrix','original','first_row_zero','first_col_zero'],cursors={},meaning=meaning,cases=[])
        for i,a in enumerate(CASES):
            result,events=execute(key,a,True)
            data['cases'].append(dict(input={'matrix':a},expected=oracle(a),result=result,events=events,boundary=i>=2))
        text=json.dumps(data,ensure_ascii=False,separators=(',',':'))
        (dest/'data.json').write_text(text,encoding='utf8')
        (dest/'data.js').write_text('window.HOT100_DATA='+text+';\n',encoding='utf8')
        (dest/'app.js').write_text('const snippets='+json.dumps({'Python':py.splitlines(),'Java':java.splitlines()},ensure_ascii=False)+';\nwindow.HOT100_SNIPPETS=snippets;\n',encoding='utf8')
        page=template.replace('../bottom-left/','../../bottom-left/').replace('../hot100-','../../hot100-')
        page=page.replace('先保存哪些行列需要清零，再统一修改；边扫描边清零会污染判断。',meaning)
        if key == 'constant':
            page = page.replace('</head>', '<style>.matrix tbody tr:first-child td:not(.changed),.matrix tbody td:first-of-type:not(.changed){background:#fff0d4}</style></head>')
            page = page.replace('<div class="toolbar">', '<p class="trace-note">浅黄色首行、首列是标记区；绿色边框表示刚发生的变化。先保存两个布尔量，最后再清理标记区。</p><div class="toolbar">', 1)
        (dest/'index.html').write_text(page,encoding='utf8')
    # Exhaust all placements of zeros through 3x3, with varied nonzero values.
    count=0
    for m in range(1,4):
        for n in range(1,4):
            for bits in itertools.product([0,1],repeat=m*n):
                a=[[0 if bits[i*n+j]==0 else i*n+j+1 for j in range(n)] for i in range(m)]
                for key in SPECS: execute(key,a)
                count+=1
    print(f'Matrix variants built; {count} exhaustive matrices per new solution passed.')

if __name__ == '__main__': build()
