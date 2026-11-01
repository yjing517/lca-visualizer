function trace(s,t){
 if(typeof s!=='string'||typeof t!=='string'||!/^[a-z]{0,8}$/.test(s)||!/^[a-z]{0,8}$/.test(t))throw Error('演示使用至多八个小写字母');
 const n=s.length,m=t.length,f=Array(m+1).fill(0),table=Array.from({length:n+1},(_,r)=>Array.from({length:m+1},(_,c)=>r===0||c===0?0:null)),events=[];
 let i=-1,j=-1,pre=null,tmp=null,sources=null,written=0;
 const emit=(line,message)=>events.push({line,message,i,j,pre,tmp,sources:sources&&{...sources},written,f:[...f],table:table.map(r=>[...r])});
 emit('init',`f 有 m+1=${m+1} 个位置。第 0 格表示 t 的空前缀，始终是 0；二维表的空行、空列也为 0。`);
 for(i=0;i<n;i++){
  j=-1;written=0;sources=null;tmp=null;emit('row',`外层取 s[${i}]='${s[i]}'，准备计算 D[${i+1}] 这一行。f 此时整行还是上一行。`);
  pre=f[0];emit('reset','每一行开始，pre = f[0] = 0，代表这一行第一个待填格左上角的旧值。');
  for(j=0;j<m;j++){
   sources={up:f[j+1],left:f[j],diagonal:pre};tmp=null;
   emit('column',`比较 s[${i}]='${s[i]}' 与 t[${j}]='${t[j]}'，计算两个前缀的 LCS 长度 D[${i+1}][${j+1}]。`);
   tmp=f[j+1];emit('save',`先把旧 f[${j+1}]=${tmp} 存到 tmp。它是上方 D[${i}][${j+1}]；覆盖后，下一列还要把它当左上角。`);
   f[j+1]=s[i]===t[j]?pre+1:Math.max(f[j+1],f[j]);table[i+1][j+1]=f[j+1];written=j+1;
   emit('update',s[i]===t[j]?`字符相同，把它接在更短前缀的公共子序列后面：左上角 ${sources.diagonal} + 1 = ${f[j+1]}。`:`字符不同，至少跳过其中一个末尾字符：max(上方 ${sources.up}, 左方 ${sources.left}) = ${f[j+1]}。取最大，不相加。`);
   pre=tmp;emit('move',`pre = tmp = ${pre}。这是刚才的上方旧值，将成为下一列的左上角；不能用已经更新的 f[${j+1}]=${f[j+1]} 代替。`);
  }
 }
 i=-1;j=-1;sources=null;emit('done',`返回 f[m] = ${f[m]}，即两个完整字符串的最长公共子序列长度。它不要求连续，但必须保持相对顺序。`);
 return {events,answer:f[m]};
}
const snippets={Python:[
 'class Solution:',
 '    def longestCommonSubsequence(self, s: str, t: str) -> int:',
 '        n, m = len(s), len(t)',
 '        f = [0] * (m + 1)',
 '        for i, x in enumerate(s):',
 '            pre = f[0]  # 每行重新设为 0',
 '            for j, y in enumerate(t):',
 '                tmp = f[j + 1]  # 先保存上方旧值',
 '                f[j + 1] = pre + 1 if x == y else max(f[j + 1], f[j])',
 '                pre = tmp  # 供下一列使用',
 '        return f[m]'
],Java:[
 'class Solution {',
 '    public int longestCommonSubsequence(String s, String t) {',
 '        int n = s.length(), m = t.length();',
 '        int[] f = new int[m + 1];',
 '        for (int i = 0; i < n; i++) {',
 '            int pre = f[0];',
 '            for (int j = 0; j < m; j++) {',
 '                int tmp = f[j + 1];',
 '                f[j + 1] = s.charAt(i) == t.charAt(j)',
 '                    ? pre + 1 : Math.max(f[j + 1], f[j]);',
 '                pre = tmp;',
 '            }',
 '        }',
 '        return f[m];',
 '    }',
 '}'
]};
const highlightLines={Python:{init:3,row:4,reset:5,column:6,save:7,update:8,move:9,done:10},Java:{init:3,row:4,reset:5,column:6,save:7,update:8,move:10,done:13}};
if(typeof module!=='undefined')module.exports={trace,snippets,highlightLines};
if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id);let data,index=0,timer=null,s,t;
 function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
 function render(){
  const e=data.events[index],lang=$('lang').value;
  const cells=e.table.map((row,r)=>'<tr><th scope="row">'+(r?s[r-1]+' · '+r:'∅ · 0')+'</th>'+row.map((v,c)=>{let cls='';if(e.sources){if(r===e.i+1&&c===e.j+1)cls='current';else if(r===e.i&&c===e.j)cls='diagonal';else if(r===e.i&&c===e.j+1)cls='upper';else if(r===e.i+1&&c===e.j)cls='left';}return '<td class="'+cls+'">'+(v===null?'·':v)+'</td>';}).join('')+'</tr>').join('');
  $('grid').innerHTML='<table><caption>D[r][c] = s 前 r 个字符与 t 前 c 个字符的 LCS 长度</caption><thead><tr><th>s ↓ / t →</th><th>∅ · 0</th>'+[...t].map((c,j)=>'<th>'+c+' · '+(j+1)+'</th>').join('')+'</tr></thead><tbody>'+cells+'</tbody></table>';
  $('array').innerHTML=e.f.map((v,c)=>'<div class="slot '+(e.line==='done'||(e.i>=0&&c<=e.written)?'new':'old')+'"><small>f['+c+']</small><b>'+v+'</b><small>'+(e.line==='done'?'最终行':e.i<0?'初始行':c<=e.written?'当前行':'上一行')+'</small></div>').join('');
  $('variables').textContent='i = '+(e.i<0?'—':e.i)+'，j = '+(e.j<0?'—':e.j)+'，pre = '+(e.pre??'—')+'，tmp = '+(e.tmp??'—');
  $('formula').textContent=e.sources?'本格使用的来源：左上 '+e.sources.diagonal+'（pre），上 '+e.sources.up+'（覆盖前 f[j+1]），左 '+e.sources.left+'（已更新 f[j]）':'先看二维表，再看同一行如何压缩进 f。';
  $('code').replaceChildren(...snippets[lang].map((line,i)=>{const el=document.createElement('div');el.className='line'+(highlightLines[lang][e.line]===i?' on':'');const num=document.createElement('span');num.className='num';num.textContent=i+1;el.append(num,document.createTextNode(line));return el;}));
  $('phase').textContent='当前操作 / '+e.line;$('message').textContent=e.message;$('result').textContent=e.line==='done'?'LCS 长度 = '+data.answer:'正在计算前缀';
  $('counter').textContent=index+' / '+(data.events.length-1);$('seek').value=index;$('prev').disabled=index===0;$('next').disabled=index===data.events.length-1;
 }
 function reset(){stop();[s,t]=JSON.parse($('example').value);data=trace(s,t);index=0;$('seek').max=data.events.length-1;render();}
 function step(d){index=Math.max(0,Math.min(data.events.length-1,index+d));render();if(index===data.events.length-1)stop();}
 $('next').onclick=()=>{stop();step(1)};$('prev').onclick=()=>{stop();step(-1)};$('reset').onclick=reset;$('seek').oninput=()=>{stop();index=+$('seek').value;render()};$('example').onchange=reset;$('lang').onchange=render;
 $('play').onclick=()=>{if(timer)return stop();if(index===data.events.length-1)index=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>step(1),+$('speed').value)};$('speed').onchange=()=>{if(timer){stop();$('play').click()}};reset();
 if(window.parent!==window){const report=()=>window.parent.postMessage({type:'algorithm-demo-ready',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');new ResizeObserver(report).observe(document.body);report();}
}
