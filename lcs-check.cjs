const assert=require('node:assert/strict');
const {trace,snippets,highlightLines}=require('./dist/problems/lcs/app.js');
function brute(s,t){let best=0;for(let mask=0;mask<2**s.length;mask++){let k=0,length=0;for(let i=0;i<s.length;i++)if(mask&(1<<i)){while(k<t.length&&t[k]!==s[i])k++;if(k===t.length){length=-1;break;}k++;length++;}best=Math.max(best,length);}return best;}
const words=[''];for(let n=1;n<=3;n++)for(let mask=0;mask<2**n;mask++)words.push(Array.from({length:n},(_,i)=>mask&(1<<i)?'a':'b').join(''));
for(const s of words)for(const t of words){const {events,answer}=trace(s,t);assert.equal(answer,brute(s,t));for(const e of events){for(const lang of ['Python','Java'])assert.ok(snippets[lang][highlightLines[lang][e.line]]);if(e.line==='save')assert.equal(e.tmp,e.sources.up);if(e.line==='update'){assert.equal(e.f[e.j+1],e.table[e.i+1][e.j+1]);assert.equal(e.f[e.j+1],s[e.i]===t[e.j]?e.sources.diagonal+1:Math.max(e.sources.up,e.sources.left));}if(e.line==='move')assert.equal(e.pre,e.sources.up);}}
for(const [s,t,n] of [['abcde','ace',3],['abc','abc',3],['abc','def',0],['a','aa',1],['ab','ba',1]])assert.equal(trace(s,t).answer,n);
console.log('Passed: 225 LCS inputs against brute subsequences, source values, tmp/pre ordering and language maps.');
