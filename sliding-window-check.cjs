const assert=require('node:assert/strict');
const {trace,examples,snippets,highlightLines}=require('./dist/problems/sliding-window/app.js');
const brute=(a,k)=>a.slice(k-1).map((_,j)=>Math.max(...a.slice(j,j+k)));
let seed=239;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed;};
for(const {nums,k} of [...examples,...Array.from({length:200},()=>{const nums=Array.from({length:1+rand()%20},()=>rand()%21-10);return {nums,k:1+rand()%nums.length};})]){
 const {events}=trace(nums,k);assert.deepEqual(events.at(-1).ans,brute(nums,k));
 const inserted=new Set(),removed=new Set();
 for(const e of events){
  for(const lang of ['Python','Java'])assert.equal(typeof snippets[lang][highlightLines[lang][e.line]],'string');
  if(e.line==='append'){assert.ok(!inserted.has(e.i));inserted.add(e.i);}
  if(['pop','shift'].includes(e.line)){assert.ok(!removed.has(e.removed));removed.add(e.removed);}
  for(let j=1;j<e.queue.length;j++){assert.ok(e.queue[j]>e.queue[j-1]);assert.ok(nums[e.queue[j]]<nums[e.queue[j-1]]);}
  if(e.line==='save'){assert.ok(e.queue.every(j=>j>=e.i-k+1&&j<=e.i));assert.equal(nums[e.queue[0]],Math.max(...nums.slice(e.i-k+1,e.i+1)));}
 }
 assert.equal(inserted.size,nums.length);
}
assert.throws(()=>trace([1],2));console.log('Passed: 206 inputs vs brute force, queue ordering/expiry, one insertion/removal per index and code maps.');
