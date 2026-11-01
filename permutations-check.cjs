const assert=require('node:assert/strict');
const {trace,snippets,highlightLines}=require('./dist/problems/permutations/app.js');
for(const nums of [[1],[0,1],[1,2,3],[-1,0,2],[3,1,2],[1,2,3,4],[1,2,3,4,5],[1,2,3,4,5,6]]){
 const {events}=trace(nums),last=events.at(-1);const factorial=nums.reduce((a,_,i)=>a*(i+1),1);
 assert.equal(last.ans.length,factorial);assert.equal(new Set(last.ans.map(a=>JSON.stringify(a))).size,factorial);
 for(const a of last.ans)assert.deepEqual([...a].sort((a,b)=>a-b),[...nums].sort((a,b)=>a-b));
 assert.deepEqual(last.stack,[]);
 for(const e of events){for(const lang of ['Python','Java'])assert.equal(typeof snippets[lang][highlightLines[lang][e.line]],'string');if(!['assign','done'].includes(e.line)){assert.equal(new Set(e.path.slice(0,e.i)).size,e.i);assert.deepEqual([...e.s].sort((a,b)=>a-b),nums.filter(x=>!e.path.slice(0,e.i).includes(x)).sort((a,b)=>a-b));}}
}
assert.deepEqual(trace([0,1]).events.at(-1).ans,[[0,1],[1,0]]);
assert.throws(()=>trace([1,1]));assert.throws(()=>trace([]));assert.throws(()=>trace([11]));
console.log('Passed: permutation counts through 6!, uniqueness, exact membership, prefix/candidate invariants and language mappings.');
