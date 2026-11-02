function trace(n){
 if(!Number.isInteger(n)||n<1||n>5)throw Error('演示范围 1≤n≤5');
 const col=Array(n).fill(0),placed=Array(n).fill(-1),used=Array(n).fill(false),d1=Array(2*n-1).fill(false),d2=Array(2*n-1).fill(false),ans=[],events=[],stack=[];
 let rows=[];
 const emit=(line,message,r=0,c=null,buildRow=null)=>events.push({line,message,r,c,buildRow,col:[...col],placed:[...placed],used:[...used],d1:[...d1],d2:[...d2],rows:[...rows],ans:ans.map(b=>[...b]),stack:[...stack]});
 emit('start','每层决定一行，只记录列位置 col[r]；找到完整方案后才转为棋盘字符串。');
 function dfs(r){stack.push(r);emit('check',`进入 dfs(${r})，检查是否放满 ${n} 行。`,r);
  if(r===n){rows=[];for(let row=0;row<n;row++){const c=col[row];rows.push('.'.repeat(c)+'Q'+'.'.repeat(n-1-c));emit('build',`第 ${row} 行：c=col[${row}]=${c}；${c} 个点 + Q + ${n-1-c} 个点 → ${rows[row]}。for c in col 按行依次读取列号。`,r,c,row);}ans.push([...rows]);emit('save','把整个棋盘列表加入 ans，作为一个独立方案；字符串不会被后续覆盖改变。',r);emit('return','只返回父调用，父层随后撤销占用标记。',r);stack.pop();return;}
  for(let c=0;c<n;c++){
   emit('loop',`尝试第 ${r} 行第 ${c} 列。`,r,c);const a=r+c,b=r-c+n-1;
   emit('test',`检查列 ${c}、r+c=${a}、r−c=${r-c} 是否已占用。`,r,c);
   if(used[c]||d1[a]||d2[b]){emit('blocked','存在同列或对角线冲突，跳过此格，尝试下一列。',r,c);continue;}
   col[r]=c;emit('record',`col[${r}]=${c}：记录这一行的皇后列号；这时还没有生成字符串。`,r,c);
   used[c]=d1[a]=d2[b]=true;placed[r]=c;emit('mark','标记列及两条对角线，保护后续行不受攻击。',r,c);emit('call',`调用 dfs(${r+1}) 放下一行。`,r,c);dfs(r+1);
   used[c]=d1[a]=d2[b]=false;placed[r]=-1;emit('unmark','子调用返回，恢复三个占用标记。col 的旧值可保留，下一分支会覆盖。',r,c);
  }
  emit('end','本行所有列已尝试，返回上一行继续搜索。',r);stack.pop();
 }
 dfs(0);emit('done',`完成：${ans.length} 种方案。`);return {events,answer:ans};
}
const snippets={"Python": ["from typing import List", "class Solution:", "    def solveNQueens(self, n: int) -> List[List[str]]:", "        ans = []", "        col = [0] * n", "        on_path = [False] * n", "        m = 2 * n - 1", "        diag1 = [False] * m", "        diag2 = [False] * m", "        def dfs(r):", "            if r == n:", "                ans.append(['.' * c + 'Q' + '.' * (n - 1 - c) for c in col])", "                return", "            for c in range(n):", "                if not on_path[c] and not diag1[r+c] and not diag2[r-c]:", "                    col[r] = c", "                    on_path[c] = diag1[r+c] = diag2[r-c] = True", "                    dfs(r + 1)", "                    on_path[c] = diag1[r+c] = diag2[r-c] = False", "        dfs(0)", "        return ans"], "Java": ["import java.util.ArrayList;", "import java.util.List;", "class Solution {", "    public List<List<String>> solveNQueens(int n) {", "        List<List<String>> ans = new ArrayList<>();", "        dfs(0, n, new int[n], new boolean[n], new boolean[2*n-1], new boolean[2*n-1], ans);", "        return ans;", "    }", "    private void dfs(int r, int n, int[] col, boolean[] used, boolean[] d1, boolean[] d2, List<List<String>> ans) {", "        if (r == n) {", "            List<String> board = new ArrayList<>();", "            for (int c : col) {", "                board.add(\".\".repeat(c) + \"Q\" + \".\".repeat(n - 1 - c));", "            }", "            ans.add(board);", "            return;", "        }", "        for (int c = 0; c < n; c++) {", "            int a = r + c, b = r - c + n - 1;", "            if (!used[c] && !d1[a] && !d2[b]) {", "                col[r] = c;", "                used[c] = d1[a] = d2[b] = true;", "                dfs(r + 1, n, col, used, d1, d2, ans);", "                used[c] = d1[a] = d2[b] = false;", "            }", "        }", "    }", "}"]};
const highlightLines={"Python": {"start": 3, "check": 10, "build": 11, "save": 11, "loop": 13, "test": 14, "blocked": 14, "record": 15, "mark": 16, "call": 17, "unmark": 18, "end": 13, "done": 20, "return": 12}, "Java": {"start": 3, "check": 9, "build": 12, "save": 14, "loop": 17, "test": 19, "blocked": 19, "record": 20, "mark": 21, "call": 22, "unmark": 23, "end": 25, "done": 6, "return": 15}};
if(typeof module!=='undefined')module.exports={trace,snippets,highlightLines};
if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id);let data,index=0,timer=null;
 function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
 function render(){const e=data.events[index],lang=$('lang').value,n=Number($('example').value);
 $('code').replaceChildren(...snippets[lang].map((line,i)=>{const el=document.createElement('div');el.className='line'+(highlightLines[lang][e.line]===i?' on':'');el.textContent=(i+1).toString().padStart(2)+'  '+line;return el;}));
 $('board').style.gridTemplateColumns=`repeat(${n},1fr)`;$('board').replaceChildren(...Array.from({length:n*n},(_,i)=>{const r=Math.floor(i/n),c=i%n,el=document.createElement('div');el.className='square '+((r+c)%2?'dark':'light');if(r===e.r&&c===e.c)el.classList.add('candidate');if(e.placed[r]===c)el.textContent='♛';else if(e.placed.some((q,k)=>q>=0&&(k===r||q===c||Math.abs(k-r)===Math.abs(q-c))))el.textContent='·';el.setAttribute('aria-label',`第 ${r} 行第 ${c} 列`);return el;}));
 $('slots').textContent='col = '+JSON.stringify(e.col)+'（仅有皇后的行有效，旧值待覆盖）';
 $('state').textContent=`当前行 r=${e.r}；候选 c=${e.c??'—'}；占用列：${e.used.flatMap((v,i)=>v?[i]:[]).join(', ')||'无'}`;
 $('frames').textContent=e.stack.length?e.stack.map(r=>'dfs('+r+')').join(' → ')+' ← 栈顶':'∅ 空栈';
 $('conversion').textContent=e.line==='build'?`c = col[${e.buildRow}] = ${e.c}
'.' × ${e.c} + 'Q' + '.' × ${n-1-e.c}
→ ${e.rows.at(-1)}`:'完整方案出现时，会在这里逐行展示 col → 棋盘字符串。';
 $('preview').textContent=e.rows.join('\n');$('answers').textContent='已保存 '+e.ans.length+' 个方案'+(e.ans.length?'；最近方案：\n'+e.ans.at(-1).join('\n'):'');
 $('message').textContent=e.message;$('phase').textContent='当前操作 / '+e.line;$('counter').textContent=index+' / '+(data.events.length-1);$('seek').value=index;$('prev').disabled=index===0;$('next').disabled=index===data.events.length-1;
 }
 function reset(){stop();data=trace(Number($('example').value));index=0;$('seek').max=data.events.length-1;render();}
 function step(d){index=Math.max(0,Math.min(data.events.length-1,index+d));render();if(index===data.events.length-1)stop();}
 $('next').onclick=()=>{stop();step(1)};$('prev').onclick=()=>{stop();step(-1)};$('reset').onclick=reset;
 $('seek').oninput=()=>{stop();index=+$('seek').value;render()};$('example').onchange=reset;$('lang').onchange=render;
 $('play').onclick=()=>{if(timer)return stop();if(index===data.events.length-1)index=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>step(1),+$('speed').value)};
 $('speed').onchange=()=>{if(timer){stop();$('play').click()}};reset();
 if(window.parent!==window){const report=()=>window.parent.postMessage({type:'algorithm-demo-ready',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');new ResizeObserver(report).observe(document.body);report();}
}

