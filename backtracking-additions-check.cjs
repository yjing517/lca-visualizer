const assert=require('node:assert/strict');const sum=require('./dist/problems/combination-sum3/app.js'),par=require('./dist/problems/parentheses/app.js');
const norm=a=>a.map(x=>Array.isArray(x)?[...x].sort((a,b)=>a-b).join(','):x).sort();
for(let k=2;k<=9;k++)for(let n=1;n<=60;n++){
 const expected=[];for(let mask=0;mask<512;mask++){const a=Array.from({length:9},(_,i)=>i+1).filter(x=>mask>>(x-1)&1);if(a.length===k&&a.reduce((a,b)=>a+b,0)===n)expected.push(a);}
 const d=sum.trace(k,n);assert.deepEqual(norm(d.answer),norm(expected));assert.deepEqual(d.events.at(-1).path,[]);assert.deepEqual(d.events.at(-1).stack,[]);
 for(const e of d.events)for(const lang of ['Python','Java'])assert.equal(typeof sum.snippets[lang][sum.highlightLines[lang][e.line]],'string');
}
for(let n=1;n<=5;n++){
 const expected=[];for(let mask=0;mask<1<<(2*n);mask++){let text='',balance=0,valid=true;for(let i=0;i<2*n;i++){const c=mask>>i&1?'(':')';balance+=c==='('?1:-1;text+=c;if(balance<0)valid=false;}if(valid&&balance===0)expected.push(text);}
 const d=par.trace(n);assert.deepEqual(norm(d.answer),norm(expected));assert.equal(new Set(d.answer).size,d.answer.length);
 for(const e of d.events){assert.ok(e.balance>=0);assert.ok(e.open<=n);for(const lang of ['Python','Java'])assert.equal(typeof par.snippets[lang][par.highlightLines[lang][e.line]],'string');}
 assert.deepEqual(d.events.at(-1).stack,[]);
}
assert.throws(()=>par.trace(6));assert.throws(()=>sum.trace(1,7));console.log('Passed: 480 sum cases vs all 9-bit selections; parentheses vs exhaustive strings, balance invariants, snapshots and both line maps.');
