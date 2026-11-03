const assert=require('node:assert/strict');
const {trace,snippets,highlightLines}=require('../../dist/problems/combinations/app.js');
for(let n=1;n<=8;n++)for(let k=1;k<=n;k++){
 const {events}=trace(n,k),last=events.at(-1);let count=1;for(let j=1;j<=k;j++)count=count*(n-j+1)/j;
 assert.equal(last.ans.length,Math.round(count));assert.equal(new Set(last.ans.map(a=>a.join(','))).size,last.ans.length);
 assert.deepEqual(last.path,[]);assert.deepEqual(last.stack,[]);
 for(const a of last.ans){assert.equal(a.length,k);assert.ok(a.every((v,i)=>v>=1&&v<=n&&(!i||a[i-1]>v)));}
 for(const e of events){for(const lang of ['Python','Java'])assert.equal(typeof snippets[lang][highlightLines[lang][e.line]],'string');}
}
assert.deepEqual(trace(4,2).events.at(-1).ans,[[4,3],[4,2],[4,1],[3,2],[3,1],[2,1]]);
assert.throws(()=>trace(2,3));console.log('Passed: all 36 n/k pairs, counts, unique descending combinations, stack/path restoration and both language maps.');
