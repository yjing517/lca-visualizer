"""Check every matrix-zeroes variant in both languages against an independent oracle."""
import copy
import importlib.util
import itertools
import json
import pathlib
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('matrix_builder', ROOT/'tools/build-matrix-zeroes.py')
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)
baseline_text = (b.OUT/'app.js').read_text(encoding='utf8')
baseline = json.JSONDecoder().raw_decode(baseline_text[len('const snippets='):])[0]
sources = {'marks': {'Python':'\n'.join(baseline['Python']), 'Java':'\n'.join(baseline['Java'])}}
for key, (py, java, mapping, title, meaning) in b.SPECS.items():
    sources[key] = {'Python':py,'Java':java}
    expected = {'Python':py.splitlines(),'Java':java.splitlines()}
    actual = json.JSONDecoder().raw_decode((b.OUT/key/'app.js').read_text(encoding='utf8')[len('const snippets='):])[0]
    assert expected == actual, (key,'stale code')
    data = json.loads((ROOT/'tools/traces'/f'hot100-73-{key}.json').read_text(encoding='utf8'))
    assert (b.OUT/key/'data.js').read_text(encoding='utf8') == 'window.HOT100_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n'
    for c in data['cases']:
        result,events=b.execute(key,c['input']['matrix'],True)
        assert result == c['expected'] == c['result'] == b.oracle(c['input']['matrix'])
        assert events == c['events'], (key,'stale trace')

cases=copy.deepcopy(b.CASES)
for m in range(1,4):
    for n in range(1,4):
        for bits in itertools.product([0,1],repeat=m*n):
            cases.append([[0 if bits[i*n+j]==0 else i*n+j+1 for j in range(n)] for i in range(m)])
payload='\n'.join(' '.join(map(str,[len(a),len(a[0])]+[x for row in a for x in row])) for a in cases)
for key, langs in sources.items():
    scope={}
    exec(langs['Python'],scope)
    for a in cases:
        actual=copy.deepcopy(a)
        assert scope['Solution']().setZeroes(actual) is None
        assert actual == b.oracle(a), (key,a,actual)
    # Feed all cases through one Java process, without a giant generated method.
    harness='''
class Main {
    public static void main(String[] args) {
        java.util.Scanner in = new java.util.Scanner(System.in);
        while (in.hasNextInt()) {
            int m=in.nextInt(), n=in.nextInt();
            int[][] a=new int[m][n];
            for(int i=0;i<m;i++) for(int j=0;j<n;j++) a[i][j]=in.nextInt();
            new Solution().setZeroes(a);
            System.out.println(java.util.Arrays.deepToString(a));
        }
    }
}'''
    with tempfile.TemporaryDirectory(prefix='matrix-zeroes-') as tmp:
        p=pathlib.Path(tmp)
        (p/'Main.java').write_text(langs['Java']+'\n'+harness,encoding='utf8')
        subprocess.run(['javac','-encoding','UTF-8',str(p/'Main.java')],check=True,capture_output=True,text=True)
        r=subprocess.run(['java','-cp',tmp,'Main'],input=payload,capture_output=True,text=True,check=True)
        actuals=[json.loads(line) for line in r.stdout.splitlines()]
        assert len(actuals)==len(cases)
        for a,actual in zip(cases,actuals): assert actual==b.oracle(a), (key,a,actual)
    print(f'{key}: Python + Java passed {len(cases)} matrices; generated traces checked.')
