const assert=require('node:assert/strict');
const {trace,snippets,highlightLines}=require('./dist/problems/subsets/app.js');
for(const nums of [[],[0],[1,2],[1,2,3],[-1,2],Array.from({length:10},(_,i)=>i)]){
 const {events}=trace(nums),last=events.at(-1);
 assert.equal(last.ans.length,2**nums.length);assert.deepEqual(last.path,[]);assert.deepEqual(last.stack,[]);
 const expected=Array.from({length:2**nums.length},(_,mask)=>nums.filter((_,i)=>mask&(1<<i))).map(JSON.stringify).sort();
 assert.deepEqual(last.ans.map(JSON.stringify).sort(),expected);
 for(const e of events){
  for(const lang of ['Python','Java'])assert.ok(snippets[lang][highlightLines[lang][e.line]]);
  if(e.line==='pop')assert.deepEqual(e.path,events.find(x=>x.node===e.node&&x.line==='check').path);
 }
}
const events=trace([1,2]).events,saves=events.filter(x=>x.line==='copy');
assert.deepEqual(saves.map(x=>x.path),[[],[2],[1],[1,2]]);
assert.deepEqual(saves.at(-1).ans.at(-1),[1,2]);assert.deepEqual(events.at(-1).ans.at(-1),[1,2]);
const shared=[],wrong=[];wrong.push(shared);shared.push(1);assert.deepEqual(wrong,[[1]]);shared.pop();assert.deepEqual(wrong,[[]]);
assert.throws(()=>trace([1,1]));
console.log('Passed: subsets, branch order, restoration after pop, copy stability and code mappings.');
