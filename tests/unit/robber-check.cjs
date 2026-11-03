const assert=require('node:assert/strict');
const {trace,snippets,highlightLines}=require('../../dist/problems/robber/app.js');
function brute(a){let best=0;for(let mask=0;mask<1<<a.length;mask++){if(mask&(mask<<1))continue;let total=0;for(let i=0;i<a.length;i++)if(mask>>i&1)total+=a[i];best=Math.max(best,total);}return best;}
for(let n=0;n<=6;n++)for(let seed=0;seed<20;seed++){
 const a=Array.from({length:n},(_,i)=>(seed*7+i*3)%11),d=trace(a);
 assert.equal(d.events.at(-1).answer,brute(a));assert.deepEqual(d.events.at(-1).stack,[]);
 for(const e of d.events)for(const lang of ['Python','Java'])assert.equal(typeof snippets[lang][highlightLines[lang][e.line]],'string');
}
assert.equal(trace([1,2,3,1]).events.at(-1).answer,4);assert.equal(trace([2,7,9,3,1]).events.at(-1).answer,12);
for(const bad of [[-1],[401],Array(9).fill(1),[1.5]])assert.throws(()=>trace(bad));
console.log('Passed: robber recurrence against exhaustive non-adjacent selections, examples, boundaries and line maps.');
