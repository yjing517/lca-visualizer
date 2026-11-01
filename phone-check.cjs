const assert=require('node:assert/strict');
const {trace,snippets,highlightLines}=require('./dist/problems/phone/app.js');
for(const [input,expected] of [['',[]],['2',['a','b','c']],['23',['ad','ae','af','bd','be','bf','cd','ce','cf']],['79',Array.from('pqrs',a=>Array.from('wxyz',b=>a+b)).flat()]]){
 const {events}=trace(input);
 assert.deepEqual(events.at(-1).ans,expected);assert.deepEqual(events.at(-1).stack,[]);
 for(const e of events)for(const lang of ['Python','Java'])assert.ok(snippets[lang][highlightLines[lang][e.line]]);
 const saved=events.filter(e=>e.line==='save');for(const e of saved)assert.equal(e.ans.at(-1),e.path.join(''));
}
const e=trace('23').events,first=e.findIndex(x=>x.line==='save');
assert.deepEqual(e[first].path,['a','d']);assert.deepEqual(e[first+2].stack,[0,1]);
assert.equal(trace('9999').events.at(-1).ans.length,256);
assert.throws(()=>trace('10'));
console.log('Passed: phone combinations, empty input, 4-letter keys, return stack and code mappings.');
