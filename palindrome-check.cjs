const assert=require('node:assert/strict');
const {trace,snippets,highlightLines}=require('./dist/problems/palindrome/app.js');
function brute(s){if(!s)return [[]];const out=[];for(let mask=0;mask<2**(s.length-1);mask++){const parts=[];let start=0;for(let i=0;i<s.length;i++)if(i===s.length-1||mask&(1<<i)){parts.push(s.slice(start,i+1));start=i+1;}if(parts.every(t=>t===[...t].reverse().join('')))out.push(parts);}return out;}
for(let n=0;n<=5;n++)for(let mask=0;mask<2**n;mask++){
 const s=Array.from({length:n},(_,i)=>mask&(1<<i)?'a':'b').join(''),{events}=trace(s),end=events.at(-1);
 assert.deepEqual(end.ans.map(JSON.stringify).sort(),brute(s).map(JSON.stringify).sort());assert.deepEqual(end.path,[]);assert.deepEqual(end.stack,[]);
 for(const e of events){for(const lang of ['Python','Java'])assert.ok(snippets[lang][highlightLines[lang][e.line]]);if(e.line==='call')assert.equal(e.path.join('').length,e.candidate.j+1);if(e.line==='pop')assert.equal(e.path.join('').length,e.candidate.i);}
}
assert.deepEqual(trace('aab').events.at(-1).ans,[['a','a','b'],['aa','b']]);
assert.deepEqual(trace('aba').events.at(-1).ans,[['a','b','a'],['aba']]);
console.log('Passed: 63 palindrome inputs against independent cut masks, j+1, pop restoration and both language mappings.');
